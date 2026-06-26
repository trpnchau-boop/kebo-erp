import {
  openFormSidebar
}
from "../../form/open-sidebar-form.js"

import {
  closeSidebarPanel
}
from "../../../js/sidebar-panel.js"

import {
  loadRef
}
from "/js/relation-cache.js"

export async function createCustomer(ctx){

  const {
    input
  } = ctx

  if(!input) return

  /* =========================
  ĐÃ CHỌN KHÁCH HÀNG
  ========================= */

  if(
    input.dataset.value
  ){
    return
  }

  /* =========================
  KIỂM TRA TRÙNG TÊN
  ========================= */

  const keyword =

    String(
      input.value || ""
    )

    .trim()
    .toLowerCase()

  if(keyword){

    const customers =

      await loadRef(
        "data_customer"
      )

    const exists =

      customers.some(customer =>

        String(
          customer.name || ""
        )

        .trim()
        .toLowerCase()

        ===

        keyword

      )

    if(exists){
      return
    }

  }

  /* =========================
  CREATE FORM
  ========================= */

  openFormSidebar({

    table:"data_customer",

    onSave:({row})=>{

      const display =

        [
          row.code,
          row.name
        ]

        .filter(Boolean)

        .join(" - ")

      /* =========================
      INPUT UI
      ========================= */

      input.dataset.value =
        row.id || ""

      input.value =
        display

      /* =========================
      ROW STATE
      ========================= */

      const rowData =
        input._row

      if(rowData){

        rowData[
          input.dataset.field
        ] =
          row.id || ""

        rowData[
          input.dataset.field
          + "_text"
        ] =
          display

      }

      /* =========================
      TRIGGER
      ========================= */

      input.dispatchEvent(

        new Event(
          "change",
          {
            bubbles:true
          }
        )

      )

      closeSidebarPanel()

      requestAnimationFrame(()=>{

        input.focus()

      })

    }

  })

}