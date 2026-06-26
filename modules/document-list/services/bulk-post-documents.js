import {db} from "/js/supabase.js"

export async function bulkPostDocuments(ctx){

  const ids =
    ctx.ids || []

  if(!ids.length)
    return

  const {
    error
  }

  = await db
    .from("document")
    .update({
      status:"posted"
    })
    .in("id",ids)

  if(error){
    console.error(error)
    return
  }

  ids.forEach(id=>{

    const tr =

      ctx.tbody.querySelector(
        `tr[data-id="${id}"]`
      )

    if(tr){

      tr.classList.add(
        "row-posted"
      )

    }

  })

}