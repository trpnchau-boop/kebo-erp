import { formatMoney }
from "/js/core/format.js"

export function setFieldValue(
  input,
  field,
  row,
  state
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

  /* =========================
  LOOKUP
  ========================= */

  if(
    field.type === "lookup"
  ){

    input.dataset.value =
      row[key] ?? ""

    // XML Preview: chưa ghép sản phẩm
    if(
      key === "id_product" &&
      state?.xmlPreview === true &&
      !row.id_product
    ){

      input.value =
        row.name || ""

      input.readOnly = true

      input.title =
        "Tên hàng lấy từ XML - chưa ghép sản phẩm"

    }else{

      input.value =
        row[key + "_text"]
        ??
        ""

    }

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

  if(field.type === "number"){

    return Number(
        String(input.value)
            .trim()
            .replace(",", ".")
    ) || 0

  }

  if(field.type==="money"){

    return Number(
        String(input.value)
            .replaceAll(".","")
            .replace(",",".")
    ) || 0

  }

  /* =========================
  DEFAULT
  ========================= */

  return input.value
}