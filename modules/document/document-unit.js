//document-unit.js//

import {loadRef}
from "/js/relation-cache.js"

/* =========================================================
CACHE
========================================================= */

let productsCache = null
let unitsCache = null

/* =========================================================
LOAD CACHE
========================================================= */

async function ensureCache(){

  if(
    productsCache
    &&
    unitsCache
  ){
    return
  }

  const [

    products,

    units

  ] = await Promise.all([

    loadRef(
      "data_product"
    ),

    loadRef(
      "product_unit"
    )

  ])

  productsCache =
    Array.isArray(products)
    ? products
    : []

  unitsCache =
    Array.isArray(units)
    ? units
    : []

}

/* =========================================================
GET PRODUCT
========================================================= */

export async function getProduct(
  productId
){

  await ensureCache()

  return productsCache.find(

    p =>

      String(p.id)

      ===

      String(productId)

  )

}

/* =========================================================
GET PRODUCT UNITS
========================================================= */

export async function getProductUnits(
  productId
){

  await ensureCache()

  if(!productId){
    return []
  }

  return unitsCache.filter(

    u =>

      String(u.id_sp)

      ===

      String(productId)

  )

}

/* =========================================================
NORMALIZE
========================================================= */

function normalizeLabel(
  value
){

  return String(value || "")

    .replace(/\s+/g," ")

    .trim()

}

/* =========================================================
LOAD UNIT OPTIONS
========================================================= */

export async function loadUnitOptions(
  row
){

  if(!row.id_product){
    return []
  }

  const product =
    await getProduct(
      row.id_product
    )

  if(!product){
    return []
  }

  const units =
    await getProductUnits(
      row.id_product
    )

  const map =
    new Map()


  /* =====================================================
  EXTRA UNITS
  ===================================================== */

  units.forEach(unit=>{

    const label =

      normalizeLabel(
        unit.unit
      )

    if(!label){
      return
    }

    const key =
      label.toLowerCase()

    if(map.has(key)){
      return
    }

    map.set(key,{

      value:
        unit.id || label,

      label,

      ratio:
        Number(
          unit.ratio || 1
        ),

      isRoot:false

    })

  })

  return [
    ...map.values()
  ]

}

/* =========================================================
REFRESH UNIT SELECT
========================================================= */

export async function refreshUnitSelect(
  input,
  row,
  mode = "table"
){

  const refreshId =
    String(Date.now())

  input.dataset.refreshId =
    refreshId

  const options =
    await loadUnitOptions(row)

  if(
    input.dataset.refreshId !== refreshId
  ){
    return
  }

  const selectedOption =
    options.find(
      x =>
        String(x.value)
        ===
        String(row.id_unit)
    )

  /* =====================================================
  INPUT BAR MODE
  - id_unit = "" vẫn phải hiện dvtGoc
  ===================================================== */
  if(mode === "input"){

    const displayOptions = [
      {
        value: "",
        label: row.dvtGoc || "ĐVT gốc",
        ratio: 1,
        isRoot: true
      },
      ...options
    ]

    const currentValue =
      selectedOption
        ? selectedOption.value
        : ""

        if(input.setOptions){

  input.setOptions(displayOptions)
  input.value = currentValue

  if(typeof input.setDisplayText === "function"){

    if(!currentValue){
      input.setDisplayText(
        row.dvtGoc || "ĐVT gốc"
      )
    }else{
      input.setDisplayText(null)
    }
  }

  row.ratio = getSelectedRatio(input)
  return
}

    const html =
      displayOptions.map(opt=>`

        <option
          value="${opt.value}"
          data-ratio="${
            Number(opt.ratio || 1)
          }"
          data-is-root="${
            opt.isRoot ? "1" : "0"
          }"
          ${
            String(opt.value)
            ===
            String(currentValue)
              ? "selected"
              : ""
          }
        >
          ${opt.label}
        </option>

      `).join("")

    input.blur()
    input.innerHTML = html
    row.ratio = getSelectedRatio(input)
    return
  }

  /* =====================================================
  TABLE MODE
  - vẫn có option ĐVT gốc trong dropdown
  - nhưng nếu id_unit = "" thì UI cột ĐVT phải rỗng
  ===================================================== */

  const displayOptions = [
    {
      value: "",
      label: row.dvtGoc || "ĐVT gốc",
      ratio: 1,
      isRoot: true
    },
    ...options
  ]

  const valid =
    options.some(
      x =>
        String(x.value)
        ===
        String(row.id_unit)
    )

  const tableSelectedValue =
    valid
      ? row.id_unit
      : ""

if(input.setOptions){

  input.setOptions(displayOptions)
  input.value = tableSelectedValue || ""

  if(typeof input.setDisplayText === "function"){

    if(!tableSelectedValue){
      input.setDisplayText("")
    }else{
      input.setDisplayText(null)
    }
  }

  row.ratio = getSelectedRatio(input)
  return
}

  const html =
    displayOptions.map(opt=>`

      <option
        value="${opt.value}"
        data-ratio="${
          Number(opt.ratio || 1)
        }"
        data-is-root="${
          opt.isRoot ? "1" : "0"
        }"
        ${
          String(opt.value)
          ===
          String(tableSelectedValue)
            ? "selected"
            : ""
        }
      >
        ${opt.label}
      </option>

    `).join("")

  input.blur()
  input.innerHTML = html
  row.ratio = getSelectedRatio(input)
}

/* =========================================================
GET SELECTED RATIO
========================================================= */

export function getSelectedRatio(input){

  const option =
    input.selectedOptions?.[0]

  if(!option){
    return 1
  }

  /* =========================================
  CUSTOM SELECT OPTION OBJECT
  ========================================= */

  if(
    typeof option === "object"
    &&
    "ratio" in option
  ){
    return Number(
      option.ratio || 1
    )
  }

  /* =========================================
  NATIVE OPTION ELEMENT
  ========================================= */

  return Number(
    option.dataset?.ratio || 1
  )

}

/* =========================================================
SYNC ROW RATIO
========================================================= */

export function syncRowRatio(

  input,

  row

){

  row.ratio =
    getSelectedRatio(
      input
    )

}

/* =========================================================
GET UNIT LABEL
========================================================= */

export function getSelectedUnitLabel(
  input
){

  const option =

    input.selectedOptions?.[0]

  return (
    option?.textContent
    ||
    ""
  )

}

/* =========================================================
GET ROOT UNIT OPTION
- tìm option đơn vị gốc theo row.dvtGoc
========================================================= */

export async function getRootUnitOption(
  row
){

  const options =
    await loadUnitOptions(row)

  const rootLabel =
    normalizeLabel(row.dvtGoc)
      .toLowerCase()

  if(!rootLabel){
    return null
  }

  return (
    options.find(opt =>

      normalizeLabel(opt.label)
        .toLowerCase()

      ===

      rootLabel

    )
    || null
  )
}