// modules/document-list/bind/document-list-input.js

import {
  db
}
from "/js/supabase.js"

import {
  documentFields
}
from "../schema/document-fields.js"

/* =========================================================
BIND
========================================================= */

export function bindTableInputs({
  tbody
}){

  if(tbody.__inputsBound)
    return

  tbody.__inputsBound = true

  tbody.addEventListener(
    "change",
    handleChange
  )

  tbody.addEventListener(
  "input",
  e=>{

    const input =

      e.target.closest(
        ".table-input"
      )

    if(!input)
      return

    if(
      input.dataset.field !==
      "tien_tt"
    )
      return

    updatePaymentColor(
      input.closest("tr")
    )

  }
)

}

/* =========================================================
CHANGE
========================================================= */

async function handleChange(e){

  const control =

    e.target.closest(
      ".table-input,.table-select,.dropdown-select-trigger"
    )

  if(!control)
    return

  const tr =
    control.closest("tr")

  const rowId =
    tr.dataset.id

  const key =
    control.dataset.field

  const field =
    documentFields[key]

  if(!field?.input)
    return

  /* =====================
  VALUE
  ===================== */

  const value =

    getControlValue(
      control,
      field
    )

  /* =====================
  ROW DATA
  ===================== */

  const row =

    getRowData(tr)

  /* =====================
  PAYLOAD
  ===================== */

  const payload =

    field.input.update(
      row,
      value
    )

  updateRowUI({
    tr,
    payload
  })

  if(
    payload.tien_tt !== undefined
  ){
    updatePaymentColor(tr)
    updatePaymentButton(tr)
  }

  if(
    control.classList.contains(
      "table-select"
    )
  ){
    control.classList.toggle(
      "empty-select",
      !control.value
    )
  }

  /* =====================
  DB
  ===================== */

  const {
    error
  }

  = await db

    .from("document")

    .update(payload)

    .eq(
      "id",
      rowId
    )

  if(error){

    console.error(error)

    return

  }

  /* =====================
  UI
  ===================== */

  updateRowUI({
    tr,
    payload
  })

  if(
    payload.tien_tt !== undefined
  ){
    updatePaymentColor(tr)
    updatePaymentButton(tr)
  }

  if(
    control.classList.contains(
      "table-select"
    )
  ){

    control.classList.toggle(
      "empty-select",
      !control.value
    )

}
}

/* =========================================================
CONTROL VALUE
========================================================= */

function getControlValue(
  control,
  field
){
  
  if(
    control.classList.contains(
      "dropdown-select-trigger"
    )
  ){

    return (

      control.dataset.value === ""

      ? null

      : Number(
          control.dataset.value
        )

    )

  }

  if(
    field.input.type ===
    "select"
  ){

    return (

      control.value === ""

      ? null

      : Number(
          control.value
        )

    )

  }

  return Number(

    String(control.value)

    .replaceAll(".", "")
    .replaceAll(",", "")

  ) || 0

}

/* =========================================================
ROW DATA
========================================================= */

function getRowData(tr){

  const row = {}

  tr.querySelectorAll(
    "[data-field]"
  )

  .forEach(cell=>{

    const key =
      cell.dataset.field

    const control =

      cell.querySelector(
        "input,select,.dropdown-select-trigger"
      )

    /* -------------------
    INPUT / SELECT
    ------------------- */

    if(control){
      
      if(
        control.classList.contains(
          "dropdown-select-trigger"
        )
      ){
        
        row[key] =
          control.dataset.value === ""
          ? null
          : Number(
            control.dataset.value
          )
      }
      else if(
        control.tagName ===
        "SELECT"
      ){

        row[key] =

          control.value === ""

          ? null

          : Number(
              control.value
            )

      }

      else{

        row[key] =

          Number(

            String(control.value)

            .replaceAll(".", "")
            .replaceAll(",", "")

          ) || 0

      }

      return

    }

    /* -------------------
    TEXT CELL
    ------------------- */

    const text =

      cell.textContent
        ?.trim()

      || ""

    const num =

      Number(

        text

        .replaceAll(".", "")
        .replaceAll(",", "")

      )

    row[key] =

      Number.isNaN(num)

      ? text

      : num

  })

  return row

}

/* =========================================================
UPDATE UI
========================================================= */

function updateRowUI({
  tr,
  payload
}){

  Object.entries(payload)

  .forEach(([key,value])=>{

    const cell =

      tr.querySelector(
        `[data-field="${key}"]`
      )

    if(!cell)
      return

    const field =
      documentFields[key]

    const control =

      cell.querySelector(
        "input,select,.dropdown-select-trigger"
      )

    /* -------------------
    INPUT / SELECT
    ------------------- */

    if(control){

      if(
        control.classList.contains(
          "dropdown-select-trigger"
        )
      ){

        control.dataset.value =
          value ?? ""

        return

      }

      if(
        field?.format ===
        "money"
      ){
        control.value =
          Number(value)
          .toLocaleString("vi-VN")
      }
      else{
        control.value =
          value ?? ""
      }
      if(
        control.classList.contains(
          "table-select"
        )
      ){

        control.classList.toggle(
          "empty-select",
          !control.value
        )
      }

      return
    }


    /* -------------------
    TEXT CELL
    ------------------- */

    if(
      field?.format ===
      "money"
    ){

      cell.textContent =

        Number(value)

        .toLocaleString(
          "vi-VN"
        )

      return

    }

    if(
      payload.tien_tt !== undefined
    ){

      updatePaymentColor(tr)

    }

    cell.textContent =
      value ?? ""

  })

}
function updatePaymentColor(tr){

  const tongCell =

    tr.querySelector(
      '[data-field="tongthanhtoan"]'
    )

  const tong =

    Number(

      String(
        tongCell.textContent
      )

      .replaceAll(".","")
      .replaceAll(",","")

    ) || 0

  const input =

    tr.querySelector(
      '[data-field="tien_tt"] input'
    )

  if(!input)
    return

  const paid =

    Number(

      String(input.value)

      .replaceAll(".","")
      .replaceAll(",","")

    ) || 0

  input.classList.remove(
    "money-red",
    "money-green"
  )

  if(
    paid >= tong
  ){

    input.classList.add(
      "money-green"
    )

  }

  else{

    input.classList.add(
      "money-red"
    )

  }

}

function updatePaymentButton(tr){

  const tong = Number(
    String(
      tr.querySelector(
        '[data-field="tongthanhtoan"]'
      ).textContent
    )
    .replaceAll(".","")
    .replaceAll(",","")
  ) || 0

  const paid = Number(
    String(
      tr.querySelector(
        '[data-field="tien_tt"] input'
      ).value
    )
    .replaceAll(".","")
    .replaceAll(",","")
  ) || 0

  const btn =

    tr.querySelector(
      '[data-row-action="payment"]'
    )

  if(!btn)
    return

  btn.classList.toggle(
    "payment-green",
    tong > 0 &&
    paid === tong
  )

}