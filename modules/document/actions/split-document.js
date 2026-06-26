import {
  db
}
from "/js/supabase.js"

import {
  buildDocumentPayload,
  extractFields
}
from "../document-payload.js"

import {
  generateDocumentCode
}
from "../document-generate-code.js"

export async function splitDocument({

  schema,
  state

}){

  /* =====================================
  DOC ID
  ===================================== */

  const oldDocId =
    state.header.id

  if(!oldDocId){

    alert(
      "Chưa lưu chứng từ"
    )

    return
  }

  /* =====================================
  LOCK POSTED
  ===================================== */

  if(
    state.header.status ===
    "posted"
  ){

    alert(
      "Chứng từ đã ghi sổ"
    )

    return
  }

  /* =====================================
  SELECTED ITEMS
  ===================================== */

  const selectedItems =

    state.items.filter(
      item => item.checked
    )

  if(!selectedItems.length){

    alert(
      "Chưa chọn dòng"
    )

    return
  }

  /* =====================================
  REMAIN ITEMS
  ===================================== */

  const remainItems =

    state.items

      .map(item=>{

        if(!item.checked){
          return item
        }

        const splitTong =

          Number(
            item.tongsoluong || 0
          )

        const originalTong =

          Number(
            item._originalTongSoLuong || 0
          )

        const remainTong =
          originalTong - splitTong

        if(remainTong <= 0){
          return null
        }

        const ratio =
          Number(
            item.ratio || 1
          )

        let finalQty =

          ratio > 0
            ? remainTong / ratio
            : remainTong

        let finalUnit =
          item.id_unit

        if(
          ratio > 1
          &&
          !Number.isInteger(finalQty)
        ){
          finalQty = remainTong
          finalUnit = null
        }

        return {
          ...item,
          qty: finalQty,
          id_unit: finalUnit,
          tongsoluong: remainTong,
          thanhtien:
            remainTong *
            Number(
              item.dongia || 0
            ),
          tienvon:
            remainTong *
            Number(
              item.dongiavon || 0
            )
        }

      })

      .filter(Boolean)

  if(!remainItems.length){

    alert(
      "Không thể tách hết dòng"
    )

    return
  }

  /* =====================================
  CLEAN PAYLOAD
  ===================================== */

  const payload =

    buildDocumentPayload({

      schema,

      header:
        state.header,

      items:
        state.items

    })

  /* =====================================
  NEW HEADER
  ===================================== */

  const newHeader = {

    ...payload.header,

    type:

      payload.header.type
      ||
      state.header.type
      ||
      schema.docType?.default
      ||
      schema.meta?.code,

    status:"draft",

    chietkhau:0,

    thue:0

  }

  delete newHeader.id
  delete newHeader.code
  delete newHeader.created_at
  delete newHeader.updated_at

  /* =====================================
  AUTO CODE
  ===================================== */

  newHeader.code =

    await generateDocumentCode(
      schema
    )

  /* =====================================
  INSERT NEW DOC
  ===================================== */

  const {
    data:newDoc,
    error:newDocError
  }

  = await db

    .from(
      schema.meta.table
    )

    .insert([
      newHeader
    ])

    .select()

    .single()

  if(newDocError){

    console.error(
      "NEW DOC ERROR",
      newDocError
    )

    alert(
      "Không tạo được chứng từ mới"
    )

    return
  }

  /* =====================================
  NEW ITEMS PAYLOAD
  ===================================== */

  const newItemsPayload =

    selectedItems.map(item=>{

      const splitTong =

        Number(
          item.tongsoluong || 0
        )

      const originalTong =

        Number(
          item._originalTongSoLuong || 0
        )

      const ratio =

        Number(
          item.ratio || 1
        )

      if(
        splitTong <= 0
        ||
        splitTong > originalTong
      ){

        throw new Error(
          `SL tách không hợp lệ: ${item.name}`
        )

      }

      const splitQty =

        ratio > 0
          ? splitTong / ratio
          : splitTong

      return {

        ...extractFields(
          schema.table.columns,
          item
        ),

        qty:
          splitQty,

        tongsoluong:
          splitTong,

        thanhtien:
          splitTong *
          Number(
            item.dongia || 0
          ),

        tienvon:
          splitTong *
          Number(
            item.dongiavon || 0
          ),

        id_doc:
          newDoc.id

      }

    })

  /* =====================================
  INSERT NEW ITEMS
  ===================================== */

  const {
    error:newItemsError
  }

  = await db

    .from(
      schema.meta.detailTable
    )

    .insert(
      newItemsPayload
    )

  if(newItemsError){

    console.error(
      "NEW ITEMS ERROR",
      newItemsError
    )

    alert(
      "Không tạo được dòng chứng từ mới"
    )

    return
  }

  /* =====================================
  UPDATE OLD ITEMS
  ===================================== */

  for(const item of selectedItems){

    const splitTong =

      Number(
        item.tongsoluong || 0
      )

    const originalTong =

      Number(
        item._originalTongSoLuong || 0
      )

    const remainTong =
      originalTong - splitTong

    const ratio =
      Number(
        item.ratio || 1
      )

    let remainQty =

      ratio > 0
        ? remainTong / ratio
        : remainTong

    let remainUnit =
      item.id_unit

    if(
      ratio > 1
      &&
      !Number.isInteger(remainQty)
    ){

      remainQty =
        remainTong

      remainUnit =
        null

    }

    if(remainTong <= 0){

      await db

        .from(
          schema.meta.detailTable
        )

        .delete()

        .eq(
          "id",
          item.id
        )

      continue
    }

    await db

      .from(
        schema.meta.detailTable
      )

      .update({

        qty:
          remainQty,

        id_unit:
          remainUnit,

        tongsoluong:
          remainTong,

        thanhtien:
          remainTong *
          Number(
            item.dongia || 0
          ),

        tienvon:
          remainTong *
          Number(
            item.dongiavon || 0
          )

      })

      .eq(
        "id",
        item.id
      )

  }

  /* =====================================
  TOTALS
  ===================================== */

  const newTotals =
    computeTotals(newItemsPayload)

  const remainTotals =
    computeTotals(remainItems)

  /* =====================================
  UPDATE NEW DOC TOTALS
  ===================================== */

  const {
    error:updateNewError
  }

  = await db

    .from(
      schema.meta.table
    )

    .update(
      newTotals
    )

    .eq(
      "id",
      newDoc.id
    )

  if(updateNewError){

    console.error(
      "UPDATE NEW TOTALS ERROR",
      updateNewError
    )

  }

  /* =====================================
  UPDATE OLD DOC TOTALS
  ===================================== */

  const {
    error:updateOldError
  }

  = await db

    .from(
      schema.meta.table
    )

    .update(
      remainTotals
    )

    .eq(
      "id",
      oldDocId
    )

  if(updateOldError){

    console.error(
      "UPDATE OLD TOTALS ERROR",
      updateOldError
    )

  }

  /* =====================================
  LOCAL STATE
  ===================================== */

  state.items =
    remainItems

  state.header.tongtien =
    remainTotals.tongtien || 0

  state.header.tongtienvon =
    remainTotals.tongtienvon || 0

  state.header.tongthanhtoan =
    remainTotals.tongthanhtoan || 0

  /* =====================================
  SUCCESS
  ===================================== */

  alert(
    "Tách đơn thành công"
  )

  /* =====================================
  OPEN NEW DOC
  ===================================== */

  location.hash = `
    /document/form
    ?type=${newHeader.type}
    &id=${newDoc.id}
  `.replace(/\s+/g,"")

}

/* =========================================
TOTALS
========================================= */

function computeTotals(items){

  const tongtien =

    items.reduce(

      (sum,item)=>

        sum +
        Number(
          item.thanhtien || 0
        ),

      0

    )

  const tongtienvon =

    items.reduce(

      (sum,item)=>

        sum +
        Number(
          item.tienvon || 0
        ),

      0

    )

  return {

    tongtien,

    tongtienvon,

    tongthanhtoan:
      tongtien

  }

}