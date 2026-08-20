import { state } from "./receivable-state.js"
import { createDatepicker } from "/js/ui/init-datepicker.js"
import { bindMoneyInput } from "/js/core/input-format.js"
import { parseMoney } from "/js/core/format.js"

function money(value){
  return Number(value || 0).toLocaleString("vi-VN")
}

function esc(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export function buildHeader(){
  if(!state.thead) return

  state.thead.innerHTML = `
    <tr>
      <th>Khách hàng</th>
      <th>Dư đầu kỳ</th>
      <th>Phát sinh</th>
      <th>Đã thu</th>
      <th>Còn nợ</th>
      <th>Lần bán cuối</th>
      <th style="width:70px"></th>
    </tr>
  `
}

export function renderCustomers(){
  state.mode = "customers"
  buildHeader()
  clearHistory()

  const rows = state.rows || []

  if(!rows.length){
    state.tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:40px">
          Không có khách hàng còn nợ
        </td>
      </tr>
    `
    updateSummary(0, 0, 0)
    return
  }

  state.tbody.innerHTML = rows.map(row=>`
    <tr data-customer-id="${row.id}" class="receivable-customer-row">
      <td>
        <strong>${esc(row.name)}</strong>
      </td>
      <td>${money(row.opening)}</td>
      <td>${money(row.periodAmount)}</td>
      <td>${money(row.periodPaid)}</td>
      <td><strong>${money(row.due)}</strong></td>
      <td>${esc(row.last_day || "")}</td>
      <td>
        <button type="button" class="receivable-open" data-customer-id="${row.id}" title="Xem">
          <img src="/icons/view.svg" alt="Xem">
        </button>
      </td>
    </tr>
  `).join("")

  const total = rows.reduce((s,r)=>s + Number(r.periodAmount || 0), 0)
  const due = rows.reduce((s,r)=>s + Number(r.due || 0), 0)

  updateSummary(total, due, rows.length)
}

export function renderCustomerDetail(){
  const customer = state.selectedCustomer
  if(!customer) return

  state.mode = "detail"

  state.thead.innerHTML = `
    <tr>
      <th>Ngày</th>
      <th>Chứng từ</th>
      <th>Phát sinh</th>
      <th>Đã thu</th>
      <th>Còn nợ</th>
      <th style="width:90px"></th>
    </tr>
  `

  const docs = state.documents || []

  if(!docs.length){
    state.tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:40px">
          Khách hàng không còn chứng từ nợ
        </td>
      </tr>
    `
  }else{
    state.tbody.innerHTML = docs.map(doc=>`
      <tr data-document-id="${doc.id}">
        <td>${esc(doc.day)}</td>
        <td><strong>${esc(doc.code)}</strong></td>
        <td>${money(doc.amount)}</td>
        <td>${money(doc.paid)}</td>
        <td><strong>${money(doc.due)}</strong></td>
        <td>
          <button
            type="button"
            class="receivable-pay-one"
            data-document-id="${doc.id}"
          >
            Thu tiền
          </button>
        </td>
      </tr>
    `).join("")
  }

  const periodDocuments = (state.rawDocuments || [])
    .filter(doc =>
      String(doc.id_customer) === String(customer.id) &&
      (!state.fromDate || String(doc.day) >= state.fromDate) &&
      (!state.toDate || String(doc.day) <= state.toDate)
    )

  const total = periodDocuments.reduce(
    (s,r)=>s + Number(r.tongthanhtoan || 0),
    0
  )

  const due = docs.reduce(
    (s,r)=>s + Number(r.due || 0),
    0
  )

  updateSummary(total, due, docs.length)
  renderDetailToolbar()

  if(state.showHistory){
    renderCustomerPayments()
  }else{
    clearHistory()
  }
}

function renderDetailToolbar(){
  if(!state.actionsEl) return

  state.actionsEl.innerHTML = `
    <button type="button" class="receivable-back">
      Công nợ
    </button>
    <button type="button" class="receivable-pay-all">
      + Phiếu thu
    </button>
  `
}

export function renderCustomerPayments(){
  const container = state.root?.querySelector("#receivable-payment-history")
  if(!container) return

  const payments = state.payments || []

  if(!payments.length){
    container.innerHTML = `
      <div class="receivable-history-empty">
        Chưa có lịch sử thu tiền.
      </div>
    `
    return
  }

  const employeeMap = Object.fromEntries(
    (state.employees || []).map(x=>[String(x.id), x.name])
  )

  const documentMap = Object.fromEntries(
    (state.allCustomerDocuments || []).map(x=>[String(x.id), x])
  )

  const totalPaid = payments.reduce(
    (sum,p)=>sum + Number(p.amount || 0),
    0
  )

  const rows = payments.map(payment=>{
    const allocations = (state.allocations || [])
      .filter(x=>String(x.payment_id) === String(payment.id))

    const allocationTotal = allocations.reduce(
      (sum,a)=>sum + Number(a.amount || 0),
      0
    )

    return `
      <details class="receivable-payment-history-item">
        <summary class="receivable-history-summary">
          <strong>${esc(payment.code)}</strong>
          <span class="receivable-history-date">${esc(payment.day)}</span>
          <strong>${money(payment.amount)}</strong>
        </summary>

        <div class="receivable-history-detail">
          <div><strong>Ngày thu:</strong> ${esc(payment.day)}</div>
          <div><strong>Nhân viên:</strong> ${esc(employeeMap[String(payment.id_employee)] || "") || "--"}</div>
          <div><strong>Ghi chú:</strong> ${esc(payment.note || "") || "--"}</div>

          <div class="receivable-history-allocation-title">
            Phân bổ vào chứng từ
          </div>

          ${allocations.length ? `
            <table class="receivable-history-allocation">
              <thead>
                <tr>
                  <th>Chứng từ</th>
                  <th>Ngày</th>
                  <th>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                ${allocations.map(allocation=>{
                  const doc = documentMap[String(allocation.document_id)]

                  return `
                    <tr>
                      <td><strong>${esc(doc?.code || `#${allocation.document_id}`)}</strong></td>
                      <td>${esc(doc?.day || "")}</td>
                      <td>${money(allocation.amount)}</td>
                    </tr>
                  `
                }).join("")}
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="2">Tổng phân bổ</th>
                  <th>${money(allocationTotal)}</th>
                </tr>
              </tfoot>
            </table>
          ` : `
            <div class="receivable-history-empty">Phiếu thu chưa có phân bổ.</div>
          `}
        </div>
      </details>
    `
  }).join("")

  container.innerHTML = `
    <div class="receivable-history-head">
      <strong>Lịch sử thu tiền</strong>
      <span>Tổng đã thu: <strong>${money(totalPaid)}</strong></span>
    </div>
    <div class="receivable-history-list">
      ${rows}
    </div>
  `
}

export function renderPaymentForm({
  documents,
  customer,
  preselectedId=null,
  root=state.root,
  employees=state.employees || []
}){

  closePaymentForm(root)

  const available =
    (documents || [])
      .filter(
        x => Number(x.due) > 0
      )

  const selected =
    preselectedId
      ? available.filter(
          x =>
            String(x.id) ===
            String(preselectedId)
        )
      : []


  const html = `
    <div
      class="receivable-overlay"
      id="receivable-payment-overlay"
    >

      <div class="receivable-payment-modal">

        <div class="receivable-payment-head">

          <strong>
            Thu tiền — ${esc(customer.name)}
          </strong>

          <button
            type="button"
            class="receivable-payment-close"
          >
            ×
          </button>

          <button
            type="button"
            class="receivable-payment-cancel"
          >
            Hủy
          </button>

          <button
            type="button"
            class="receivable-payment-save"
          >
            Lưu phiếu
          </button>

        </div>


        <div class="receivable-payment-form">

          <div class="receivable-payment-grid">

            <label>
              Ngày

              <input
                id="receivable-payment-day"
                type="text"
                placeholder="yyyy-mm-dd"
                value="${today()}"
              >
            </label>


            <label>
              Nhân viên

              <select
                id="receivable-payment-employee"
              >

                <option value="">
                  -- Không chọn --
                </option>

                ${employees.map(e => `
                  <option value="${e.id}">
                    ${esc(e.name)}
                  </option>
                `).join("")}

              </select>

            </label>

            <label>
              Ghi chú

              <input
                id="receivable-payment-note"
                type="text"
              >
            </label>

            <label>
              Số tiền thu

              <input
                id="receivable-payment-amount"
                type="text"
                data-format="money"
              >
            </label>

          </div>


          <div class="receivable-allocation-title">
            Phân bổ vào chứng từ
          </div>


          <div class="receivable-allocation-list">

            ${available.map(doc => {

              const isChecked =
                selected.some(
                  x =>
                    String(x.id) ===
                    String(doc.id)
                )

              return `

                <div
                  class="receivable-allocation-row"
                >

                  <label>

                    <input
                      type="checkbox"
                      class="receivable-allocation-check"
                      data-document-id="${doc.id}"
                      ${isChecked ? "checked" : ""}
                    >

                    <span>
                      ${esc(doc.code)}
                    </span>

                    <small>
                      ${esc(doc.day)}
                      <span>·</span>
                      Còn ${money(doc.due)}
                    </small>

                  </label>


                  <input
                    type="text"
                    class="receivable-allocation-amount"
                    data-format="money"
                    data-document-id="${doc.id}"
                    min="0"
                    max="${Number(doc.due)}"
                    step="0.01"
                    value="${isChecked ? money(doc.due) : "0"}"
                  >

                </div>

              `

            }).join("")}

          </div>


          <div class="receivable-payment-total">

            Tổng phân bổ:

            <strong
              id="receivable-allocation-total"
            >
              0
            </strong>

          </div>


          <div
            class="receivable-payment-error"
            id="receivable-payment-error"
          ></div>

        </div>

      </div>

    </div>
  `


  root.insertAdjacentHTML(
    "beforeend",
    html
  )


  bindMoneyInput(
    root.querySelector(
      "#receivable-payment-amount"
    )
  )


  root
    .querySelectorAll(
      ".receivable-allocation-amount"
    )
    .forEach(
      input =>
        bindMoneyInput(input)
    )


  createDatepicker(
    root,
    "#receivable-payment-day",
    null,
    {
      side:"left",
      direction:"top"
    }
  )


  state.paymentOpen = true


  syncAllocationTotal(
    root
  )
}

export function closePaymentForm(
  root=state.root
){

  root
    ?.querySelector(
      "#receivable-payment-overlay"
    )
    ?.remove()

  state.paymentOpen = false
}

export function updateSummary(total, due, count){
  const totalEl = state.root?.querySelector("#document-list-total")
  const selectedEl = state.root?.querySelector("#document-list-selected")
  const totalMoney = state.root?.querySelector("#summary-total-money")
  const summaryValue = state.root?.querySelector("#summary-total-value")
  const label = state.root?.querySelector("#summary-label")

  if(totalEl) totalEl.textContent = count
  if(selectedEl) selectedEl.textContent = 0
  if(totalMoney) totalMoney.textContent = money(total)
  if(summaryValue) summaryValue.textContent = money(due)
  if(label) label.textContent = "Còn nợ:"
}

export function syncAllocationTotal(
  root=state.root
){

  if(!root) return

  let total = 0

  root
    .querySelectorAll(
      ".receivable-allocation-check"
    )
    .forEach(check => {

      if(!check.checked){
        return
      }

      const input =
        root.querySelector(
          `.receivable-allocation-amount[data-document-id="${check.dataset.documentId}"]`
        )

      total += parseMoney(input?.value) || 0

    })


  const el =
    root.querySelector(
      "#receivable-allocation-total"
    )

  if(el){

    el.textContent =
      money(total)

  }
}

function clearHistory(){
  if(state.historyEl){
    state.historyEl.innerHTML = ""
  }
}

function today(){
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}
