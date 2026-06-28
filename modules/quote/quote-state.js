//quote-state.js

import { getAll } from "../../js/crud.js"

export const state = {

  root: null,

  toolbar: null,
  thead: null,
  tbody: null,

  /* dữ liệu */

  products: [],
  customers: [],
  rules: [],

  /* dữ liệu đang thao tác */

  customer: null,
  items: [],

  /* schema */

  fields: []

}

/* =========================
LOAD
========================= */

export async function loadData(){

  const [

    products,

    customers,

    rules

  ] = await Promise.all([

    getAll("data_product"),

    getAll("data_customer"),

    getAll("set_price_rule")

  ])

  state.products = products
  state.customers = customers
  state.rules = rules

}

/* =========================
HELPER
========================= */

export function getProduct(id){

  return state.products.find(x=>String(x.id)===String(id))

}

export function getCustomer(id){

  return state.customers.find(x=>String(x.id)===String(id))

}