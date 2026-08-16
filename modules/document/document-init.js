import {
  renderDocumentForm
}
from "./document-form.js"

import {
  renderInputBar
}
from "./document-input.js"

import {
  renderDocumentTable
}
from "./document-table.js"

import {
  renderActions
}
from "./document-render-actions.js"

import {
  bindDocumentActions
}
from "./document-bind-actions.js"

import {
  loadDocument
}
from "./document-load.js"

import {
  initSummaryBar
}
from "./document-summary-bar.js"

import {
  openStandaloneReceipt
}
from "../receivable/receivable-standalone.js"

import {
  loadCustomerDebt
}
from "../receivable/receivable-load.js"


export async function initDocument(
  root,
  schema,
  route
){

  const state = route.state

  if(!state){
    console.error(
      "initDocument: missing state"
    )
    return
  }


  /* =====================================================
     STATE
  ===================================================== */

  state.schema = schema
  state.root = root

  root._docState = state


  /* =====================================================
     MỞ PHIẾU THU TỪ CÔNG NỢ KH
  ===================================================== */

  if(!root._documentReceiptHandler){

    root._documentReceiptHandler =
      async e => {

        const customerId =
          e.detail?.customerId

        if(!customerId){
          console.warn(
            "document-open-receipt: missing customerId"
          )
          return
        }

        try{

          await openStandaloneReceipt({
            customerId,
            root
          })

        }catch(error){

          console.error(
            "OPEN STANDALONE RECEIPT",
            error
          )

          alert(
            error?.message ||
            "Không thể mở form thu tiền"
          )

        }

      }


    window.addEventListener(
      "document-open-receipt",
      root._documentReceiptHandler
    )

  }


  /* =====================================================
     CẬP NHẬT CÔNG NỢ SAU KHI THU
  ===================================================== */

  if(!root._documentReceivableUpdated){

    root._documentReceivableUpdated =
      async e => {

        const customerId =
          e.detail?.customerId

        if(!customerId){
          return
        }

        try{

          const debt =
            await loadCustomerDebt(
              customerId
            )


          /* =========================
             STATE
          ========================= */

          state.header.no_khachhang =
            debt


          /* =========================
             INPUT
          ========================= */

          const input =
            root.querySelector(
              '[data-key="no_khachhang"]'
            )

          if(input){

            input.value =
              Number(
                debt || 0
              ).toLocaleString(
                "vi-VN"
              )

          }

        }catch(error){

          console.error(
            "UPDATE CUSTOMER DEBT",
            error
          )

        }

      }


    window.addEventListener(
      "document-receivable-updated",
      root._documentReceivableUpdated
    )

  }


  /* =====================================================
     LOAD DOCUMENT
  ===================================================== */

  const id =
    route.id


  if(id){

    await loadDocument(
      id,
      schema,
      state
    )


    /* =================================================
       EXPORT / CREATE FROM EXISTING
    ================================================= */

    if(route.action === "create"){

      const sourceId =
        state.header.id

      state.header.ref =
        sourceId

      state.header.id =
        null

      state.header.code =
        `${schema.meta.prefix}...`


      state.items.forEach(
        item => {

          item.id = null
          item.id_doc = null

        }
      )

    }

  }


  /* =====================================================
     CREATE NEW DOCUMENT
  ===================================================== */

  else{

    state.header = {}
    state.items = []
    state.draftRow = {}


    state.header.type =
      schema.meta.code

    state.header.code =
      `${schema.meta.prefix}...`

    state.header.day =
      new Date()
        .toISOString()
        .slice(0,10)

  }


  /* =====================================================
     RENDER FORM
  ===================================================== */

  renderDocumentForm(
    root,
    schema,
    state.header,
    state
  )


  /* =====================================================
     ACTIONS
  ===================================================== */

  renderActions(
    root,
    schema
  )


  /* =====================================================
     INPUT BAR
  ===================================================== */

  renderInputBar(
    root,
    schema,
    state
  )


  /* =====================================================
     TABLE
  ===================================================== */

  renderDocumentTable(
    root,
    schema,
    state
  )


  /* =====================================================
     SUMMARY
  ===================================================== */

  initSummaryBar(
    root,
    state
  )


  /* =====================================================
     ACTION EVENTS
  ===================================================== */

  bindDocumentActions({
    root,
    schema
  })

}