import {db} from "/js/supabase.js"
import {openTab} from "/js/tabs.js"
import {
  formatMoney,
  formatDecimal
} from "/js/core/format.js"
import {
  createDatepicker
}
from "/js/ui/init-datepicker.js"

let root

let rows = []

let thead
let tbody
let toolbar

let loadedFrom = ""
let loadedTo = ""
let loading = false

function $(id){
  return root.querySelector(`#${id}`)
}

export async function init(params={}, pageRoot){

  root = pageRoot

  thead   = $("thead")
  tbody   = $("tbody")
  toolbar = $("toolbar")

  buildToolbar()
  buildHeader()

  createDatepicker(
    root,
    "#from-date",
    handleDateChange
  )

  createDatepicker(
    root,
    "#to-date",
    handleDateChange,
    {
      side: "right"
    }
  )

  await loadCurrentMonth()

  bindEvents()

}

/* =========================
UI
========================= */

function buildToolbar(){

  toolbar.innerHTML = `  

<div class="search-wrap">
<div class="search-group">
  <input id="search-code" placeholder="Số CT">
  <span id="search-code-label">Số CT</span>
  <input id="search-customer" placeholder="Khách hàng">
  <input id="search-product" placeholder="Sản phẩm">
</div>
  <button class="search-btn" type="button">
    🔍
  </button>

</div>

<div class="date-filter">
  <span>Từ ngày:</span>
  <input id="from-date" placeholder="yyyy-mm-dd">
</div>

<div class="date-filter">
  <span>Đến ngày:</span>
  <input id="to-date" placeholder="yyyy-mm-dd">
</div>

`

}

function buildHeader(){

thead.innerHTML = `
<tr>
<th>Ngày</th>
<th>Số CT</th>
<th>Khách hàng</th>
<th>Sản phẩm</th>
<th>Ghi chú</th>
<th>Số lượng</th>
<th>ĐVT</th>
<th>Đơn giá</th>
<th>Thành tiền</th>
</tr>
`

}

function bindEvents(){

  $("tbody")
  ?.addEventListener(
    "click",
    async e => {

      const link =
        e.target.closest(".barcode-link")

      if(!link){
        return
      }

      e.preventDefault()

      const id =
        link.dataset.id

      const type =
        link.dataset.type

      if(!id || !type){
        return
      }

      await openTab(
        `document-${type}-${id}`,
        link.textContent.trim(),
        "document",
        {
          type,
          id
        }
      )

    }
  )

  root.querySelector(".search-btn")
  ?.addEventListener(
    "click",
    render
  )

  $("search-code")
  ?.addEventListener(
    "keydown",
    handleSearchKeydown
  )

  $("search-customer")
  ?.addEventListener(
    "keydown",
    handleSearchKeydown
  )

  $("search-product")
  ?.addEventListener(
    "keydown",
    handleSearchKeydown
  )

}

function handleSearchKeydown(e){

  if(e.key !== "Enter"){
    return
  }

  e.preventDefault()
  render()

}

async function handleDateChange(){

  const range = getRequestedRange()

  if(
    range.from >= loadedFrom &&
    range.to <= loadedTo
  ){
    render()
    return
  }

  await loadRange(
    range.from,
    range.to
  )

}

/* =========================
LOAD
========================= */

async function loadCurrentMonth(){

  const range = getCurrentMonthRange()

  $("from-date").value = range.from
  $("to-date").value = range.to

  $("search-code").value = "BH"

  $("search-code")
  ?.addEventListener("focus", () => {
    $("search-code-label").style.display = "none"
  }, { once: true })

  await loadRange(
    range.from,
    range.to
  )

}

async function loadRange(from, to){

  if(loading){
    return
  }

  loading = true
  setLoading(true)

  try{

    const {
      data: docs,
      error: docError
    } = await db
      .from("document")
      .select("id,code,day,type,id_customer")
      .gte("day", from)
      .lte("day", to)
      .order("day", {ascending:false})
      .order("id", {ascending:false})

    if(docError){
      throw docError
    }

    const documents = docs || []
    const documentIds = documents.map(x => x.id)

    if(!documentIds.length){
      rows = []
      loadedFrom = from
      loadedTo = to
      render()
      return
    }

    const items =
      await loadItemsByDocumentIds(documentIds)

    const customers =
      await loadCustomers(documents, items)

    const docMap = Object.fromEntries(
      documents.map(x => [x.id, x])
    )

    const customerMap = Object.fromEntries(
      customers.map(x => [x.id, x])
    )

    rows = items.map(item => {

      const doc =
        docMap[item.id_doc] || {}

      const customerId =
        item.id_customer ||
        doc.id_customer

      const customer =
        customerMap[customerId] || {}

      const day =
        doc.day ||
        formatDate(item.created_at)

      return {
        item,
        doc,
        customer,
        day,
        code: String(doc.code || "").toLowerCase(),
        customerName: String(customer.name || "").toLowerCase(),
        productName: String(item.name || "").toLowerCase()
      }

    })

    rows.sort((a, b) => {

      if(a.day !== b.day){
        return b.day.localeCompare(a.day)
      }

      return String(b.doc.id || "")
        .localeCompare(String(a.doc.id || ""))

    })

    loadedFrom = from
    loadedTo = to

    render()

  }catch(error){

    console.error("LOAD DOCUMENT ITEMS ERROR", error)
    alert(error.message || "Không tải được dữ liệu tra cứu")

  }finally{

    loading = false
    setLoading(false)

  }

}

async function loadItemsByDocumentIds(documentIds){

  const chunks = chunk(documentIds, 500)

  const results = await Promise.all(
    chunks.map(async ids => {

      const {
        data,
        error
      } = await db
        .from("document_items")
        .select("id,id_doc,id_customer,name,note,tongsoluong,dvtGoc,dongia,thanhtien,created_at")
        .in("id_doc", ids)

      if(error){
        throw error
      }

      return data || []

    })
  )

  return results.flat()

}

async function loadCustomers(documents, items){

  const customerIds = [
    ...new Set([
      ...documents
        .map(x => x.id_customer)
        .filter(Boolean),
      ...items
        .map(x => x.id_customer)
        .filter(Boolean)
    ])
  ]

  if(!customerIds.length){
    return []
  }

  const chunks = chunk(customerIds, 500)

  const results = await Promise.all(
    chunks.map(async ids => {

      const {
        data,
        error
      } = await db
        .from("data_customer")
        .select("id,name")
        .in("id", ids)

      if(error){
        throw error
      }

      return data || []

    })
  )

  return results.flat()

}

/* =========================
RENDER
========================= */

function render(){

  if(!tbody){
    return
  }

  const fromDate =
    $("from-date")?.value || ""

  const toDate =
    $("to-date")?.value || ""

  const qCode =
    normalize($("search-code")?.value)

  const qCustomer =
    normalize($("search-customer")?.value)

  const qProduct =
    normalize($("search-product")?.value)

  let html = ""

  for(const row of rows){

    const {
      item,
      doc,
      customer,
      day,
      code,
      customerName,
      productName
    } = row

    if(fromDate && day < fromDate) continue
    if(toDate && day > toDate) continue
    if(qCode && !code.includes(qCode)) continue
    if(qCustomer && !customerName.includes(qCustomer)) continue
    if(qProduct && !productName.includes(qProduct)) continue

    html += `
<tr>

<td data-field="day">${day}</td>

<td data-field="code">
  <a
    href="#"
    class="barcode-link"
    data-id="${doc.id}"
    data-type="${doc.type || ""}"
  >
    ${doc.code || ""}
  </a>
</td>

<td data-field="id_customer">
  ${customer.name || ""}
</td>

<td data-field="id_product">
  ${item.name || ""}
</td>

<td data-field="note">
  ${item.note || ""}
</td>

<td data-field="tongsoluong">
  ${formatDecimal(item.tongsoluong)}
</td>

<td data-field="dvtGoc">
  ${item.dvtGoc || ""}
</td>

<td data-field="dongia">
  ${formatMoney(item.dongia)}
</td>

<td data-field="thanhtien">
  ${formatMoney(item.thanhtien)}
</td>

</tr>
`

  }

  tbody.innerHTML =
    html ||
    `
<tr>
<td colspan="9" style="text-align:center;padding:20px">
Không có dữ liệu
</td>
</tr>
`

}

/* =========================
HELPERS
========================= */

function getCurrentMonthRange(){

  const now = new Date()

  const year = now.getFullYear()
  const month = now.getMonth()

  const from =
    `${year}-${String(month + 1).padStart(2,"0")}-01`

  const lastDay =
    new Date(year, month + 1, 0).getDate()

  const to =
    `${year}-${String(month + 1).padStart(2,"0")}-${String(lastDay).padStart(2,"0")}`

  return {from, to}

}

function getRequestedRange(){

  const fromInput =
    $("from-date")?.value || ""

  const toInput =
    $("to-date")?.value || ""

  if(!fromInput && !toInput){
    return getCurrentMonthRange()
  }

  if(fromInput && toInput){
    return normalizeRange(fromInput, toInput)
  }

  if(fromInput){
    const [year, month] = fromInput.split("-").map(Number)
    const lastDay =
      new Date(year, month, 0).getDate()

    return normalizeRange(
      fromInput,
      `${year}-${String(month).padStart(2,"0")}-${String(lastDay).padStart(2,"0")}`
    )
  }

  const [year, month] = toInput.split("-").map(Number)

  return normalizeRange(
    `${year}-${String(month).padStart(2,"0")}-01`,
    toInput
  )

}

function normalizeRange(from, to){

  if(from <= to){
    return {from, to}
  }

  return {
    from: to,
    to: from
  }

}

function normalize(value){

  return String(value || "")
    .trim()
    .toLowerCase()

}

function chunk(array, size){

  const result = []

  for(let i = 0; i < array.length; i += size){
    result.push(
      array.slice(i, i + size)
    )
  }

  return result

}

function setLoading(isLoading){

  if(!tbody){
    return
  }

  if(isLoading){
    tbody.innerHTML = `
<tr>
<td colspan="9" style="text-align:center;padding:20px">
Đang tải dữ liệu...
</td>
</tr>
`
  }

}

function formatDate(v){

  if(!v) return ""

  return String(v).slice(0,10)

}
