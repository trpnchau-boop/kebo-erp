import { state, resetDetail } from "./receivable-state.js"
import {
  loadReceivableData,
  loadEmployees,
  loadCustomerDocuments,
  loadCustomerPayments,
  loadCustomerAllocations
} from "./receivable-load.js"
import {
  buildHeader,
  renderCustomers,
  renderCustomerDetail,
  renderPaymentForm,
  closePaymentForm,
  syncAllocationTotal
} from "./receivable-render.js"
import { bindEvents } from "./receivable-events.js"

import { createDatepicker } from "/js/ui/init-datepicker.js"
import { parseMoney } from "/js/core/format.js"

export async function init(route, root){
  state.root = root
  state.thead = root.querySelector("#document-list-head")
  state.tbody = root.querySelector("#document-list-body")
  state.actionsEl = root.querySelector("#list-actions")
  state.historyEl = root.querySelector("#receivable-payment-history")

  state.search = ""
  state.mode = "customers"
  state.loading = false

  setDefaultDates()

  createDatepicker(state.root, "#from-date", ({ formattedDate })=>{
    state.fromDate = formattedDate
    reload()
  })

  createDatepicker(state.root, "#to-date", ({ formattedDate })=>{
    state.toDate = formattedDate
    reload()
  })

  bindEvents()
  buildHeader()

  try{
    state.employees = await loadEmployees()
    await reload()
  }catch(error){
    console.error("RECEIVABLE INIT", error)
    alert(error.message || "Không tải được công nợ")
  }
}

export async function reload(){
  if(state.loading) return

  state.loading = true

  try{
    const data = await loadReceivableData()

    state.documents = data.documents
    state.customers = data.customers
    state.payments = data.payments
    state.allocations = data.allocations

    state.rawDocuments = data.documents
    state.rawPayments = data.payments
    state.rawAllocations = data.allocations

    buildCustomerRows()

    if(state.mode === "detail" && state.selectedCustomer){
      await openCustomer(
        state.selectedCustomer.id, 
        true,
        state.showHistory
      )
    }else{
      filterCustomers()
      renderCustomers()
    }
  }catch(error){
    console.error("RECEIVABLE RELOAD", error)
    alert(error.message || "Không tải được công nợ")
  }finally{
    state.loading = false
  }
}

export function buildCustomerRows(){
  const documents = state.rawDocuments || []
  const payments = state.rawPayments || []
  const allocations = state.rawAllocations || []

  const fromDate = state.fromDate
  const toDate = state.toDate

  const customerMap = Object.fromEntries(
    (state.customers || []).map(x => [
      String(x.id),
      x
    ])
  )

  const paymentMap = Object.fromEntries(
    payments.map(x => [
      String(x.id),
      x
    ])
  )

  // Tổng tiền đã phân bổ cho từng chứng từ
  const paidByDocument = {}

  // Tổng tiền đã thu theo khách trước kỳ / trong kỳ
  const paidBeforeByCustomer = {}
  const paidInPeriodByCustomer = {}

  for(const allocation of allocations){

    const payment =
      paymentMap[String(allocation.payment_id)]

    if(!payment) continue
    if(payment.type !== "RECEIPT") continue
    if(payment.status !== "posted") continue

    const amount =
      Number(allocation.amount || 0)

    const documentId =
      String(allocation.document_id)

    paidByDocument[documentId] =
      Number(paidByDocument[documentId] || 0) +
      amount

    const customerId =
      String(payment.id_customer)

    const paymentDay =
      String(payment.day || "")

    // Thu trước kỳ
    if(
      fromDate &&
      paymentDay < fromDate
    ){
      paidBeforeByCustomer[customerId] =
        Number(paidBeforeByCustomer[customerId] || 0) +
        amount
    }

    // Thu trong kỳ
    const inPeriod =
      (!fromDate || paymentDay >= fromDate) &&
      (!toDate || paymentDay <= toDate)

    if(inPeriod){
      paidInPeriodByCustomer[customerId] =
        Number(paidInPeriodByCustomer[customerId] || 0) +
        amount
    }
  }

  const map = {}

  for(const doc of documents){

    const customer =
      customerMap[String(doc.id_customer)]

    if(!customer) continue

    const customerId =
      String(doc.id_customer)

    if(!map[customerId]){
      map[customerId] = {
        id: doc.id_customer,
        code: customer.code,
        name: customer.name,
        phone: customer.phone,

        opening: 0,
        periodAmount: 0,
        periodPaid: 0,
        due: 0,

        last_day: ""
      }
    }

    const row = map[customerId]

    const amount =
      Number(doc.tongthanhtoan || 0)

    const day =
      String(doc.day || "")

    /*
     * 1. DƯ ĐẦU KỲ
     *
     * Chỉ lấy SALE trước Từ ngày.
     */
    if(
      fromDate &&
      day < fromDate
    ){
      row.opening += amount
    }

    /*
     * 2. PHÁT SINH TRONG KỲ
     */
    const inPeriod =
      (!fromDate || day >= fromDate) &&
      (!toDate || day <= toDate)

    if(inPeriod){
      row.periodAmount += amount
    }

    /*
     * 3. Lần bán cuối
     *
     * Chỉ xét đến Đến ngày.
     */
    if(
      (!toDate || day <= toDate) &&
      (!row.last_day || day > row.last_day)
    ){
      row.last_day = day
    }
  }

  /*
   * 4. Trừ tiền đã thu trước kỳ
   *
   * Dư đầu kỳ thực chất là:
   *
   * SALE trước kỳ
   * -
   * tiền đã thu trước kỳ
   */
  for(const row of Object.values(map)){

    const customerId =
      String(row.id)

    row.opening =
      Math.max(
        Number(row.opening || 0) -
        Number(paidBeforeByCustomer[customerId] || 0),
        0
      )

    row.periodPaid =
      Number(
        paidInPeriodByCustomer[customerId] || 0
      )

    /*
     * 5. CÒN NỢ CUỐI KỲ
     */
    row.due =
      Number(row.opening || 0) +
      Number(row.periodAmount || 0) -
      Number(row.periodPaid || 0)

    if(row.due < 0){
      row.due = 0
    }
  }

  state.allRows = Object.values(map)
    .filter(x => x.due > 0)
    .sort((a,b) => b.due - a.due)

  state.rows = [...state.allRows]
}

export function filterCustomers(){
  const q = String(state.search || "").trim().toLowerCase()

  if(!q){
    state.rows = [...(state.allRows || [])]
    return
  }

  state.rows = (state.allRows || []).filter(row=>[
    row.code,
    row.name,
    row.phone
  ].filter(Boolean).some(value=>
    String(value).toLowerCase().includes(q)
  ))
}

export async function openCustomer(
  id,
  render = true,
  showHistory = false
){
  const customer = (state.customers || []).find(
    x=>String(x.id) === String(id)
  )

  if(!customer) return

  state.selectedCustomer = customer
  state.mode = "detail"
  state.showHistory = showHistory

  // Toàn bộ chứng từ để phục vụ lịch sử phân bổ.
  const allDocuments = await loadCustomerDocuments(id)
  state.allCustomerDocuments = allDocuments

  // Lịch sử thu tiền của khách.
  const payments = await loadCustomerPayments(id)
  const allocations = await loadCustomerAllocations(
    payments.map(x=>x.id)
  )

  state.payments = payments
  state.allocations = allocations

  // Danh sách hiện tại chỉ hiển thị khoản còn nợ.
  const allocationByDocument = sumAllocationsByDocument(
    payments,
    allocations
  )

  state.documents = allDocuments
    .map(doc=>{
      const paid = Number(allocationByDocument[String(doc.id)] || 0)
      const amount = Number(doc.tongthanhtoan || 0)

      return {
        ...doc,
        amount,
        paid,
        due: Math.max(amount - paid, 0)
      }
    })
    .filter(x=>x.due > 0)

  if(render){
    renderCustomerDetail()
  }
}

function sumAllocationsByDocument(payments, allocations){
  const paymentMap = Object.fromEntries(
    (payments || []).map(x=>[String(x.id), x])
  )

  const result = {}

  for(const allocation of allocations || []){
    const payment = paymentMap[String(allocation.payment_id)]
    if(payment?.type !== "RECEIPT" || payment?.status !== "posted") continue

    const documentId = String(allocation.document_id)
    result[documentId] =
      Number(result[documentId] || 0) +
      Number(allocation.amount || 0)
  }

  return result
}

export function backToCustomers(){
  closePaymentForm()
  resetDetail()
  buildCustomerRows()
  filterCustomers()
  renderCustomers()

  if(state.actionsEl){
    state.actionsEl.innerHTML = ""
  }
}

export function getCustomerDocuments(){
  return state.documents || []
}

export function getSelectedCustomer(){
  return state.selectedCustomer
}

export function getPaymentFormData(){
  const root = state.root

  const amount = parseMoney(
    root.querySelector("#receivable-payment-amount")?.value
  ) || 0

  const allocations = []

  root.querySelectorAll(".receivable-allocation-check:checked")
    .forEach(check=>{
      const input = root.querySelector(
        `.receivable-allocation-amount[data-document-id="${check.dataset.documentId}"]`
      )

      const value = parseMoney(input?.value) || 0

      if(value > 0){
        allocations.push({
          document_id: Number(check.dataset.documentId),
          amount: value
        })
      }
    })

  return {
    day: root.querySelector("#receivable-payment-day")?.value || "",
    idCustomer: state.selectedCustomer?.id,
    idEmployee: root.querySelector("#receivable-payment-employee")?.value || null,
    amount,
    note: root.querySelector("#receivable-payment-note")?.value || "",
    allocations
  }
}

function setDefaultDates(){
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`

  state.fromDate = monthStart
  state.toDate = today

  const from = state.root.querySelector("#from-date")
  const to = state.root.querySelector("#to-date")

  if(from) from.value = monthStart
  if(to) to.value = today
}

export {
  renderPaymentForm,
  closePaymentForm,
  syncAllocationTotal
}
