// modules/document-list/services/release/release-save.js

import {
  db
}
from "/js/supabase.js"

import {
  generateAutoCode
}
from "/js/auto-code.js"

export async function saveReleaseDocuments(rows = []){

  /* =====================================
  SELECTED ROWS
  ===================================== */

  const selectedRows =

    Array.from(

      document.querySelectorAll(
        ".release-row-check:checked"
      )

    )

  if(!selectedRows.length){

    alert(
      "Chưa chọn dòng"
    )

    return

  }

  /* =====================================
  GROUP DOCUMENTS
  ===================================== */

  const grouped = new Map()

  selectedRows.forEach(input=>{

    const tr =

      input.closest("tr")

    if(!tr) return

    const docIndex =

      Number(
        tr.dataset.docIndex
      )

    const itemIndex =

      Number(
        tr.dataset.itemIndex
      )

    const doc =
      rows[docIndex]

    if(!doc) return

    const item =

      doc.document_items?.[
        itemIndex
      ]

    if(!item) return

    /* ===================================
    CREATE GROUP
    =================================== */

    if(
      !grouped.has(doc.id)
    ){

      grouped.set(

        doc.id,

        {

          header:{

            type:"ISSUE",

            status:"draft",

            ref:
              doc.id,

            day:
              doc.day,

            id_customer:
              doc.id_customer,

            tongtien:0,

            tongthanhtoan:0

          },

          items:[]

        }

      )

    }

    const group =

      grouped.get(doc.id)

    /* ===================================
    ITEM
    =================================== */

    const itemPayload = {

      id_product:
        item.id_product,

      id_customer:
        doc.id_customer,

      name:
        item.name,

      tongsoluong:

        Number(
          item.tongsoluong || 0
        ),

      dvtGoc:
        item.dvtGoc,

      dongia:

        Number(
          item.dongia || 0
        ),

      thanhtien:

        Number(
          item.thanhtien || 0
        )

    }

    group.items.push(
      itemPayload
    )

    /* ===================================
    TOTAL
    =================================== */

    group.header.tongtien +=

      itemPayload.thanhtien

    group.header.tongthanhtoan +=

      itemPayload.thanhtien

  })

/* =====================================
SAVE
===================================== */

for(
  const [
    sourceId,
    payload
  ]
  of grouped
){

  /* ===================================
  CHECK EXIST
  =================================== */

  const {
    data:exists,
    error:existError
  }

  = await db

    .from("tax_invoice")

    .select(`
      id,
      code,
      status
    `)

    .eq(
      "ref",
      sourceId
    )

    .maybeSingle()

  if(existError){

    console.error(
      "CHECK EXIST ERROR:",
      existError
    )

    continue

  }

/* ===================================
ALREADY EXISTS
=================================== */

if(exists){

  /* ===============================
  ĐÃ CÓ CODE -> BỎ QUA
  =============================== */

  if(exists.code){

    console.warn(
      "ALREADY RELEASED -> SKIP"
    )

    continue

  }

  /* ===============================
  CHƯA CÓ CODE -> CẤP CODE
  =============================== */

  const code =

    await generateAutoCode(
      "tax_invoice",
      {
        autoCode:{
          prefix:"PH"
        }
      }
    )

  const {
    error:updateError
  }

  = await db

    .from("tax_invoice")

    .update({

      code

    })

    .eq(
      "id",
      exists.id
    )

  if(updateError){

    console.error(
      "UPDATE CODE ERROR:",
      updateError
    )

    continue

  }

  continue

}

  let invoiceId = null

  /* ===================================
  AUTO CODE
  =================================== */

  let code = null

  try{

    code = await generateAutoCode(
      "tax_invoice",
      {
        autoCode:{
          prefix:"PH"
        }
      }
    )

  }catch(err){

    console.error(
      "AUTO CODE ERROR:",
      err
    )

  }

  payload.header.code =
    code

  /* ===================================
  INSERT HEADER
  =================================== */

  const {
    data:newDoc,
    error:insertError
  }

  = await db

    .from("tax_invoice")

    .insert([
      payload.header
    ])

    .select()

    .single()


  if(insertError){

    console.error(
      "INSERT TAX ERROR:",
      insertError
    )

    continue

  }

  invoiceId =
    newDoc.id

  /* ===================================
  ITEMS
  =================================== */

  const itemsPayload =

    payload.items.map(item=>({

      ...item,

      id_doc:
        invoiceId

    }))

  const {
    error:itemError
  }

  = await db

    .from(
      "tax_invoice_items"
    )

    .insert(
      itemsPayload
    )

  if(itemError){

    console.error(
      "INSERT ITEMS ERROR:",
      itemError
    )

    continue

  }

}

alert(
  "Đã lưu hóa đơn"
)

}