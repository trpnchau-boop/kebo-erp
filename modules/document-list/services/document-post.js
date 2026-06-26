import {
  db
}
from "/js/supabase.js"

export async function postDocument(ctx){

  const row =
    ctx.row

  if(!row)
    return

  const nextStatus =

    row.status === "posted"

    ? "draft"

    : "posted"

  const {
    data,
    error
  }

  = await db

    .from("document")

    .update({

      status:nextStatus

    })

    .eq(
      "id",
      row.id
    )

    .select()

    .single()

  if(error){

    console.error(error)

    return

  }

  const tr =

    ctx.tbody.querySelector(
      `tr[data-id="${row.id}"]`
    )

  if(tr){

    if(
      nextStatus === "posted"
    ){

      tr.classList.add(
        "row-posted"
      )

    }

    else{

      tr.classList.remove(
        "row-posted"
      )

    }

  }

  row.status =
    nextStatus

  const btn =

    tr?.querySelector(
      '[data-row-action="post"]'
    )

  if(btn){

    btn.classList.toggle(
      "post-orange",
      nextStatus === "posted"
    )

  }
}