import {
  db
}
from "/js/supabase.js"

export async function exportStockDocument(ctx){

  const row =
    ctx.row

  if(
    row?.status === "posted"
  ){

    alert(
      "Chứng từ đã ghi sổ"
    )

    return

  }

  const id =
    ctx.ids?.[0]

  if(!id){
    return
  }

  /* =========================================
  LOAD HEADER
  ========================================= */

  const {

    data:header,

    error:headerError

  }

  = await db

    .from("document")

    .select("id,type,ref")

    .eq("id", id)

    .single()

  if(headerError){

    console.error(
      "LOAD HEADER ERROR",
      headerError
    )

    return

  }

  /* =========================================
  REF
  ========================================= */

  const ref =

    header.type === "INVOICE"

      ? (header.ref || header.id)

      : header.id

  /* =========================================
  FIND EXPORT
  ========================================= */

  const {

    data:exportDoc,

    error:exportError

  }

  = await db

    .from("document")

    .select("id")

    .eq("type", "EXPORT")

    .eq("ref", ref)

    .maybeSingle()

  if(exportError){

    console.error(
      "LOAD EXPORT ERROR",
      exportError
    )

    return

  }

  /* =========================================
  OPEN EXPORT
  ========================================= */

  if(exportDoc){

    location.hash =
      `#/document/EXPORT/${exportDoc.id}`

    return

  }

  /* =========================================
  CREATE EXPORT
  ========================================= */

  location.hash =

    `
    /document/form
    ?type=EXPORT
    &id=${ref}
    &action=create
    `

    .replace(/\s+/g,"")

}