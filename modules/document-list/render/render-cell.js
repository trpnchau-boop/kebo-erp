// render/render-cell.js

import {
  applyFormat
}
from "/js/core/format-apply.js"

import {
  editDocument
}
from "../services/document-edit.js"

import {
  renderDropdownSelect
}
from "/js/components/dropdown-select.js"

export function renderCell({
  row,
  key,
  field
}){

  /* =========================
  INPUT
  ========================= */

  if(field?.input){

    if(
      field.input.type ===
      "select"
    ){

      return renderSelectCell({
        row,
        key,
        field
      })

    }

    return renderInputCell({
      row,
      key,
      field
    })

  }

  /* =========================
  VALUE
  ========================= */

  let value =

    row[
      key + "_text"
    ]

    ??

    row[key]

  /* =========================
  CUSTOM RENDER
  ========================= */

  if(field?.render){

    value = field.render(
      value,
      row
    )

  }

  else{

    value = applyFormat(
      value,
      field
    )

  }

  /* =========================
  CODE LINK
  ========================= */

  if(key === "code"){

    value = `

      <a

        href="#"

        class="barcode-link"

        data-edit-id="${row.id}"

      >

        ${value ?? ""}

      </a>
   
    `

  }

  /* =========================
  HTML
  ========================= */

  return `

    <td

      class="
        ${field?.align || ""}
      "

      data-field="${key}"

      data-label="${
        field?.label || key
      }"
    >

      ${value ?? ""}

    </td>

  `

}

/* =========================================================
INPUT CELL
========================================================= */

function renderInputCell({
  row,
  key,
  field
}){

  return `

    <td

      class="
        ${field?.align || ""}
      "

      data-field="${key}"

      data-label="${
        field?.label || key
      }"
    >

      <input

        type="text"

        inputmode="numeric"

        class="
          table-input
          ${getInputColorClass(
            row,
            key
          )}  
        "

        data-id="${row.id}"

        data-field="${key}"

        value="${
          applyFormat(
            row[key],
            field
          ) || 0
        }"
      >

    </td>

  `

}

function renderSelectCell({
  row,
  key,
  field
}){

  const options =
    field.input.options || []

  return `

    <td

      data-field="${key}"

      data-label="${
        field?.label || key
      }"
    >

      ${renderDropdownSelect({

        value:row[key],

        options,

        rowId:row.id,

        field:key,

        className:
          key === "id_employee"
          ? "employee-select"
          : "",
        
        emptyText:
          key === "id_employee"
          ? ""
          : "Tất cả kho"

      })}

    </td>

  `
}

function getInputColorClass(
  row,
  key
){

  if(
    key !== "tien_tt"
  ){
    return ""
  }

  const tong =

    Number(
      row.tongthanhtoan
    ) || 0

  const paid =

    Number(
      row.tien_tt
    ) || 0

  if(
    paid >= tong
  ){
    return "money-green"
  }

  return "money-red"

}