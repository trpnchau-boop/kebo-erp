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
     CHECK PHIẾU THU
     
     Chỉ cần có:
       payment_allocation
       +
       payment.type = RECEIPT

     => đã lập phiếu thu
     => không cho nút Thanh toán
        thay đổi tien_tt
  ===================================== */

  const {
    data: allocations,
    error: allocationError
  }

  = await db

    .from("payment_allocation")

    .select(`
      document_id,
      payment:payment_id(
        type,
        status
      )
    `)

    .in(
      "document_id",
      ids
    )


  if(allocationError){

    console.error(
      allocationError
    )

    alert(
      "Không kiểm tra được phiếu thu"
    )

    return
  }


  const receiptDocumentIds =
    new Set(

      (allocations || [])

        .filter(
          allocation =>
            allocation.payment?.type ===
            "RECEIPT"
        )

        .map(
          allocation =>
            String(
              allocation.document_id
            )
        )
    )


  /* =====================================
     UPDATE
  ===================================== */

  let hasReceipt = false


  for(
    const row of data
  ){

    /* -------------------------------------
       ĐÃ CÓ PHIẾU THU

       Bỏ qua chứng từ này.
       Không ảnh hưởng các chứng từ khác.
    ------------------------------------- */

    if(
      receiptDocumentIds.has(
        String(row.id)
      )
    ){

      hasReceipt = true

      continue
    }


    /* -------------------------------------
       CHƯA CÓ PHIẾU THU

       tien_tt > 0
         => chuyển về 0

       tien_tt = 0
         => chuyển thành tổng thanh toán
    ------------------------------------- */

    const isPaid =
      Number(
        row.tien_tt || 0
      ) > 0


    const {
      error: updateError
    }

    = await db

      .from("document")

      .update({

        tien_tt:

          isPaid
            ? 0
            : Number(
                row.tongthanhtoan || 0
              )

      })

      .eq(
        "id",
        row.id
      )


    if(updateError){

      console.error(
        updateError
      )

      continue
    }

  }


  /* =====================================
     THÔNG BÁO
     
     Chỉ báo nếu trong danh sách
     có ít nhất một HD đã lập PT.
  ===================================== */

  if(hasReceipt){

    alert(
      "Hóa đơn đã lập phiếu thu"
    )

  }


  /* =====================================
     RELOAD
  ===================================== */

  if(ctx.reload){

    await ctx.reload()

  }

}