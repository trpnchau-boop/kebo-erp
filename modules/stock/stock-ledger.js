import {getAll} from "../../js/crud.js"
import {formatDecimal} from "../../js/core/format.js"

import {
  createDatepicker
}
from "/js/ui/init-datepicker.js"

export async function init(params = {}, root){

const state = {
root,

productId : Number(
params.id ||
params.ref ||
new URLSearchParams(location.search).get("id") ||
0
),

docs: [],
items: [],
products: [],
}

initDate(state)

createDatepicker(
  state.root,
  "#from-date",
  ()=>render(state)
)

createDatepicker(
  state.root,
  "#to-date",
  ()=>render(state)
)

bindEvents(state)

await loadMaster(state)
await loadData(state)

}

/* =========================
HELPER
========================= */

function $(state,id){
return state.root.querySelector(`#${id}`)
}

/* =========================
INIT
========================= */

function initDate(state){

const today = new Date()

const to =
today.toISOString().slice(0,10)

const fromDate = new Date()
fromDate.setDate(today.getDate() - 30)

const from =
fromDate.toISOString().slice(0,10)

$(state,"from-date").value = from
$(state,"to-date").value = to

}

function bindEvents(state){

$(state,"btn-load")
?.addEventListener(
"click",
()=>render(state)
)

}

/* =========================
LOAD
========================= */

async function loadMaster(state){

const products =
await getAll("data_product")

state.products = products

}

async function loadData(state){

const [docs,items] =
await Promise.all([
getAll("document"),
getAll("document_items")
])

state.docs = docs
state.items = items

render(state)

}

/* =========================
RENDER
========================= */

function render(state){

const body =
$(state,"ledger-body")

const from =
$(state,"from-date").value

const to =
$(state,"to-date").value

const product =
state.products.find(
x => Number(x.id) === state.productId
)

let rows =
state.items.filter(r =>
Number(r.id_product) === state.productId
)

rows = rows.filter(r=>{

const doc =
state.docs.find(
x => Number(x.id) === Number(r.id_doc)
)

if(!doc) return false

if(from && doc.day < from) return false
if(to && doc.day > to) return false

const stockTypes = [
  "IMPORT",
  "EXPORT",
  "ADJUST",
  "TRANSFER"
]

if(
  !stockTypes.includes(doc.type)
){
  return false
}

return true

})

rows.sort((a,b)=>{

const da =
state.docs.find(
x => Number(x.id) === Number(a.id_doc)
)?.day || ""

const db =
state.docs.find(
x => Number(x.id) === Number(b.id_doc)
)?.day || ""

if(da === db){
return Number(a.id) - Number(b.id)
}

return da.localeCompare(db)

})

let ton = 0

body.innerHTML = rows.map(r=>{

const doc =
state.docs.find(
x => Number(x.id) === Number(r.id_doc)
) || {}

const qty =
Number(r.tongsoluong || 0)

let nhap = 0
let xuat = 0

if(doc.type === "IMPORT"){
nhap = qty
ton += qty
}

if(doc.type === "EXPORT"){
xuat = qty
ton -= qty
}

return `
<tr>
<td>${doc.day || ""}</td>
<td>${doc.code || ""}</td>
<td>${doc.type || ""}</td>

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

}).join("")

if(!rows.length){

body.innerHTML = `
<tr>
<td colspan="7" style="text-align:center;padding:20px">
Không có dữ liệu
</td>
</tr>
`

}

const title =
document.getElementById("page-title")

if(title){
title.textContent =
"Thẻ kho - " + (product?.name || "")
}

}