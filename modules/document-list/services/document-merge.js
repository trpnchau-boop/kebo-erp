//modules/document-list/services/document-merge.js//

import {db} from "/js/supabase.js"

export async function mergeDocuments(ctx){

  const ids =
    ctx.ids || []

  if(ids.length < 2){

    alert(
      "Chọn ít nhất 2 đơn"
    )

    return

  }

  ids.sort(
    (a,b) => b-a
  )

  const id =
    ids[0]

  sessionStorage.setItem(

    "merge_ids",

    JSON.stringify(ids)

  )

  location.hash = `

    /document/form
    ?type=${ctx.type}
    &id=${id}

  `.replace(/\s+/g,"")

}