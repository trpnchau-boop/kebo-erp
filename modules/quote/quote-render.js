//quote-render.js

import { schema } from "/js/schema/index.js"
import { formatMoney } from "../../js/core/format.js"

import { state } from "./quote-state.js"
import { canField } from "/js/core/field-permission.js"

/* =========================
HEADER
========================= */

export function buildHeader(){

  state.fields =

    Object.entries(

      schema.data_product.fields

    )

    .filter(([,field])=>

      field.showInQuote&&
      canField(field,"view")

    )

  let html = "<tr>"

  for(const [,field] of state.fields){

    html += `
      <th>${field.label}</th>
    `

  }

  html += `
    <th style="width:50px"></th>
  `

  html += "</tr>"

  state.thead.innerHTML = html

}

/* =========================
RENDER
========================= */

export function render(){

  if(!state.items.length){

    state.tbody.innerHTML = `
      <tr>
        <td
          colspan="${state.fields.length+1}"
          style="
            text-align:center;
            padding:40px;
          "
        >
          Chưa có sản phẩm
        </td>
      </tr>
    `

    return

  }

  state.tbody.innerHTML =

    state.items

      .map(buildRow)

      .join("")

}

/* =========================
ROW
========================= */

function buildRow(row){

  let html = `
    <tr data-id="${row.id}">
  `

  for(const [key,field] of state.fields){

    let value = ""

    switch(key){

      case "qty":

        value = `
          <input
            class="quote-qty"
            data-id="${row.id}"
            type="number"
            min="1"
            value="${row.qty}"
          >
        `

        break

      case "note":

        value = `
          <input
            class="quote-note"
            data-id="${row.id}"
            type="text"
            value="${row.note ?? ""}"
            placeholder="Ghi chú"
          >
        `

       break  


      default:

        value =

          renderField(

            row,

            key,

            field

          )

        break

    }

    html += `
      <td data-field="${key}">
        ${value ?? ""}
      </td>
    `

  }

  html += `
    <td class="row-actions">

      <button
        type="button"
        class="icon-btn danger quote-remove"
        data-id="${row.id}"
      >
      </button>

    </td>
  `

  html += "</tr>"

  return html

}

/* =========================
FIELD
========================= */

function renderField(
  row,
  key,
  field
){

  const value =
    row[key]

  if(

    field.type==="image"

  ){

    if(!value){

      return ""

    }

    return `
      <img
        src="${value}"
        class="quote-image"
        data-preview="${value}"
        loading="lazy"
        draggable="false"
      >
    `

  }

  if(

    field.format==="money"

  ){

    return formatMoney(value)

  }

  return value ?? ""

}

/* =========================
UPDATE QTY
========================= */

export function updateQty(
  id,
  qty
){

  const row =

    state.items.find(x=>

      String(x.id)===String(id)

    )

  if(!row){
    return
  }

  row.qty =

    Math.max(

      1,

      Number(qty)||1

    )

}

export function updateNote(id, note){

  const row = state.items.find(
    x => String(x.id) === String(id)
  )

  if(!row){
    return
  }

  row.note = note
}