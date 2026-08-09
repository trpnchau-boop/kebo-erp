import {
  db
}
from "/js/supabase.js"

import {
  deleteRow
}
from "/js/crud.js"

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