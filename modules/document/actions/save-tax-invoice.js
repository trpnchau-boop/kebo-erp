//save-tax-invoice.js//

import {
  buildDocumentPayload
}
from "../document-payload.js"

import {
  db
}
from "/js/supabase.js"

import {
  generateDocumentCode
}
from "../document-generate-code.js"

export async function saveTaxInvoice({

  schema,
  state,
  status = "draft",
  sourceId = null,

  /* =========================================
  OPTIONAL SNAPSHOT
  ========================================= */

  header = null,
  items = null

}){

  /* =========================================
  SOURCE DATA
  ========================================= */

  const sourceHeader =
    header || state?.header || {}

  const sourceItems =
    items || state?.items || []

  /* =========================================
  PAYLOAD
  ========================================= */

  const payload =

    buildDocumentPayload({

      schema,

      header:
        sourceHeader,

      items:
        sourceItems

    })

  /* =========================================
  HEADER
  ========================================= */

  payload.header.type =
    "ISSUE"

  payload.header.status =
    status

  payload.header.ref =
    sourceId

  /* =========================================
  DEFAULT DAY
  ========================================= */

  if(
    !payload.header.day
  ){

    payload.header.day =

      new Date()

      .toISOString()

      .slice(0,10)

  }

  /* =========================================
  FIND EXISTING TAX INVOICE
  ========================================= */

  let invoiceId = null
  let existingInvoice = null

  if(sourceId){

    const {
      data:exists,
      error:existsError
    }

    = await db

      .from("tax_invoice")

      .select("id, code")

      .eq("ref", sourceId)

      .maybeSingle()

    if(existsError){

      console.error(
        "CHECK TAX INVOICE ERROR",
        JSON.stringify(
          existsError,
          null,
          2
        )
      )

      return
    }

    existingInvoice =
      exists || null

    invoiceId =
      exists?.id || null

  }

  /* =========================================
  KEEP / GENERATE CODE
  ========================================= */

  if(invoiceId){

    payload.header.code =
      existingInvoice?.code
      ||
      payload.header.code
      ||
      null

  }else{

    payload.header.code =

      await generateDocumentCode({

        meta:{
          table:"tax_invoice",
          prefix:"PH"
        }

      })

  }

  let headerData =
    null

  /* =========================================
  UPDATE
  ========================================= */

  if(invoiceId){

    const {

      data,
      error

    }

    = await db

      .from("tax_invoice")

      .update(
        payload.header
      )

      .eq(
        "id",
        invoiceId
      )

      .select()

      .single()

    if(error){

      console.error(
        "UPDATE TAX INVOICE ERROR",
        JSON.stringify(
          error,
          null,
          2
        )
      )

      return

    }

    headerData =
      data

    /* =====================================
    DELETE OLD ITEMS
    ===================================== */

    const {

      error:deleteError

    }

    = await db

      .from("tax_invoice_items")

      .delete()

      .eq(
        "id_doc",
        invoiceId
      )

    if(deleteError){

      console.error(
        "DELETE TAX ITEMS ERROR",
        JSON.stringify(
          deleteError,
          null,
          2
        )
      )

      return

    }

  }

  /* =========================================
  INSERT
  ========================================= */

  else{

    const {

      data,
      error

    }

    = await db

      .from("tax_invoice")

      .insert([
        payload.header
      ])

      .select()

      .single()

    if(error){

      console.error(
        "INSERT TAX INVOICE ERROR",
        JSON.stringify(
          error,
          null,
          2
        )
      )

      return

    }

    headerData =
      data

  }

  /* =========================================
  VALIDATE HEADER
  ========================================= */

  if(
    !headerData
  ){

    console.error(
      "TAX INVOICE HEADER EMPTY"
    )

    return

  }

  /* =========================================
  FINAL DOC ID
  ========================================= */

  const finalDocId =

    headerData.id

  /* =========================================
  ITEMS PAYLOAD
  ========================================= */

  const itemsPayload =

    payload.items.map(item=>({

      ...item,

      id_doc:
        finalDocId,

      id_customer:
        payload.header
        ?.id_customer

    }))

  /* =========================================
  REMOVE SYSTEM FIELDS
  ========================================= */

  itemsPayload.forEach(item=>{

    delete item.id
    delete item.created_at
    delete item.updated_at

  })

  /* =========================================
  INSERT ITEMS
  ========================================= */

  const {

    data:itemData,
    error:itemError

  }

  = await db

    .from("tax_invoice_items")

    .insert(
      itemsPayload
    )

    .select()

  if(itemError){

    console.error(
      "TAX ITEMS ERROR",
      JSON.stringify(
        itemError,
        null,
        2
      )
    )

    return

  }

  /* =========================================
  SUCCESS
  ========================================= */

  return {

    header:
      headerData,

    items:
      itemData

  }

}