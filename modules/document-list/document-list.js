// modules/document-list/document-list.js

import {
  DOCUMENT_LIST_TYPES
}
from "./schema/document-list-types.js"

import {
  documentFields
}
from "./schema/document-fields.js"

import {
  renderHead,
  renderRows,
  renderBulkActions
}
from "./render/document-list-render.js"

import {
  renderToolbarActions,
  bindToolbarActions
}
from "./bind/document-list-toolbar-actions.js"

import {
  bindRowActions
}
from "./bind/document-list-row-actions.js"

import {
  createTableSelection
}
from "/js/core/table-selection.js"

import {
  bindBulkActions
}
from "./bind/document-list-bulk-actions.js"

import {
  bindTableInputs
}
from "./bind/document-list-input.js"

import {
  bindSearch
}
from "./bind/document-list-search.js"

import {
  loadDocuments,
  loadOptions
}
from "./document-list-load.js"

import {
  createDatepicker
}
from "/js/ui/init-datepicker.js"

import {
  bindDropdownMenus
}
from "/js/components/dropdown-menu.js"

import {
  bindDropdownSelect
}
from "/js/components/dropdown-select.js"

export async function init(
  route,
  root
){

  const thead =
    root.querySelector(
      "#document-list-head"
    )

  const tbody =
    root.querySelector(
      "#document-list-body"
    )

  const actionsEl =
    root.querySelector(
      "#list-actions"
    )

  const type =
    route.type || "SALE"

  const types =

    type

    .split(",")

    .map(v=>v.trim())

  const employees =

    await loadOptions(
      "data_employee"
    )

  documentFields
    .id_employee
    .input
    .options =

      employees.map(a=>({

        value:a.id,

        label:a.name

      }))  

  const schema =

    DOCUMENT_LIST_TYPES[
      types[0]
    ]

  if(!schema){

    console.error(
      "Schema not found:",
      type
    )

    return

  }

  /* =========================
  RENDER
  ========================= */

  renderHead(
    thead,
    schema
  )

  renderToolbarActions(
    actionsEl,
    schema
  )

  renderBulkActions(
    actionsEl,
    schema
  )

const now = new Date()

const monthStart =
  `${now.getFullYear()}-${
    String(now.getMonth() + 1).padStart(2, "0")
  }-01`

const today =
  `${now.getFullYear()}-${
    String(now.getMonth() + 1).padStart(2, "0")
  }-${
    String(now.getDate()).padStart(2, "0")
  }`

root.querySelector("#from-date").value = monthStart
root.querySelector("#to-date").value = today

createDatepicker(
  root,
  "#from-date",
  ({ formattedDate })=>{
    ctx.fromDate = formattedDate || ""
    reload()
  },
  { side:"left" }
)

createDatepicker(
  root,
  "#to-date",
  ({ formattedDate })=>{
    ctx.toDate = formattedDate || ""
    reload()
  },
  { side:"right" }
)

  /* =========================
  CTX
  ========================= */

  const ctx = {
    root,
    target:root,

    thead,
    tbody,

    type,
    types,

    schema,
    table:schema.table,

    rows:[],
    search:"",
    fromDate: monthStart,
    toDate: today,

    reload
  }

  ctx.container = actionsEl

const totalEl =
  root.querySelector(
    "#document-list-total"
  )

const selectedEl =
  root.querySelector(
    "#document-list-selected"
  )

const selectedInfoEl =
  root.querySelector(
    "#document-list-selected-info"
  )

const selectedMoneyEl =
  root.querySelector(
    "#document-list-selected-money"
  )

const summaryTotalMoneyEl =
  root.querySelector(
    "#summary-total-money"
  )

const summaryTotalPaidEl =
  root.querySelector(
    "#summary-total-paid"
  )  

ctx.selection = createTableSelection({

  thead,
  tbody,

  onChange({
    ids,
    count,
    total
  }){

    if(totalEl){
      totalEl.textContent = total
    }

    if(selectedEl){
      selectedEl.textContent = count
    }

    const selectedIds = new Set(ids)

    const selectedRows =

      ctx.rows.filter(

        row => selectedIds.has(String(row.id))

      )

    const selectedMoney =

      selectedRows.reduce(

        (sum,row)=>

          sum + Number(
            row.tongthanhtoan || 0
          ),

        0

      )

    if(selectedInfoEl){

      selectedInfoEl.hidden =
        count === 0

    }

    if(selectedMoneyEl){

      selectedMoneyEl.textContent =

        selectedMoney.toLocaleString("vi-VN")

    }

  }

})

  /* =========================
  TOOLBAR
  bind 1 lần
  ========================= */

  bindToolbarActions(ctx)
  bindSearch(ctx)
  bindDropdownMenus(root)

  /* =========================
  FIRST LOAD
  ========================= */

  await reload()

  /* =========================
  RELOAD
  ========================= */

  async function reload(){

    ctx.rows =

      await loadDocuments({
        schema,
        types,
        status:
          ctx.status || "",
        search:
          ctx.search || "" ,

        fromDate:
          ctx.fromDate || "",
        toDate:
          ctx.toDate || ""     
      })

    const totalMoney =

      ctx.rows.reduce(

        (sum, row)=>

          sum + Number(row.tongthanhtoan || 0),

        0

      )

    const totalPaid =

      ctx.rows.reduce(

        (sum, row)=>

          sum + Number(row.tien_tt || 0),

        0

      ) 

    renderRows(

      tbody,

      ctx.rows,

      schema

    )

    summaryTotalMoneyEl.textContent =

      totalMoney.toLocaleString("vi-VN")

    summaryTotalPaidEl.textContent =

      totalPaid.toLocaleString("vi-VN")

    ctx.selection.sync()

    if(selectedInfoEl){

      selectedInfoEl.hidden = true

    }

    /* =====================
    RE-BIND
    ===================== */
    
    bindDropdownSelect(tbody)

    bindRowActions(ctx)

    bindBulkActions(ctx)

    bindTableInputs({

      tbody

    })


  }

}