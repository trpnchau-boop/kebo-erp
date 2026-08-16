//document-load.js//

import {
  db
}
from "/js/supabase.js"

import {
  computeHeader
}
from "./document-compute-header.js"

export async function loadDocument(
  id,
  schema,
  state
){

  if(!id) return

  if(!state){

    return
  }

  /* =========================
  HEADER
  ========================= */

  const table =
    schema.dbTable || "document"

  const {
    data:header,
    error:headerError
  }

  = await db

    .from(table)

    .select("*")

    .eq("id",id)

    .single()

  if(headerError){

    console.error(
      "LOAD HEADER ERROR:",
      headerError
    )

    return

  }

  /* =========================
  RELATED DOCUMENTS
  ========================= */

  const groupId =
    header.ref || header.id

  const {
    data:relatedDocs,
    error:relatedError
  }

  = await db

    .from(table)

    .select(`
      id,
      code,
      type,
      ref
    `)

    .or(`id.eq.${groupId}, ref.eq.${groupId}`)

  if(relatedError){

    console.error(
      "LOAD RELATED ERROR:",
      relatedError
    )

  }

  header.relatedDocs =
    (relatedDocs || [])

    .filter(
      x => x.id !== header.id
    )

  /* =========================
  CUSTOMER ENRICH
  ========================= */

  if(header?.id_customer){

    const {
      data:customer,
      error:customerError
    }

    = await db

      .from("data_customer")

      .select(`
        code,
        name,
        phone,
        mst,
        add
      `)

      .eq(
        "id",
        header.id_customer
      )

      .single()

    if(customerError){

      console.error(
        "LOAD CUSTOMER ERROR:",
        customerError
      )

    }

    if(customer){

      header.customer_name =
        customer.name || ""

      header.phone =
        customer.phone || ""

      header.mst =
        customer.mst || ""

      header.address =
        customer.add || ""

      header.id_customer_text =

        [

          customer.code,

          customer.name

        ]

        .filter(Boolean)

        .join(" - ")

    }

  }

  /* =========================
  EMPLOYEE ENRICH
  ========================= */

  if(header?.id_employee){

    const {
      data:employee,
      error:employeeError
    }

    = await db

      .from("data_employee")

      .select(`
        name
      `)

      .eq(
        "id",
        header.id_employee
      )

      .single()

    if(employeeError){

      console.error(
        "LOAD EMPLOYEE ERROR:",
        employeeError
      )

    }

    if(employee){

      header.employee_name =
        employee.name || ""

      header.id_employee_text =
        employee.name || ""

    }

  }

  /* =========================
  ITEMS
  ========================= */

  const itemTable =
    schema.itemTable || "document_items"

  const {
    data:items = [],
    error:itemError
  }

  = await db

    .from(itemTable)

    .select("*")

    .eq("id_doc",id)

  if(itemError){

    console.error(
      "LOAD ITEMS ERROR:",
      itemError
    )

  }

  /* =========================
  MERGE ITEMS
  ========================= */

  const mergeIds =

    JSON.parse(

      sessionStorage.getItem(
        "merge_ids"
      ) || "[]"

    )

  if(mergeIds.length > 1){

    const otherIds =

      mergeIds.filter(
        x => x != id
      )

    if(otherIds.length){

      const {
        data:mergeItems = [],
        error:mergeError
      }

      = await db

        .from(itemTable)

        .select("*")

        .in(
          "id_doc",
          otherIds
        )

      if(mergeError){

        console.error(
          "MERGE ITEMS ERROR:",
          mergeError
        )

      }

      items.push(

        ...mergeItems.map(
          item => ({

            ...item,

            id:null,

            id_doc:null

          })
        )

      )

    }

    /* =====================
    RESET HEADER
    ===================== */

    header.status =
      "draft"

    header.posted_at =
      null

    header.posted_by =
      null

    header.tongtien =
      0

    header.tongthanhtoan =
      0

    header.tongtienvon =
      0

    sessionStorage.removeItem(
      "merge_ids"
    )

  }

  /* =========================
  PRODUCT TEXT
  ========================= */

  const productIds =

    [...new Set(

      items

      .map(
        i => i.id_product
      )

      .filter(Boolean)

    )]

  if(productIds.length){

    const {
      data:products,
      error:productError
    }

    = await db

      .from("data_product")

      .select(`
        id,
        name,
        tinhchat
      `)

      .in(
        "id",
        productIds
      )

    if(productError){

      console.error(
        "LOAD PRODUCT ERROR:",
        productError
      )

    }

    const productMap = {}

    ;(products || [])

    .forEach(p=>{

      productMap[p.id] =

        [
          p.name,
          p.tinhchat
        ]

        .filter(Boolean)
        .join(" ")

    })

    items.forEach(item=>{

      const text =

        productMap[
          item.id_product
        ]

        || item.name

        || ""

      item.name = text

      item.id_product_text =
        text

    })

  }

  /* =========================
  UNIT NAME
  ========================= */

  const unitIds =

    [...new Set(

      items

      .map(
        i => i.id_unit
      )

      .filter(Boolean)

    )]

  if(unitIds.length){

    const {
      data:units,
      error:unitError
    }

    = await db

      .from("product_unit")

      .select(`
        id,
        unit
      `)

      .in(
        "id",
        unitIds
      )

    if(unitError){

      console.error(
        "LOAD UNIT ERROR:",
        unitError
      )

    }

    const unitMap = {}

    ;(units || [])

    .forEach(unit=>{

      unitMap[unit.id] =
        unit.unit || ""

    })

    items.forEach(item=>{

      item.unit_name =

        unitMap[
          item.id_unit
        ]

        || ""

    })

  }

  /* =========================
  STATE
  ========================= */

  state.header =
    header || {}

  state.items =
    items || []

  /* =========================
  COMPUTE
  ========================= */

  computeHeader(
    schema,
    state
  )

  /* =========================
  ORIGINAL VALUES
  ========================= */

  state.items.forEach(item=>{

    item._originalQty =

      Number(
        item.qty || 0
      )

    item._originalTongSoLuong =

      Number(
        item.tongsoluong || 0
      )

    if(

      !item._originalTongSoLuong

      ||

      item._originalTongSoLuong <= 0

    ){

      const ratio =

        Number(
          item.ratio || 1
        )

      item._originalTongSoLuong =

        ratio > 0

        ? item._originalQty * ratio

        : item._originalQty

    }

  })

}
export async function loadCustomerDebt(customerId){

  if(!customerId){
    return 0
  }

  /* =========================
     CHỨNG TỪ BÁN HÀNG
  ========================= */

  const {
    data: documents,
    error: documentError
  } = await db
    .from("document")
    .select("id,tongthanhtoan")
    .eq("type", "SALE")
    .eq("status", "posted")
    .eq("id_customer", customerId)

  if(documentError){
    throw documentError
  }

  if(!documents?.length){
    return 0
  }

  const documentIds =
    documents.map(x => x.id)


  /* =========================
     PHÂN BỔ THANH TOÁN
  ========================= */

  const {
    data: allocations,
    error: allocationError
  } = await db
    .from("payment_allocation")
    .select("payment_id,document_id,amount")
    .in("document_id", documentIds)

  if(allocationError){
    throw allocationError
  }


  if(!allocations?.length){

    return documents.reduce(
      (sum,doc) =>
        sum +
        Number(
          doc.tongthanhtoan || 0
        ),
      0
    )

  }


  /* =========================
     PHIẾU THU
  ========================= */

  const paymentIds =
    [
      ...new Set(
        allocations.map(
          x => x.payment_id
        )
      )
    ]

  const {
    data: payments,
    error: paymentError
  } = await db
    .from("payment")
    .select("id,type,status")
    .in("id", paymentIds)

  if(paymentError){
    throw paymentError
  }


  const paymentMap =
    Object.fromEntries(
      (payments || []).map(
        x => [
          String(x.id),
          x
        ]
      )
    )


  /* =========================
     TỔNG ĐÃ THU
  ========================= */

  let paid = 0

  for(const allocation of allocations){

    const payment =
      paymentMap[
        String(
          allocation.payment_id
        )
      ]

    if(
      payment?.type !== "RECEIPT" ||
      payment?.status !== "posted"
    ){
      continue
    }

    paid +=
      Number(
        allocation.amount || 0
      )
  }


  /* =========================
     CÔNG NỢ
  ========================= */

  const total =
    documents.reduce(
      (sum,doc) =>
        sum +
        Number(
          doc.tongthanhtoan || 0
        ),
      0
    )

  return Math.max(
    total - paid,
    0
  )
}