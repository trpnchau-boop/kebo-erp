import {db} from "/js/supabase.js"

import {
  createDerivedDocument
}
from "../../document/actions/create-derived-document.js"

import {
  BASE_DOCUMENT
}
from "../../document/base-document.js"

export async function bulkStockDocument(ctx){

  const ids =
    ctx.ids || []

  if(
    !ids.length
  ){
    return
  }

  let successCount = 0

  for(const id of ids){

    /* =========================================
    LOAD HEADER
    ========================================= */

    const {
      data:header,
      error:headerError
    }

    = await db

      .from("document")

      .select("*")

      .eq("id",id)

      .single()

    if(headerError){

      console.error(
        "LOAD HEADER ERROR",
        headerError
      )

      continue
    }

    /* =========================================
    LOAD ITEMS
    ========================================= */

    const {
      data:items,
      error:itemError
    }

    = await db

      .from("document_items")

      .select("*")

      .eq("id_doc",id)

    if(itemError){

      console.error(
        "LOAD ITEMS ERROR",
        itemError
      )

      continue
    }

  /* =========================================
  SALE
  ========================================= */

  if(header.type === "SALE"){

    await createDerivedDocument({

      schema:
        BASE_DOCUMENT,

      type:"EXPORT",

      ref:id,

      header,

      items

    })

    await createDerivedDocument({

      schema:
        BASE_DOCUMENT,

      type:"INVOICE",

      ref:id,

      header,

      items

    })

  }
 
  /* =========================================
  INVOICE
  ========================================= */

  else if(header.type === "INVOICE"){

    await createDerivedDocument({

      schema:
        BASE_DOCUMENT,

      type:"EXPORT",

      ref:
        header.ref || id,

      header,
 
      items

    })

  }

    successCount++

  }

  /* =========================================
  SUCCESS
  ========================================= */

  alert(
    `
    Đã xử lý
    ${successCount}
    chứng từ
    `
    .replace(/\s+/g," ")
    .trim()
  )

}