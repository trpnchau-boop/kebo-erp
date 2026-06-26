//document-generate-code.js//

import {
  db
}
from "/js/supabase.js"

export async function generateDocumentCode(
  schema
){

  /* =========================
  PREFIX
  ========================= */

  const prefix =
    schema.meta.prefix || "DOC"

  /* =========================
  DATE
  ========================= */

  const now =
    new Date()

  const dd =
    String(
      now.getDate()
    ).padStart(2,"0")

  const mm =
    String(
      now.getMonth() + 1
    ).padStart(2,"0")

  const key =
    `${prefix}${mm}${dd}`

  /* =========================
  FIND LAST CODE
  ========================= */

  const {
    data,
    error
  }

  = await db

    .from(
      schema.meta.table
    )

    .select("code")

    .like(
      "code",
      `${key}%`
    )

    .order(
      "code",
      {
        ascending:false
      }
    )

    .limit(1)

  if(error){

    console.error(
      "GENERATE CODE ERROR",
      error
    )

  }

  /* =========================
  NEXT NUMBER
  ========================= */

  let next = 1

  if(data?.length){

    const lastCode =
      data[0].code || ""

    const match =
      lastCode.match(/-(\d+)$/)

    if(match){

      next =
        Number(match[1]) + 1

    }

  }

  /* =========================
  FORMAT
  ========================= */

  const no =
    String(next)
    .padStart(4,"0")

  return `${key}-${no}`

}