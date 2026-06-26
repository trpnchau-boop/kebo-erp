// modules/document-list/services/release/release-load.js

import {
  db
}
from "/js/supabase.js"

import {
  loadRef
}
from "/js/relation-cache.js"

import {
  renderReleaseRows
}
from "./release-render.js"

export async function loadReleaseDocuments(){

  const ids = JSON.parse(

    localStorage.getItem(
      "release_ids"
    )

    || "[]"

  )

  if(!ids.length){

    alert(
      "Không có chứng từ"
    )

    return []

  }

  /* =====================================
  LOAD DOCUMENTS
  ===================================== */

  const {
    data,
    error
  }

  = await db

    .from("document")

    .select(`

      *,

      document_items(*)

    `)

    .in(
      "id",
      ids
    )

  if(error){

    console.error(
      "LOAD RELEASE ERROR:",
      error
    )

    return []

  }

  /* =====================================
  LOAD REFS
  ===================================== */

  const customers =

    await loadRef(
      "data_customer"
    )

  const {
    data: stocks
  }

  = await db

    .from("vw_stock")

    .select(
      "id_product, qty_balance"
    )  


  const stockMap = {}

  ;(stocks || []).forEach(stock=>{

    stockMap[
      stock.id_product
    ] = stock.qty_balance || 0

  })  
  /* =====================================
  MAP CUSTOMER TEXT
  ===================================== */

  const rows =

    (data || [])

    .map(doc=>{

      const customer =

        customers.find(item=>

          String(item.id)

          ===

          String(
            doc.id_customer
          )

        )

  return {

    ...doc,

    document_items:

      (doc.document_items || [])

        .map(item=>({

          ...item,

          qty_balance:

            stockMap[
              item.id_product
            ] || 0

        })),

    customer_name:
      customer?.name || "",

    tax_code:
      customer?.mst || "",

    address:
      customer?.add || "",

    donvi:
      customer?.donvi || ""

  }

    })

  renderReleaseRows(
    rows
  )

  /* =====================================
  RETURN
  ===================================== */

  return rows

}