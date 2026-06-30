import {getAll} from "../../js/crud.js"
import {
  formatMoney,
  formatDecimal
} from "../../js/core/format.js"
import {
  createDatepicker
}
from "/js/ui/init-datepicker.js"

let root

let rows = []

let thead
let tbody
let toolbar

let docMap = {}
let customerMap = {}

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
  ()=>render()
)

createDatepicker(
  root,
  "#to-date",
  ()=>render(),
  {
    side: "right"
  }
)

await load()

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
  <input id="search-customer" placeholder="Khách hàng">
  <input id="search-product" placeholder="Sản phẩm">
</div>
  <button class="search-btn">
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

$("from-date")
?.addEventListener("input", render)

$("to-date")
?.addEventListener("input", render)

$("search-code")
?.addEventListener("input", render)

$("search-customer")
?.addEventListener("input", render)

$("search-product")
?.addEventListener("input", render)

}

/* =========================
LOAD
========================= */

async function load(){

rows = await getAll("document_items")

const docs =
await getAll("document")

const customers =
await getAll("data_customer")

docMap = Object.fromEntries(
docs.map(x => [x.id, x])
)

customerMap = Object.fromEntries(
customers.map(x => [x.id, x])
)

render()

}

/* =========================
RENDER
========================= */

function render(){

const fromDate =
$("from-date")?.value || ""

const toDate =
$("to-date")?.value || ""

const qCode =
($("search-code")?.value || "")
.toLowerCase()

const qCustomer =
($("search-customer")?.value || "")
.toLowerCase()

const qProduct =
($("search-product")?.value || "")
.toLowerCase()

let html = ""

for(const r of rows){

const doc =
docMap[r.id_doc] || {}

const customerId =
r.id_customer ||
doc.id_customer

const customer =
customerMap[customerId] || {}

const day =
doc.day ||
formatDate(r.created_at)

const code =
(doc.code || "")
.toLowerCase()

const customerName =
(customer.name || "")
.toLowerCase()

const productName =
(r.name || "")
.toLowerCase()

if(fromDate && day < fromDate) continue
if(toDate && day > toDate) continue
if(qCode && !code.includes(qCode)) continue
if(qCustomer && !customerName.includes(qCustomer)) continue
if(qProduct && !productName.includes(qProduct)) continue

html += `
<tr>

<td data-field="day">${day}</td>

<td data-field="code">
  ${doc.code || ""}
</td>

<td data-field="id_customer">
  ${customer.name || ""}
</td>

<td data-field="id_product">
  ${r.name || ""}
</td>

<td data-field="note">
  ${r.note || ""}
</td>

<td data-field="tongsoluong">
  ${formatDecimal(r.tongsoluong)}
</td>

<td data-field="dvtGoc">
  ${r.dvtGoc || ""}
</td>

<td data-field="dongia">
  ${formatMoney(r.dongia)}
</td>

<td data-field="thanhtien">
  ${formatMoney(r.thanhtien)}
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
UTIL
========================= */

function formatDate(v){

if(!v) return ""

return String(v).slice(0,10)

}

