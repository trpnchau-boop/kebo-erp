// modules/stock/stock-save.js

import {
  saveDocument as persistDocument
}
from "../document/actions/save-document.js"

import {
  DOCUMENT_TYPES
}
from "../document/document-types.js"

/* =========================
SAVE DOCUMENT CORE
========================= */

export async function saveDocument(
  type,
  header = {},
  items = []
){

  try{

    /* =========================
    FILTER ITEMS
    ========================= */

    items =

      (items || [])

      .filter(
        x =>
          toNum(x.tongsoluong) !== 0
      )

    if(!items.length){

      alert(
        "Không có dữ liệu để lưu"
      )

      return null

    }

    /* =========================
    HEADER
    ========================= */

    const payload = {

      type,

      status: "draft",

      is_act: true,

      day: today(),

      ...header

    }

    delete payload.id

    /* =========================
    CLEAN FK
    ========================= */

    cleanNullableField(
      payload,
      "id_customer"
    )

    cleanNullableField(
      payload,
      "id_employee"
    )

    cleanNullableField(
      payload,
      "id_warehouse"
    )

    cleanNullableField(
      payload,
      "ref"
    )

    /* =========================
    STOCK LOGIC
    ========================= */

    if(

      type === "TRANSFER"

      ||

      type === "ADJUST"

    ){

      delete payload.id_customer

    }

    /* =========================
    DETAIL
    ========================= */

    const rows =

      items.map((x)=>{

        const row = {

          line:
            toNum(x.line),

          id_product:
            toNullableNum(
              x.id_product
            ),

          parent_id:
            toNullableNum(
              x.parent_id
            ),

          id_warehouse:
            toNullableNum(
              x.id_warehouse
            ),

          qty:
            toNum(x.qty),

          tongsoluong:
            toNum(x.tongsoluong),

          dongia:
            toNum(x.dongia),

          thanhtien:
            toNum(x.thanhtien),

          tienvon:
            toNum(x.tienvon),

          dongiavon:
            toNum(x.dongiavon),

          id_unit:
            toNullableNum(
              x.id_unit
            ),

          name:
            toText(x.name),

          dvtGoc:
            toText(x.dvtGoc),

          note:
            toText(x.note),

          is_act: true

        }

        /* =====================
        CUSTOMER
        ===================== */

        const cid =

          toNullableNum(
            x.id_customer
          )

        if(cid !== null){

          row.id_customer = cid

        }

        return row

      })

    /* =========================
    TOTALS
    ========================= */

    const tongtienvon =

      rows.reduce(

        (sum,x)=>

          sum +

          toNum(
            x.tienvon
          ),

        0

      )

    payload.tongtienvon =
      tongtienvon

    /* =========================
    PERSIST
    ========================= */

    const documentSchema =
      DOCUMENT_TYPES[type]

    if(!documentSchema){

      throw new Error(
        `Unknown document type: ${type}`
      )

    }  

    return await persistDocument({

      root: document.body,

      status: "draft",

      schema: {

        ...documentSchema,

        meta: {

          ...documentSchema.meta,

          table:
            documentSchema.dbTable
            || "document",

          detailTable:
            documentSchema.itemTable
            || "document_items"

        }

      },

      payload: {

        header:
          payload,

        items:
          rows

      }

    })

  }

  catch(err){

    alert(

      "Lỗi lưu chứng từ:\n"

      +

      (err.message || err)

    )

    return null

  }

}

/* =========================
UTIL
========================= */

function toNum(x){

  const n = Number(x)

  return Number.isNaN(n)
    ? 0
    : n

}

function toNullableNum(x){

  if(

    x === null

    ||

    x === undefined

    ||

    x === ""

    ||

    x === "null"

    ||

    x === "undefined"

  ){

    return null

  }

  const n = Number(x)

  return Number.isNaN(n)
    ? null
    : n

}

function toText(x){

  return String(
    x || ""
  ).trim()

}

function cleanNullableField(
  obj,
  key
){

  if(!(key in obj)){
    return
  }

  const v = obj[key]

  if(

    v === null

    ||

    v === undefined

    ||

    v === ""

    ||

    v === "null"

    ||

    v === "undefined"

  ){

    delete obj[key]

  }

}

function today(){

  return new Date()

    .toISOString()

    .slice(0,10)

}