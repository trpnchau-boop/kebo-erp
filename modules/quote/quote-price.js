///quote-price.js

import { state } from "./quote-state.js"

/* =========================
ADD PRODUCT
========================= */

export function addProduct(product){

  if(!product){
    return
  }

  let row =

    state.items.find(x=>

      String(x.id)===String(product.id)

    )

  /* =======================
  ĐÃ CÓ
  ======================= */

  if(row){

    row.qty++


    return

  }

  /* =======================
  THÊM MỚI
  ======================= */

  const newRow = {
    ...product,
    qty: 1,
    note: ""
  }

  applyQuotePrice(newRow)

  newRow.qty = 1

  state.items.push(newRow)


}

/* =========================
REMOVE
========================= */

export function removeProduct(id){

  state.items =

    state.items.filter(x=>

      String(x.id)!==String(id)

    )


}


/* =========================
FIND RULE
========================= */

function findRule(customer, product){

  return state.rules.find(rule=>

    matchRule(
      rule,
      customer,
      product
    )

  ) || null

}
/* =========================
MATCH
========================= */

function matchRule(rule, customer, product){

  if(rule.module !== "QUOTE"){
    return false
  }

  if(
    rule.customer_type &&
    String(rule.customer_type) !==
    String(customer?.customer_type)
  ){

    return false
  }

  if(
    rule.product_group &&
    String(rule.product_group) !==
    String(product.id_group)
  ){

    return false
  }


  return true
}

export function refreshQuotePrice(){

  state.items.forEach(row=>{

    applyQuotePrice(row)

  })


}

export function applyQuotePrice(product){

  const customer = state.customer

  const rule =
    findRule(customer, product)

  if(!rule){

    product.dongia1 =
      Number(product.dongia1) || 0

    return
  }

  product.dongia1 =

    (Number(
      product[rule.price_field]
    ) || 0)

    +

    (Number(rule.adjust) || 0)

}