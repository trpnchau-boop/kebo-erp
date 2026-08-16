import { db } from "/js/supabase.js"
import {
  parseMoney
} from "/js/core/format.js"

import { loadEmployees } from "./receivable-load.js"

import {
  renderPaymentForm,
  closePaymentForm,
  syncAllocationTotal
} from "./receivable-render.js"

import { createReceipt } from "./receivable-payment.js"


/* =========================================================
   MỞ FORM THU TIỀN ĐỘC LẬP
========================================================= */

export async function openStandaloneReceipt({
  customerId,
  root
}){

  if(!customerId || !root){
    return
  }

  /* =======================================================
     KHÁCH HÀNG
  ======================================================= */

  const {
    data: customer,
    error: customerError
  } = await db
    .from("data_customer")
    .select("id,code,name,phone")
    .eq("id", customerId)
    .single()

  if(customerError){
    throw customerError
  }


  /* =======================================================
     CHỨNG TỪ SALE
  ======================================================= */

  const {
    data: documents,
    error: documentError
  } = await db
    .from("document")
    .select(
      "id,code,day,type,status,id_customer,tongthanhtoan,note"
    )
    .eq("type", "SALE")
    .eq("status", "posted")
    .eq("id_customer", customerId)
    .order("day", { ascending:false })
    .order("id", { ascending:false })

  if(documentError){
    throw documentError
  }


  /* =======================================================
     LẤY PHÂN BỔ
  ======================================================= */

  const documentIds =
    (documents || []).map(
      x => x.id
    )

  let allocations = []
  let payments = []

  if(documentIds.length){

    const {
      data: paymentAllocations,
      error: allocationError
    } = await db
      .from("payment_allocation")
      .select(
        "payment_id,document_id,amount"
      )
      .in(
        "document_id",
        documentIds
      )

    if(allocationError){
      throw allocationError
    }

    allocations =
      paymentAllocations || []


    /* ================================================
       LẤY PHIẾU THU LIÊN QUAN
    ================================================ */

    const paymentIds =
      [
        ...new Set(
          allocations.map(
            x => x.payment_id
          )
        )
      ]

    if(paymentIds.length){

      const {
        data,
        error
      } = await db
        .from("payment")
        .select(
          "id,type,status,id_customer"
        )
        .in(
          "id",
          paymentIds
        )

      if(error){
        throw error
      }

      payments =
        data || []
    }
  }


  /* =======================================================
     TÍNH ĐÃ THU THEO CHỨNG TỪ
  ======================================================= */

  const paymentMap =
    Object.fromEntries(
      payments.map(
        x => [
          String(x.id),
          x
        ]
      )
    )

  const paidByDocument = {}


  for(const allocation of allocations){

    const payment =
      paymentMap[
        String(
          allocation.payment_id
        )
      ]

    if(
      payment?.type !== "RECEIPT" ||
      payment?.status !== "posted"
    ){
      continue
    }

    const documentId =
      String(
        allocation.document_id
      )

    paidByDocument[documentId] =
      Number(
        paidByDocument[documentId] || 0
      ) +
      Number(
        allocation.amount || 0
      )
  }


  /* =======================================================
     CHỈ LẤY CHỨNG TỪ CÒN NỢ
  ======================================================= */

  const availableDocuments =
    (documents || [])
      .map(doc => {

        const amount =
          Number(
            doc.tongthanhtoan || 0
          )

        const paid =
          Number(
            paidByDocument[
              String(doc.id)
            ] || 0
          )

        return {
          ...doc,
          amount,
          paid,
          due:Math.max(
            amount - paid,
            0
          )
        }

      })
      .filter(
        x => x.due > 0
      )


  /* =======================================================
     NHÂN VIÊN
  ======================================================= */

  const employees =
    await loadEmployees()


  /* =======================================================
     RENDER FORM
  ======================================================= */

  renderPaymentForm({
    documents:availableDocuments,
    customer,
    preselectedId:null,
    root,
    employees
  })


  /* =======================================================
     BIND EVENT RIÊNG CHO FORM NÀY
  ======================================================= */

  bindStandaloneEvents(
    root,
    customerId
  )
}


/* =========================================================
   EVENT FORM ĐỘC LẬP
========================================================= */

function bindStandaloneEvents(
  root,
  customerId
){

  const overlay =
    root.querySelector(
      "#receivable-payment-overlay"
    )

  if(!overlay){
    return
  }


  /* =======================================================
     HỦY / ĐÓNG
  ======================================================= */

  overlay.addEventListener(
    "click",
    e => {

      if(
        e.target.closest(
          ".receivable-payment-close," +
          ".receivable-payment-cancel"
        )
      ){

        closePaymentForm(root)

      }

    }
  )


  /* =======================================================
     LƯU
  ======================================================= */

  overlay
    .querySelector(
      ".receivable-payment-save"
    )
    ?.addEventListener(
      "click",
      async () => {

        await saveStandalonePayment(
          root,
          customerId
        )

      }
    )


  /* =======================================================
     CHECKBOX PHÂN BỔ
  ======================================================= */

  overlay.addEventListener(
    "change",
    e => {

      if(
        e.target.matches(
          ".receivable-allocation-check"
        )
      ){

        syncAllocationTotal(
          root
        )

      }

    }
  )


  /* =======================================================
     SỐ TIỀN PHÂN BỔ
  ======================================================= */

  overlay.addEventListener(
    "input",
    e => {

      if(
        e.target.matches(
          ".receivable-allocation-amount"
        )
      ){

        syncAllocationTotal(
          root
        )

      }

    }
  )
}


/* =========================================================
   LƯU PHIẾU THU
========================================================= */

async function saveStandalonePayment(
  root,
  customerId
){

  const errorEl =
    root.querySelector(
      "#receivable-payment-error"
    )

  const button =
    root.querySelector(
      ".receivable-payment-save"
    )

  if(errorEl){
    errorEl.textContent = ""
  }

  if(button){
    button.disabled = true
  }

  try{

    const amount =
      parseMoney(
        root
          .querySelector(
            "#receivable-payment-amount"
          )
          ?.value || 0
      ) || 0


    const allocations = []


    root
      .querySelectorAll(
        ".receivable-allocation-check:checked"
      )
      .forEach(check => {

        const input =
          root.querySelector(
            `.receivable-allocation-amount[data-document-id="${check.dataset.documentId}"]`
          )

        const value =
          parseMoney(
            input?.value
          ) || 0

        if(value > 0){

          allocations.push({
            document_id:
              Number(
                check.dataset.documentId
              ),

            amount:value
          })

        }

      })


    const payload = {

      day:
        root
          .querySelector(
            "#receivable-payment-day"
          )
          ?.value || "",

      idCustomer:
        customerId,

      idEmployee:
        root
          .querySelector(
            "#receivable-payment-employee"
          )
          ?.value || null,

      amount,

      note:
        root
          .querySelector(
            "#receivable-payment-note"
          )
          ?.value || "",

      allocations

    }


    /* ================================================
       DÙNG CHUNG LOGIC LƯU PHIẾU THU
    ================================================ */

    await createReceipt(
      payload
    )


    /* ================================================
       ĐÓNG FORM
    ================================================ */

    closePaymentForm(
      root
    )


    /* ================================================
       BÁO CHO DOCUMENT
    ================================================ */

    root.dispatchEvent(
      new CustomEvent(
        "document-receivable-updated",
        {
          bubbles:true,

          detail:{
            customerId
          }
        }
      )
    )

  }catch(error){

    console.error(
      "STANDALONE RECEIPT",
      error
    )

    if(errorEl){

      errorEl.textContent =
        error.message ||
        "Không thể lưu phiếu thu"

    }else{

      alert(
        error.message ||
        "Không thể lưu phiếu thu"
      )

    }

  }finally{

    if(button){
      button.disabled = false
    }

  }
}