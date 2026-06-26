import { formatMoney }
from "/js/core/format.js"

export function setFieldValue(
  input,
  field,
  row
){

  const key =
    field.key

  /* =========================
  CHECKBOX
  ========================= */

  if(
    field.type === "checkbox"
  ){

    input.checked =
      Boolean(row[key])

    return

  }

  /* =========================
  MONEY
  ========================= */

  if(
    field.type === "money"
  ){

    input.value =
      formatMoney(
        Number(row[key] || 0)
      )

    return

  }

  /* =========================
  LOOKUP
  ========================= */

  if(
    field.type === "lookup"
  ){

    input.dataset.value =
      row[key] ?? ""

    input.value =
      row[key + "_text"]
      ??
      ""

    return

  }

  /* =========================
  SELECT
  ========================= */

  if(
    field.type === "select"
  ){

    input.value =
      row[key] ?? ""

    return

  }

  /* =========================
  DEFAULT
  ========================= */

  input.value =
    row[key] ?? ""

}

export function getFieldValue(
  input,
  field
){

  /* =========================
  CHECKBOX
  ========================= */

  if(
    field.type === "checkbox"
  ){

    return input.checked
  }

  /* =========================
  LOOKUP
  ========================= */

  if(
    field.type === "lookup"
  ){

    return input.dataset.value || ""
  }

  /* =========================
  SELECT
  ========================= */

  if(
    field.type === "select"
  ){

    return input.value ?? ""
  }

  /* =========================
  MONEY / NUMBER
  ========================= */

  if(
    field.type === "money"
    ||
    field.type === "number"
  ){

    return Number(

      String(
        input.value ?? ""
      )
        .replaceAll(".","")
        .replaceAll(",","")

    ) || 0
  }

  /* =========================
  DEFAULT
  ========================= */

  return input.value
}