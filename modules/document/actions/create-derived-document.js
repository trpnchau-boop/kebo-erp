//create-derived-document.js//

import {
  db
}
from "/js/supabase.js"

import {
  buildDocumentPayload
}
from "../document-payload.js"

import {
  generateDocumentCode
}
from "../document-generate-code.js"

export async function createDerivedDocument({

  schema,

  type,

  ref,

  header,

  items

}){

  /* =========================================
  CHECK EXISTS
  ========================================= */

  const {
    data:exists,
    error:existsError
  }

  = await db

    .from("document")

    .select("id")

    .eq("ref", ref)

    .eq("type", type)

    .maybeSingle()

  if(existsError){

    console.error(
      "CHECK EXISTS ERROR",
      existsError
    )

    return
  }

  if(exists){

    return {
      header:exists,
      items:[]
    }  

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
  payload.header.status =  
    "draft"

  /* =========================================
  REMOVE SYSTEM FIELDS
  ========================================= */

  delete payload.header.id
  delete payload.header.created_at
  delete payload.header.updated_at

  /* =========================================
  AUTO CODE
  ========================================= */

  const prefixMap = {

    EXPORT:"XK",

    IMPORT:"NK",

    INVOICE:"HD",

    TRANSFER:"CK",

    ADJUST:"KK",

    ISSUE:"PH"

  }

  payload.header.code =

    await generateDocumentCode({

      meta:{

        table:"document",

        prefix:
          prefixMap[type] || "DOC"

      }

    })

  /* =========================================
  INSERT HEADER
  ========================================= */

  const {

    data:newHeader,
    error:headerError

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

  if(headerError){

    console.error(
      "CREATE DOC ERROR",
      JSON.stringify(
        headerError,
        null,
        2
      )
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
        newHeader.id,

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
      "CREATE ITEMS ERROR",
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

    header:newHeader,

    items:newItems

  }

}