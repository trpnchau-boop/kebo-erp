
/* =========================================================
RELEASE LOAD
========================================================= */

import {
  db
} from "/js/supabase.js"

import {
  loadRef
} from "/js/relation-cache.js"

import {
  renderReleaseRows
} from "./release-render.js"


/* =========================================================
LOAD RELEASE DOCUMENTS
========================================================= */

export async function loadReleaseDocuments() {

  /* =====================================
  LOAD IDS
  ===================================== */

  const ids = JSON.parse(
    localStorage.getItem("release_ids") || "[]"
  )

  if (!ids.length) {

    alert("Không có chứng từ")

    return []

  }


  /* =====================================
  LOAD DOCUMENTS
  ===================================== */

  const {
    data,
    error
  } = await db

    .from("document")

    .select(`
      *,
      document_items(*)
    `)

    .in(
      "id",
      ids
    )


  if (error) {

    console.error(
      "LOAD RELEASE ERROR:",
      error
    )

    alert("Không tải được chứng từ")

    return []

  }


  /* =====================================
  LOAD CUSTOMERS
  ===================================== */

  const customers = await loadRef(
    "data_customer"
  )


  /* =====================================
  LOAD PRODUCT PARENT MAP

  ID con -> ID cha

  Nếu không có parent_id thì
  sản phẩm tự nó là sản phẩm gốc.
  ===================================== */

  const {
    data: products,
    error: productError
  } = await db

    .from("data_product")

    .select(`
      id,
      parent_id,
      dvtGoc
    `)


  if (productError) {

    console.error(
      "LOAD PRODUCT PARENT ERROR:",
      productError
    )

    alert("Không tải được thông tin sản phẩm")

    return []

  }


const productParentMap = {}
const productMap = {}

;(products || []).forEach(product => {

  const productId = String(product.id)

  const parentId =
    product.parent_id !== null &&
    product.parent_id !== undefined &&
    product.parent_id !== ""

      ? String(product.parent_id)

      : productId

  productParentMap[productId] = parentId

  productMap[productId] = product

})


  /* =====================================
  LOAD TAX INVENTORY

  View đã quy đổi tồn theo đơn vị gốc
  và gom tồn về ID sản phẩm cha.
  ===================================== */

  const {
    data: stocks,
    error: stockError
  } = await db

    .from("vw_tax_inventory")

    .select(`
      id_product,
      qty_balance
    `)


  if (stockError) {

    console.error(
      "LOAD TAX INVENTORY ERROR:",
      stockError
    )

    alert("Không tải được tồn kho")

    return []

  }


  /* =====================================
  BUILD STOCK MAP

  ID sản phẩm cha -> tồn kho đơn vị gốc
  ===================================== */

  const stockMap = {}

  ;(stocks || []).forEach(stock => {

    const productId = String(
      stock.id_product
    )

    stockMap[productId] =

      Number(
        stock.qty_balance || 0
      )

  })


  /* =====================================
  MAP DOCUMENT ROWS
  ===================================== */

  const rows =

    (data || [])

      .map(doc => {

        /* =====================================
        CUSTOMER
        ===================================== */

        const customer =

          customers.find(item =>

            String(item.id)

            ===

            String(
              doc.id_customer
            )

          )


        /* =====================================
        DOCUMENT ITEMS

        Sản phẩm con tra tồn theo ID cha.
        Tồn trả về là đơn vị gốc.
        ===================================== */

        const documentItems =

          (doc.document_items || [])

            .map(item => {

              const productId = String(
                item.id_product
              )

              const parentId =

                productParentMap[productId]

                || productId


              const qtyBalance =
  stockMap[parentId] ?? 0

const parentProduct =
  productMap[parentId]

return {
  ...item,

  // Tồn kho đã quy đổi về đơn vị gốc
  qty_balance:
    qtyBalance,

  // Đơn vị gốc của sản phẩm cha
  stock_unit:
    parentProduct?.dvtGoc || ""
}

            })


        /* =====================================
        RETURN DOCUMENT
        ===================================== */

        return {

          ...doc,

          document_items:
            documentItems,

          customer_name:
            customer?.name || "",

          tax_code:
            customer?.mst || "",

          address:
            customer?.add || "",

          donvi:
            customer?.donvi || ""

        }

      })


  /* =====================================
  RENDER
  ===================================== */

  renderReleaseRows(
    rows
  )


  /* =====================================
  RETURN
  ===================================== */

  return rows

}
