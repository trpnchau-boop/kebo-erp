// update-derived-document.js

import {
  db
}
from "/js/supabase.js"

import {
  buildDocumentPayload
}
from "../document-payload.js"

export async function updateDerivedDocument({

  schema,

  type,

  ref,

  header,

  items

}){

  /* =========================================
  FIND DOCUMENT
  ========================================= */

  const {

    data:doc,

    error:findError

  }

  = await db

    .from("document")

    .select(`id, status`)

    .eq("ref", ref)

    .eq("type", type)

    .maybeSingle()

  if(findError){

    console.error(
      "FIND DERIVED ERROR",
      findError
    )

    return

  }

  if(!doc){

    return null

  }

  /* =========================================
  POSTED
  ========================================= */

  if(doc.status === "posted"){

    alert(
      "Phiếu xuất kho đã ghi sổ, không thể đồng bộ."
    )

    return false

  }

  /* =========================================
  BUILD PAYLOAD
  ========================================= */

  const payload =

    buildDocumentPayload({

      schema,

      header,

      items

    })

  /* =========================================
  HEADER
  ========================================= */

  payload.header.type =
    type

  payload.header.ref =
    ref

  delete payload.header.id
  delete payload.header.code
  delete payload.header.created_at
  delete payload.header.updated_at

  /* =========================================
  UPDATE HEADER
  ========================================= */

  const {

    data:newHeader,

    error:updateError

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
      doc.id
    )

    .select()

    .single()

  if(updateError){

    console.error(
      "UPDATE DERIVED HEADER ERROR",
      updateError
    )

    return

  }

  /* =========================================
  DELETE OLD ITEMS
  ========================================= */

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
      doc.id
    )

  if(deleteError){

    console.error(
      "DELETE DERIVED ITEMS ERROR",
      deleteError
    )

    return

  }

  /* =========================================
  ITEMS PAYLOAD
  ========================================= */

  const itemsPayload =

    payload.items.map(item=>({

      ...item,

      id_doc:
        doc.id,

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

    data:newItems,

    error:itemError

  }

  = await db

    .from(
      schema.meta.detailTable
    )

    .insert(
      itemsPayload
    )

    .select()

  if(itemError){

    console.error(
      "UPDATE DERIVED ITEMS ERROR",
      itemError
    )

    return

  }

  /* =========================================
  SUCCESS
  ========================================= */

  return {

    header:newHeader,

    items:newItems

  }

}