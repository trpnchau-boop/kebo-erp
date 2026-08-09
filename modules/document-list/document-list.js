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

  const filterTypes =
    schema.filterType
      ? [schema.filterType]
      : types

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

  const summaryTotalMoneyEl =
    root.querySelector(
      "#summary-total-money"
    )

  const summaryLabelEl =
    root.querySelector(
      "#summary-label"
    )

  const summaryValueEl =
    root.querySelector(
      "#summary-total-value"
    )

  const summarySelectedEl =
    root.querySelector(
      "#summary-selected"
    )

  const summarySelectedValueEl =
    root.querySelector(
      "#summary-selected-value"
    )

  const summaryEl =
    root.querySelector(
      ".list-summary"
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

    const selectedProfit =

      selectedRows.reduce(

        (sum,row)=>

          sum +

          (

            Number(row.tongthanhtoan || 0)

            -

            Number(row.tongtienvon || 0)
 
          ),

        0

      )


    const selectedMoney =

      selectedRows.reduce(

        (sum,row)=>

          sum + Number(
            row.tongthanhtoan || 0
          ),

        0

      )

    if(type === "SALE"){

      summaryValueEl.textContent =

        selectedMoney.toLocaleString("vi-VN")

    }

    if(type === "EXPORT"){

      summarySelectedValueEl.textContent =

        selectedProfit.toLocaleString("vi-VN")

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
        types: filterTypes,
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

let summaryValue = 0

renderRows(

  tbody,

  ctx.rows,

  schema

)

summaryEl.hidden =

  !types.some(type=>

    [
      "SALE",
      "IMPORT",
      "SALE_PROFIT",
      "EXPORT"
    ].includes(type)

  )

summaryTotalMoneyEl.textContent =

  totalMoney.toLocaleString("vi-VN")

switch(type){

  case "SALE":

    summaryLabelEl.textContent =
      "Đã chọn:"

    break

  case "EXPORT":

    summaryLabelEl.textContent =
      "Lợi nhuận:"

    summaryValue =

      ctx.rows.reduce(

        (sum,row)=>

          sum +

          (

            Number(row.tongthanhtoan || 0)

            -

            Number(row.tongtienvon || 0)

          ),

        0

      )

    break

  default:

    summaryLabelEl.textContent =
      "Thanh toán:"

    summaryValue =

      ctx.rows.reduce(

        (sum,row)=>

          sum +

          Number(row.tien_tt || 0),

        0

      )

}

if(type === "EXPORT"){

  summarySelectedEl.hidden = false

  summarySelectedValueEl.textContent = "0"

}
else{

  summarySelectedEl.hidden = true

}

summaryValueEl.textContent =

  summaryValue.toLocaleString("vi-VN") 

    ctx.selection.sync()

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