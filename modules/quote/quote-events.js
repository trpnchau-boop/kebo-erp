import { state } from "./quote-state.js"

import {
  createSuggestBox,
  renderSuggest
}
from "/js/suggest.js"

import {
  render,
  updateQty,
  updateNote
}
from "./quote-render.js"

import {
  addProduct,
  removeProduct,
  refreshQuotePrice
}
from "./quote-price.js"

import {
  openImagePreview
}
from "/js/image-preview.js"

import {
  saveDraft
} from "./quote-draft.js"

import {
  shareQuote
}
from "./quote-share.js"
/* =========================
INIT
========================= */

let customerBox
let productBox

/* =========================
BIND
========================= */

export function bindEvents(){

  const customerInput =
    $("customer")

  const productInput =
    $("search-product")

  customerBox =
    createSuggestBox(customerInput)

  productBox =
    createSuggestBox(productInput)

  customerInput.addEventListener(
    "input",
    onCustomerInput
  )

  productInput.addEventListener(
    "input",
    onProductInput
  )

  state.tbody.addEventListener(
    "input",
    onQtyInput
  )

  state.tbody.addEventListener(
    "click",
    onTableClick
  )

  $("btn-save-draft")
  ?.addEventListener(
    "click",
    saveDraft
  )
  
  $("btn-share-selected")
  ?.addEventListener(
    "click",
    shareQuote
  )
}

/* =========================
CUSTOMER
========================= */

function onCustomerInput(e){

  const q =
    e.target.value.trim()

  const list =

    state.customers

      .filter(customer=>

        matchSearch(

          customer,

          q,

          [
            "code",
            "name",
            "phone"
          ]

        )

      )

      .slice(0,20)

  renderSuggest(

    customerBox,

    list.map(customer=>({

      ...customer,

      label:

        buildDisplayName(

          [
            "code",
            "name"
          ],

          customer

        )

    })),

    customer=>{

      state.customer =
        customer

      $("customer").value =

        buildDisplayName(

          [
            "code",
            "name"
          ],

          customer

        )

      refreshQuotePrice()

      render()

    }

  )

}

/* =========================
PRODUCT
========================= */

function onProductInput(e){

  const q =
    e.target.value.trim()

  const list =

    state.products

      .filter(product=>

        matchSearch(

          product,

          q,

          [
            "code",
            "name",
            "barcode"
          ]

        )

      )

      .slice(0,20)

  renderSuggest(

    productBox,

    list.map(product=>({

      ...product,

      label:

        buildDisplayName(

          [
            "code",
            "name"
          ],

          product

        )

    })),

    product=>{

      addProduct(product)

      render()

      $("search-product").value = ""

      $("search-product").focus()

    }

  )

}

/* =========================
QTY
========================= */

function onQtyInput(e){

  const qty = e.target.closest(".quote-qty")

  if(qty){

    updateQty(
      qty.dataset.id,
      qty.value
    )

    render()

    return
  }

  const note = e.target.closest(".quote-note")

  if(note){

    updateNote(
      note.dataset.id,
      note.value
    )

    return
  }

}

/* =========================
CLICK
========================= */

function onTableClick(e){

  const img =

    e.target.closest(

      ".quote-image"

    )

  if(img){

    openImagePreview(

      img.dataset.preview

    )

    return

  }

  const btn =

    e.target.closest(

      ".quote-remove"

    )

  if(btn){

    removeProduct(

      btn.dataset.id

    )

    render()

  }

}

/* =========================
HELPER
========================= */

function buildDisplayName(
  fields=[],
  data={}
){

  return fields

    .map(key=>data[key])

    .filter(Boolean)

    .join(" - ")

}

function matchSearch(
  data={},
  keyword="",
  fields=[]
){

  const q =

    String(keyword)

      .toLowerCase()

      .trim()

  return fields.some(key=>

    String(data[key]||"")

      .toLowerCase()

      .includes(q)

  )

}

function $(id){

  return state.root.querySelector(

    `#${id}`

  )

}