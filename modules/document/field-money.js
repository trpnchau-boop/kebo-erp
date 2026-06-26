//field-money.js//

export function createMoneyField(
  field,
  row = {}
){

  const input =
    document.createElement("input")

  input.type = "text"

  input.value =
    formatMoney(
      row[field.key]
      ??
      field.default
      ??
      0
    )

  input.placeholder =
    field.placeholder
    ||
    ""

  if(field.readonly){

    input.readOnly = true

  }

  input.dataset.key =
    field.key

  input.addEventListener(
    "focus",
    ()=>{

      input.value =
        parseMoney(
          input.value
        )

    }
  )

  input.addEventListener(
    "blur",
    ()=>{

      input.value =
        formatMoney(
          parseMoney(
            input.value
          )
        )

    }
  )

  return input

}

/* =========================================================
HELPER
========================================================= */

function formatMoney(v){

  return Number(v || 0)
  .toLocaleString("vi-VN")

}

function parseMoney(v){

  return Number(
    String(v)
    .replaceAll(".","")
    .replaceAll(",","")
  ) || 0

}