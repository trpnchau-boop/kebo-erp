
import { getAll } from "../../js/crud.js"

import { formatDecimal } from "../../js/core/format.js"

import {
  createDatepicker
} from "/js/ui/init-datepicker.js"


/* =========================================================
INIT
========================================================= */

export async function init(params = {}, root){

  const state = {

    root,

    productId: Number(
      params.id ||
      params.ref ||
      new URLSearchParams(location.search).get("id") ||
      0
    ),

    isTax: params.isTax === true,

    docs: [],
    items: [],
    products: []

  }

  initDate(state)

  createDatepicker(
    state.root,
    "#from-date",
    () => render(state)
  )

  createDatepicker(
    state.root,
    "#to-date",
    () => render(state)
  )

  bindEvents(state)

  await loadMaster(state)

  await loadData(state)

}


/* =========================================================
HELPER
========================================================= */


function $(id, state){

  return state.root.querySelector(`#${id}`)

}



/* =========================================================
INIT DATE
========================================================= */

function initDate(state){

  const today = new Date()

  const to =
    today.toISOString().slice(0,10)

  const fromDate = new Date()

  fromDate.setDate(
    today.getDate() - 30
  )

  const from =
    fromDate.toISOString().slice(0,10)

  $("from-date", state).value = from

  $("to-date", state).value = to

}


/* =========================================================
EVENTS
========================================================= */

function bindEvents(state){

  $("btn-load", state)
    ?.addEventListener(
      "click",
      () => render(state)
    )

}


/* =========================================================
LOAD MASTER
========================================================= */

async function loadMaster(state){

  const products =
    await getAll("data_product")

  state.products = products || []

}


/* =========================================================
LOAD DATA
========================================================= */

async function loadData(state){

  const docTable = state.isTax
    ? "tax_invoice"
    : "document"

  const itemTable = state.isTax
    ? "tax_invoice_items"
    : "document_items"

  const [docs, items] = await Promise.all([

    getAll(docTable),

    getAll(itemTable)

  ])

  state.docs = docs || []

  state.items = items || []

  render(state)

}


/* =========================================================
DOCUMENT TYPE
========================================================= */

function getImportTypes(state){

  return state.isTax
    ? ["XML_IN"]
    : ["IMPORT"]

}


function getExportTypes(state){

  return state.isTax
    ? ["XML_OUT"]
    : ["EXPORT"]

}


/* =========================================================
GET DOCUMENT
========================================================= */

function getDocument(state, item){

  return state.docs.find(
    doc =>
      Number(doc.id) === Number(item.id_doc)
  )

}


/* =========================================================
GET PRODUCT ROWS
========================================================= */

function getProductRows(state){

  return state.items.filter(item => {

    return Number(item.id_product) === state.productId

  })

}


/* =========================================================
GET MOVEMENT
========================================================= */

function getMovement(state, item, doc){

  const qty = Number(
    item.tongsoluong || 0
  )

  const importTypes =
    getImportTypes(state)

  const exportTypes =
    getExportTypes(state)

  let nhap = 0

  let xuat = 0

  if(importTypes.includes(doc.type)){

    nhap = qty

  }

  if(exportTypes.includes(doc.type)){

    xuat = qty

  }

  return {

    nhap,

    xuat,

    delta: nhap - xuat

  }

}


/* =========================================================
SORT ROWS
========================================================= */

function sortRows(state, rows){

  return [...rows].sort((a,b) => {

    const docA =
      getDocument(state, a)

    const docB =
      getDocument(state, b)

    const dayA =
      docA?.day || ""

    const dayB =
      docB?.day || ""

    if(dayA === dayB){

      return Number(a.id) - Number(b.id)

    }

    return dayA.localeCompare(dayB)

  })

}


/* =========================================================
RENDER
========================================================= */

function render(state){

  const body =
    $("ledger-body", state)

  if(!body) return


  const from =
    $("from-date", state).value

  const to =
    $("to-date", state).value


  const product =
    state.products.find(
      p =>
        Number(p.id) === state.productId
    )


  const importTypes =
    getImportTypes(state)

  const exportTypes =
    getExportTypes(state)


  /*
  Lấy tất cả dòng sản phẩm
  */

  let rows =
    getProductRows(state)


  /*
  Ghép chứng từ
  */

  rows = rows
    .map(item => {

      const doc =
        getDocument(state, item)

      return {

        item,

        doc

      }

    })
    .filter(row => {

      if(!row.doc) return false

      const type = row.doc.type

      return [

        ...importTypes,

        ...exportTypes

      ].includes(type)

    })


  /*
  Sắp xếp theo ngày
  */

  rows.sort((a,b) => {

    const dayA =
      a.doc.day || ""

    const dayB =
      b.doc.day || ""

    if(dayA === dayB){

      return Number(a.item.id) -
        Number(b.item.id)

    }

    return dayA.localeCompare(dayB)

  })


  /*
  TÍNH TỒN ĐẦU KỲ

  Tồn đầu kỳ = tất cả nhập - xuất
  trước ngày bắt đầu
  */

  let ton = 0

  rows.forEach(row => {

    const day =
      row.doc.day || ""

    if(from && day >= from) return

    const movement =
      getMovement(
        state,
        row.item,
        row.doc
      )

    ton += movement.delta

  })


  const tonDauKy = ton


  /*
  LỌC CHỨNG TỪ TRONG KỲ
  */

  const periodRows =
    rows.filter(row => {

      const day =
        row.doc.day || ""

      if(from && day < from) return false

      if(to && day > to) return false

      return true

    })


  /*
  RENDER TABLE

  Tồn đầu kỳ được giữ làm số dư
  ban đầu trước dòng đầu tiên
  */

  body.innerHTML = periodRows
    .map(row => {

      const item = row.item

      const doc = row.doc

      const movement =
        getMovement(
          state,
          item,
          doc
        )

      const nhap =
        movement.nhap

      const xuat =
        movement.xuat

      ton += movement.delta


      return `
        <tr>

          <td>
            ${doc.day || ""}
          </td>

          <td>
            ${doc.code || ""}
          </td>

          <td>
            ${doc.type || ""}
          </td>

          <td class="num">
            ${formatDecimal(nhap)}
          </td>

          <td class="num">
            ${formatDecimal(xuat)}
          </td>

          <td class="num">
            ${formatDecimal(ton)}
          </td>

        </tr>
      `

    })
    .join("")


  /*
  EMPTY
  */

  if(!periodRows.length){

    body.innerHTML = `
      <tr>

        <td
          colspan="7"
          style="
            text-align:center;
            padding:20px
          "
        >
          Không có dữ liệu
        </td>

      </tr>
    `

  }


  /*
  TITLE
  */

  const title =
    document.getElementById("page-title")

  if(title){

    title.textContent =
      "Thẻ kho - " +
      (product?.name || "")

  }


  /*
  LƯU TỒN ĐẦU KỲ

  Có thể sử dụng để hiển thị
  thêm dòng tồn đầu kỳ trên HTML
  */

  state.tonDauKy = tonDauKy

  state.tonCuoiKy = ton

}
