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

export async function createEmployee(ctx){

  const {
    input
  } = ctx

  if(!input) return

  /* =========================
  ĐÃ CHỌN NHÂN VIÊN
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

    const employees =

      await loadRef(
        "data_employee"
      )

    const exists =

      employees.some(emp =>

        String(
          emp.name || ""
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

    table:"data_employee",

    onSave:({row})=>{

      const display =
        row.name || ""

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