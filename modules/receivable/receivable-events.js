import { state } from "./receivable-state.js"
import {
  reload,
  openCustomer,
  backToCustomers,
  getCustomerDocuments,
  getSelectedCustomer,
  getPaymentFormData,
  filterCustomers
} from "./receivable.js"
import {
  renderCustomers,
  renderPaymentForm,
  closePaymentForm,
  syncAllocationTotal
} from "./receivable-render.js"
import { createReceipt } from "./receivable-payment.js"

let boundRoot = null

export function bindEvents(){
  const root = state.root
  if(!root || boundRoot === root) return
  boundRoot = root

  root.querySelector("#search-input")?.addEventListener("input", e=>{
    state.search = e.target.value || ""

    if(state.mode !== "customers") return
    filterCustomers()
    renderCustomers()
  })

  root.querySelector("#from-date")?.addEventListener("change", e=>{
    state.fromDate = e.target.value || ""
    reload()
  })

  root.querySelector("#to-date")?.addEventListener("change", e=>{
    state.toDate = e.target.value || ""
    reload()
  })

  root.addEventListener("click", async e=>{
    // Click nút Xem → chi tiết đầy đủ + lịch sử thu tiền
    const view = e.target.closest(".receivable-open")

    if(view && state.mode === "customers"){
      const id =
        view.dataset.customerId ||
        view.closest("[data-customer-id]")?.dataset.customerId

      if(id){
        await openCustomer(id, true, true)
      }

      return
    }

    // Click tên KH / dòng KH → chỉ công nợ + chứng từ
    const row = e.target.closest(".receivable-customer-row")

    if(row && state.mode === "customers"){
      const id = row.dataset.customerId

      if(id){
        await openCustomer(id, true, false)
      }

      return
    }

    if(e.target.closest(".receivable-back")){
      backToCustomers()
      return
    }

    const payOne = e.target.closest(".receivable-pay-one")
    if(payOne){
      openPayment(Number(payOne.dataset.documentId))
      return
    }

    if(e.target.closest(".receivable-pay-all")){
      openPayment(null)
      return
    }

    if(e.target.closest(".receivable-payment-close,.receivable-payment-cancel")){
      closePaymentForm()
      return
    }

    if(e.target.closest(".receivable-payment-save")){
      await savePayment()
    }
  })

  root.addEventListener("change", e=>{
    if(e.target.matches(".receivable-allocation-check")){
      syncAllocationTotal()
    }
  })

  root.addEventListener("input", e=>{
    if(e.target.matches(".receivable-allocation-amount")){
      syncAllocationTotal()
    }
  })
}

function openPayment(preselectedId){
  const customer = getSelectedCustomer()
  if(!customer) return

  renderPaymentForm({
    customer,
    documents: getCustomerDocuments(),
    preselectedId
  })
}

async function savePayment(){
  const errorEl = state.root.querySelector("#receivable-payment-error")
  if(errorEl) errorEl.textContent = ""

  const button = state.root.querySelector(".receivable-payment-save")
  if(button) button.disabled = true

  try{
    const payload = getPaymentFormData()
    await createReceipt(payload)

    closePaymentForm()
    await reload()

    alert("Đã thu tiền")
  }catch(error){
    console.error("CREATE RECEIPT", error)

    if(errorEl){
      errorEl.textContent = error.message || "Không thể lưu phiếu thu"
    }else{
      alert(error.message || "Không thể lưu phiếu thu")
    }
  }finally{
    if(button) button.disabled = false
  }
}
