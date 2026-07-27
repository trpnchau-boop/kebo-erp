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
      tongthanhtoan,
      tien_tt
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

  let hasPaid = false
  let hasUnpaid = false

  for(
    const row of data
  ){

    const isPaid =

      Number(row.tien_tt || 0) > 0

    const {
      error:updateError
    }

    = await db

      .from("document")

      .update({

        tien_tt: isPaid
          ? 0
          : row.tongthanhtoan

      })

      .eq(
        "id",
        row.id
      )

    if(updateError){

      console.error(updateError)

      continue

    }

    if(isPaid){

      hasUnpaid = true

    }else{

      hasPaid = true

    }

  }

  /* =====================================
  RELOAD
  ===================================== */

  if(ctx.reload){

    await ctx.reload()

  }

  if(hasPaid && !hasUnpaid){

    alert("Đã thanh toán")

  }else if(hasUnpaid && !hasPaid){

    alert("Đã hủy thanh toán")

  }else{

    alert("Đã cập nhật thanh toán")

  }

}