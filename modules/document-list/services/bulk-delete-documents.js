import {
  db
}
from "/js/supabase.js"

import {
  deleteRow
}
from "/js/crud.js"

import {
  deleteDerivedDocument
}
from "../../document/actions/delete-derived-document.js"

import {
  BASE_DOCUMENT
}
from "../../document/base-document.js"

export async function bulkDeleteDocuments(ctx){

  if(!ctx.ids?.length){
    return
  }

  const ok = confirm(
    `Xóa ${ctx.ids.length} chứng từ?`
  )

  if(!ok){
    return
  }

  for(const id of ctx.ids){

    /* =========================================
    LOAD HEADER
    ========================================= */

    const {

      data:header,

      error

    }

    = await db

      .from(ctx.table)

      .select("*")

      .eq("id", id)

      .single()

    if(error){

      console.error(
        "LOAD HEADER ERROR",
        error
      )

      continue

    }

    /* =========================================
    EXPORT
    ========================================= */

    if(header.type === "EXPORT"){

      if(header.status === "posted"){

        alert(
          "Phiếu xuất kho đã ghi sổ, không thể xóa."
        )

        continue

      }

    }

    /* =========================================
    INVOICE
    ========================================= */

    if(header.type === "INVOICE"){

      const deleted =

        await deleteDerivedDocument({

          schema: BASE_DOCUMENT,

          type: "EXPORT",

          ref: header.ref

        })

      if(!deleted){

        continue

      }

    }

    /* =========================================
    DELETE CURRENT DOCUMENT
    ========================================= */

    await deleteRow(

      ctx.table,

      id

    )

  }

  /* =========================================
  RELOAD
  ========================================= */

  await ctx.reload()

}