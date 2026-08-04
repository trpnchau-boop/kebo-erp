// delete-derived-document.js

import {
  db
}
from "/js/supabase.js"

export async function deleteDerivedDocument({

  schema,

  type,

  ref

}){

  /* =========================================
  FIND DOCUMENT
  ========================================= */

  const {

    data:doc,

    error:findError

  }

  = await db

    .from(schema.meta.table)

    .select(`
      id,
      status
    `)

    .eq("type", type)

    .eq("ref", ref)

    .maybeSingle()

  if(findError){

    console.error(
      "FIND DERIVED ERROR",
      findError
    )

    return false

  }

  if(!doc){

    return true

  }

  /* =========================================
  POSTED
  ========================================= */

  if(doc.status === "posted"){

    alert(
      "Chứng từ đã ghi sổ, không thể xóa."
    )

    return false

  }

  /* =========================================
  DELETE ITEMS
  ========================================= */

  const {

    error:itemError

  }

  = await db

    .from(schema.meta.detailTable)

    .delete()

    .eq(
      "id_doc",
      doc.id
    )

  if(itemError){

    console.error(
      "DELETE DERIVED ITEMS ERROR",
      itemError
    )

    return false

  }

  /* =========================================
  DELETE HEADER
  ========================================= */

  const {

    error:headerError

  }

  = await db

    .from(schema.meta.table)

    .delete()

    .eq(
      "id",
      doc.id
    )

  if(headerError){

    console.error(
      "DELETE DERIVED HEADER ERROR",
      headerError
    )

    return false

  }

  /* =========================================
  SUCCESS
  ========================================= */

  return true

}