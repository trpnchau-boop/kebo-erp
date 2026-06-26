//modules/kh-money/kh-money-api.js//

import {loadRef}
from "/js/relation-cache.js"

/* =========================================================
LOAD LIST
========================================================= */

export async function getKhMoneyList(){

  const rows =
    await loadRef(
      "set_kh_money"
    )

  return Array.isArray(rows)
    ? rows
    : []

}

/* =========================================================
MAP BY CUSTOMER TYPE
========================================================= */

export async function getKhMoneyMap(){

  const rows =
    await getKhMoneyList()

  const map = {}

  rows.forEach(row=>{

    const key =
      String(
        row.khachhang || ""
      )
      .trim()

    if(!key){
      return
    }

    map[key] = {

      id:
        row.id,

      khachhang:
        row.khachhang,

      set_dongia:
        row.set_dongia,

      fallback:
        row.fallback,

      is_act:
        row.is_act

    }

  })

  return map

}

/* =========================================================
GET POLICY
========================================================= */

export async function getKhMoneyPolicy(
  customerType
){

  if(!customerType){
    return null
  }

  const map =
    await getKhMoneyMap()

  return (

    map[
      String(customerType)
      .trim()
    ]

    ||

    null

  )

}

/* =========================================================
GET PRICE FIELD
========================================================= */

export async function getPriceField(
  customerType
){

  const policy =
    await getKhMoneyPolicy(
      customerType
    )

  return (

    policy?.set_dongia

    ||

    policy?.fallback

    ||

    "dongia"

  )

}

/* =========================================================
RESOLVE PRODUCT PRICE
========================================================= */

export async function resolveProductPrice({

  customerType,

  product

}){

  if(!product){
    return 0
  }

  const policy =
    await getKhMoneyPolicy(
      customerType
    )

  if(!policy){

    return Number(
      product.dongia1 || 0
    )

  }

  /* =====================================================
  MAIN PRICE
  ===================================================== */

  const mainField =
    policy.set_dongia

  let value =
    Number(
      product?.[mainField]
      || 0
    )

  /* =====================================================
  FALLBACK
  ===================================================== */

  if(
    value <= 0 &&
    policy.fallback
  ){

    value =
      Number(
        product?.[
          policy.fallback
        ]
        || 0
      )

  }

  return value

}