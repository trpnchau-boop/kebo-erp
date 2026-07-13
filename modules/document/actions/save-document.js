//save-document.js//

import {
  buildDocumentPayload
}
from "../document-payload.js"

import {
  db
}
from "/js/supabase.js"

import {
  createDerivedDocument
}
from "./create-derived-document.js"

import {
  saveTaxInvoice
}
from "./save-tax-invoice.js"

import {
  generateDocumentCode
}
from "../document-generate-code.js"

export async function saveDocument({
  root,
  schema,
  state,
  status = "draft",
  payload: externalPayload = null
}){

  if(!state){
    console.error(
      "saveDocument: missing state"
    )
    return
  }

  /* =====================================================
  PAYLOAD
  ===================================================== */

  const payload =

    externalPayload ||

    buildDocumentPayload({

      schema,

      header:
        state.header,

      items:
        state.items

    })

  /* =====================================================
  HEADER
  ===================================================== */

  payload.header.type =

    state.header.type ||

    schema.meta.code

  payload.header.status =
    status

  /* =====================================================
  DEFAULT DAY
  ===================================================== */

  if(
    !payload.header.day
  ){

    payload.header.day =

      new Date()

      .toISOString()

      .slice(0,10)

  }

  /* =====================================================
  DOC ID
  ===================================================== */

  const docId =
    state.header.id

  let headerData = null

  /* =====================================================
  UPDATE
  ===================================================== */

  if(docId){

    const {
      data,
      error
    }

    = await db

      .from(
        schema.meta.table
      )

      .update(
        payload.header
      )

      .eq(
        "id",
        docId
      )

      .select()

      .single()

    if(error){

      console.error(
        "UPDATE ERROR",
        error
      )

      return
    }

    headerData = data

    /* =================================================
    DELETE OLD ITEMS
    ================================================= */

    const {
      error:deleteError
    }

    = await db

      .from(
        schema.meta.detailTable
      )

      .delete()

      .eq(
        "id_doc",
        docId
      )

    if(deleteError){

      console.error(
        "DELETE ITEMS ERROR",
        deleteError
      )

      return
    }

  }

  /* =====================================================
  INSERT
  ===================================================== */

  else{

    const code =

      String(
        payload.header.code || ""
      )

    if(
      !code
      ||
      code.includes("...")
    ){

      payload.header.code =

        await generateDocumentCode(
          schema
        )

    }

    const {
      data,
      error
    }

    = await db

      .from(
        schema.meta.table
      )

      .insert([
        payload.header
      ])

      .select()

      .single()

    if(error){

      console.error(
        "INSERT ERROR",
        error
      )

      return
    }

    headerData = data

    state.header.id =
      data.id

    state.header.code =
      data.code

  }

  /* =====================================================
  VALIDATE HEADER
  ===================================================== */

  if(!headerData){

    console.error(
      "HEADER DATA EMPTY"
    )

    return
  }

  /* =====================================================
  FINAL DOC ID
  ===================================================== */

  const finalDocId =
    headerData.id

  /* =====================================================
  ITEMS PAYLOAD
  ===================================================== */

  const itemsPayload =

    payload.items.map(item=>({

      ...item,

      id_doc:
        finalDocId,

      id_customer:
        payload.header
          ?.id_customer

    }))

  /* =====================================================
  INSERT ITEMS
  ===================================================== */

  let itemData = []

  if(itemsPayload.length){

    const {
      data,
      error
    }

    = await db

      .from(
        schema.meta.detailTable
      )

      .insert(
        itemsPayload
      )

      .select()

    if(error){

      console.error(
        "ITEM SAVE ERROR",
        error
      )

      return
    }

    itemData = data || []

  }

  /* =====================================================
  UPDATE PRODUCT COST
  ===================================================== */

  if (headerData.type === "IMPORT") {

    const { error } = await db.rpc(
      "fn_apply_cost_import_simple_day",
      {
        p_doc_id: finalDocId
      }
    )

    if (error) {
      console.error(
        "UPDATE IMPORT COST ERROR",
        error
      )
    }

  }

  /* =====================================================
  AUTO WORKFLOW
  ===================================================== */

  if(
    state.header.auto_export
  ){

    await createDerivedDocument({

      schema,

      type:"EXPORT",

      ref:
        finalDocId,

      header:
        headerData,

      items:
        itemData

    })

    await createDerivedDocument({

      schema,

      type:"INVOICE",

      ref:
        finalDocId,

      header:
        headerData,

      items:
        itemData

    })

  }

  /* =====================================================
  TAX INVOICE
  ===================================================== */

  if(
    state.header.publish_invoice
  ){

    await saveTaxInvoice({

      schema,
      state,
      status,

      sourceId:
        finalDocId,

      header:
        headerData,

      items:
        itemData

    })

  }

  /* =====================================================
  SUCCESS
  ===================================================== */

  return {
    header: headerData,
    items: itemData
  }

}