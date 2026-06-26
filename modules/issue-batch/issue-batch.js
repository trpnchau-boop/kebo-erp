import {
getAll,
updateRow,
deleteRow
} from "../../js/crud.js"
import {formatMoney} from "../../js/core/format.js"
/* =========================
UTIL
========================= */
export async function init(params){

const ids =
String(params.ids || "")
.split(",")
.filter(Boolean)
.map(Number)

if(!ids.length){
alert("Không có chứng từ")
return
}

await runIssueBatch(ids)

}

function formatDateVN(v){

if(!v) return ""

const p = String(v).split("-")

if(p.length !== 3) return v

return `${p[2]}/${p[1]}/${p[0]}`
}

/* =========================
LOAD DATA
========================= */

export async function runIssueBatch(ids){

let rows = []

for(const rawId of ids){

const id = Number(rawId)

/* invoice */

const docs =
await getAll("tax_invoice",{id})

const doc = docs[0]

if(!doc) continue

/* customer */

const customers =
await getAll(
"data_customer",
{id:Number(doc.id_customer)}
)

const c = customers[0] || {}

/* items */

const items =
await getAll(
"tax_invoice_items",
{id_doc:id}
)

for(const item of items){

let ratio = 1

if(item.id_unit){

const unitRows = await getAll(
"product_unit",
{id:Number(item.id_unit)}
)

ratio =
Number(unitRows[0]?.ratio || 1)

}

const tongsoluong =
Number(
item.tongsoluong ??
item.qty ??
0
)

const qty =
item.qty ?? null

const price =
Number(item.dongia || 0)

rows.push({

/* db */

id:item.id,
docId:id,

/* invoice */

code:doc.code,
day:doc.day || "",

/* customer */

customer:c.code || "",
customer_name:
c.donvi || c.name || "",
mst:c.mst || "",
address:c.add || "",
buyer:c.name || "",

/* product */

product:item.name || "",
dvtGoc:item.dvtGoc || "",
ratio,

/* qty */

tongsoluong,
qty,

/* money */

price,
amount:
Number(item.thanhtien || 0)

})

}

}

renderPage(rows)

}



async function renderPage(rows){

const tbody =
document.getElementById(
"issue-batch-body"
)

tbody.innerHTML = rows.map((r,i)=>`
<tr>
<td>
<input type="checkbox"
checked
class="pick-row"
data-index="${i}">
</td>

<td>${r.code}</td>
<td>${r.product}</td>

<td>
<input
class="qty-input"
data-index="${i}"
value="${r.tongsoluong}"
style="width:70px">
</td>

<td>${r.dvtGoc}</td>

<td>${formatMoney(r.price)}</td>

<td class="amount-cell"
data-index="${i}">
${formatMoney(r.amount)}
</td>

</tr>
`).join("")

bindPopup(rows)

}

/* =========================
EVENTS
========================= */

function bindPopup(rows){

/* recalc realtime */

document
.querySelectorAll(".qty-input")
.forEach(input=>{

input.oninput = ()=>{

const i =
Number(input.dataset.index)

const row = rows[i]

row.tongsoluong =
Number(input.value || 0)

row.qty =
row.tongsoluong / row.ratio

row.amount =
row.tongsoluong * row.price

document.querySelector(
`.amount-cell[data-index="${i}"]`
).textContent =
formatMoney(row.amount)

}

})

/* save */

document.getElementById("issue-batch-save").onclick = async ()=>{

const checks =
[...document.querySelectorAll(".pick-row")]

const selected = []

for(const cb of checks){

  const i = Number(cb.dataset.index)
  const row = rows[i]

  if(cb.checked){

    const tongsoluong = Number(
    document.querySelector(
    `.qty-input[data-index="${i}"]`
    ).value || 0
    )

    const qty =
      row.ratio > 0
      ? tongsoluong / row.ratio
      : tongsoluong

    const amount =
      tongsoluong * Number(row.price || 0)

    await updateRow(
      "tax_invoice_items",
      row.id,
      {
        tongsoluong,
        qty,
        thanhtien: amount
      }
    )

    row.tongsoluong = tongsoluong
    row.qty = qty
    row.amount = amount

    selected.push(row)

  }else{

    await deleteRow(
      "tax_invoice_items",
      row.id
    )

  }

}

await exportExcel(selected)

alert("Đã cập nhật và xuất file")
}

/* close */

document.getElementById(
"issue-batch-close"
).onclick = closeBatch

}

/* =========================
EXPORT EXCEL
========================= */

async function exportExcel(rows){

if(typeof XLSX === "undefined"){
alert("Thiếu thư viện XLSX")
return
}

rows.sort((a,b)=>
a.docId - b.docId
)

const data = [[
"STT",
"Ngày",
"Mã KH",
"Tên đơn vị",
"MST",
"Địa chỉ",
"Người mua hàng",
"Email",
"HT thanh toán",
"Tên SP",
"ĐVT",
"Tổng SL",
"Đơn giá",
"Thành tiền"
]]

const groups = {}

rows.forEach(r=>{

if(!groups[r.docId]){
groups[r.docId] = []
}

groups[r.docId].push(r)

})

let stt = 1

Object
.values(groups)
.forEach(items=>{

items.forEach((r,index)=>{

const first =
index === 0

data.push([

stt,
first ? formatDateVN(r.day) : "",
first ? r.customer : "",
first ? r.customer_name : "",
first ? r.mst : "",
first ? r.address : "",
first ? r.buyer : "",
"",
first ? "CK/TM" : "",

r.product,
r.dvtGoc,
r.tongsoluong,
r.price,
r.amount

])

})

stt++

})

const ws =
XLSX.utils.aoa_to_sheet(data)

ws["!cols"] = [
{wch:6},
{wch:14},
{wch:16},
{wch:28},
{wch:18},
{wch:34},
{wch:20},
{wch:18},
{wch:20},
{wch:28},
{wch:10},
{wch:10},
{wch:10},
{wch:12},
{wch:14}
]

const wb =
XLSX.utils.book_new()

XLSX.utils.book_append_sheet(
wb,
ws,
"HoaDon"
)

const today =
new Date()
.toISOString()
.slice(0,10)

XLSX.writeFile(
wb,
`HoaDon-${today}.xlsx`
)

}

/* =========================
CLOSE
========================= */

function closeBatch(){

location.hash = "#/document-list/ISSUE"

}