// modules/document-list/services/document-payment.js

import {
  db
}
from "/js/supabase.js"

export async function paymentDocument(ctx){

  const ids =
    ctx.ids || []

  if(!ids.length){
    alert("Chưa chọn chứng từ")
    return
  }

  /* =====================================
  LOAD DOCUMENTS
  ===================================== */

  const {
    data,
    error
  }

  = await db

    .from("document")

    .select(`
      id,
      tongthanhtoan
    `)

    .in(
      "id",
      ids
    )

  if(error){

    console.error(error)

    alert(
      "Không load được chứng từ"
    )

    return
  }

  /* =====================================
  UPDATE
  ===================================== */

  for(
    const row of data
  ){

    const {
      error:updateError
    }

    = await db

      .from("document")

      .update({

        tien_tt:
          row.tongthanhtoan

      })

      .eq(
        "id",
        row.id
      )

    if(updateError){

      console.error(updateError)

    }

  }

  /* =====================================
  RELOAD
  ===================================== */

  if(ctx.reload){

    await ctx.reload()

  }

  alert(
    "Đã thanh toán"
  )

}