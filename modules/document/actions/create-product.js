import {
  openFormSidebar
}
from "../../form/open-sidebar-form.js"

import {
  closeSidebarPanel
}
from "../../../js/sidebar-panel.js"

export async function createProduct(ctx){

  const {
    input
  } = ctx

  openFormSidebar({

    table:"data_product",

    onSave:({row})=>{

      if(!input) return

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