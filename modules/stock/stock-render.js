// modules/stock/stock-render.js

import {stockState} from "./stock-state.js"
import {openTab} from "../../js/tabs.js"
import {
  formatMoney,
  formatDecimal
} from "../../js/core/format.js"
import {isCheckMode} from "./stock-check.js"
import {toggleTransferToolbar}
from "./stock-transfer.js"
import {
  getDropdownValue
}
from "/js/components/dropdown-select.js"

function $(root,id){
 return root.querySelector(`#${id}`)
}

export function render(root){

const body = $(root,"stock-body")

if(!body) return

const keyword =
$(root,"search-stock")
?.value
?.trim()
?.toLowerCase() || ""

const khoId =
getDropdownValue(
  $(root,"filter-kho")
)

const status =
getDropdownValue(
  $(root,"filter-status")
)

let rows = [...stockState.rows]

rows = rows.filter(r=>{

if(
khoId &&
String(r.id_warehouse) !== String(khoId)
){
return false
}

const p =
stockState.productMap[r.id_product] || {}

const txt =
`${p.code || ""} ${p.name || ""}`
.toLowerCase()

if(keyword && !txt.includes(keyword)){
return false
}

const qty =
Number(r.qty_balance || 0)

if(status==="positive" && qty<=0)
return false

if(status==="zero" && qty!==0)
return false

if(status==="negative" && qty>=0)
return false

return true

})

const checkMode =
isCheckMode()

const transferMode =
stockState.transferMode

const colspan =
transferMode || checkMode
? 10
: 8

if(!rows.length){

body.innerHTML = `
<tr>
<td colspan="${colspan}"
style="text-align:center;padding:20px">
Không có dữ liệu
</td>
</tr>
`

toggleTransferToolbar(root)
return

}

body.innerHTML = rows.map(r=>{

const p =
stockState.productMap[r.id_product] || {}

const kho =
stockState.warehouseMap[r.id_warehouse] || {}

const qty =
Number(r.qty_balance || 0)

const qtyClass =
qty < 0
? "color:#dc2626;font-weight:600"
: qty === 0
? "color:#6b7280"
: ""

return `
<tr>

<td>
<a href="#" class="stock-ledger-link" data-id="${r.id_product}">
${p.code || ""}
</a>
</td>

<td>${p.name || ""}</td>

<td>${kho.name || ""}</td>

<td class="num" style="${qtyClass}">
${formatDecimal(qty)}
</td>

${
checkMode
? `
<td class="check-col">
<input
type="number"
class="table-input count-input"
value="${qty}"
data-system="${qty}"
data-product="${r.id_product}"
data-warehouse="${r.id_warehouse}"
>
</td>

<td class="check-col diff-cell">
0
</td>
`
: ""
}

${
transferMode
? `
<td class="transfer-col">
<input
type="number"
min="0"
max="${qty > 0 ? qty : 0}"
value="0"
class="table-input transfer-qty"
data-product="${r.id_product}"
data-warehouse="${r.id_warehouse}"
>
</td>
`
: ""
}

<td class="num">
${formatMoney(r.avg_cost)}
</td>

<td class="num">
${formatMoney(r.stock_value)}
</td>

</tr>
`

}).join("")

toggleTransferToolbar(root)
bindLedgerButtons(root)

if(checkMode){
bindCheckInputs(root)
}

}

/* =========================
LEDGER BUTTON
========================= */

function bindLedgerButtons(root){

root.querySelectorAll(".stock-ledger-link")
.forEach(btn=>{

btn.onclick = ()=>{

const id = btn.dataset.id

openTab(
`stock-ledger-${id}`,
"Thẻ kho",
"stock",
{
type:"ledger",
ref:id
}
)

}

})

}

/* =========================
CHECK INPUT
========================= */

function bindCheckInputs(root){

root.querySelectorAll(".count-input")
.forEach(input=>{

input.oninput = ()=>{

const tr =
input.closest("tr")

const diffCell =
tr.querySelector(".diff-cell")

if(!diffCell) return

const sys =
Number(input.dataset.system || 0)

const real =
Number(input.value || 0)

const diff =
real - sys

diffCell.textContent =
formatDecimal(diff)

diffCell.style.color =
diff > 0
? "green"
: diff < 0
? "red"
: ""

}

})

}