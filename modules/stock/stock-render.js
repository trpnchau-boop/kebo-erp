// modules/stock/stock-render.js

import {stockState} from "./stock-state.js"
import {openTab} from "../../js/tabs.js"
import {formatMoney,formatDecimal} from "../../js/core/format.js"
import {isCheckMode} from "./stock-check.js"
import {toggleTransferToolbar} from "./stock-transfer.js"
import {getDropdownValue} from "/js/components/dropdown-select.js"

function $(root,id){ return root.querySelector(`#${id}`) }

export function render(root){
  const body = $(root,"stock-body")
  if(!body) return

  const isTax = stockState.stockSource === "tax"
  const keyword = $(root,"search-stock")?.value?.trim()?.toLowerCase() || ""
  const khoId = isTax ? "" : getDropdownValue($(root,"filter-kho"))
  const status = getDropdownValue($(root,"filter-status"))
  const checkMode = isCheckMode()
  const transferMode = !isTax && stockState.transferMode

  let rows = [...stockState.rows].filter(r=>{
    if(!isTax && khoId && String(r.id_warehouse) !== String(khoId)) return false
    const p = stockState.productMap[r.id_product] || {}
    if(keyword && !`${p.code||""} ${p.name||""}`.toLowerCase().includes(keyword)) return false
    const qty = Number(r.qty_balance || 0)
    if(status==="positive" && qty<=0) return false
    if(status==="zero" && qty!==0) return false
    if(status==="negative" && qty>=0) return false
    if(stockState.onlyChanged){
      const key = `${r.id_product}_${isTax ? "tax" : r.id_warehouse}`
      return checkMode ? key in stockState.checkCache : key in stockState.transferCache
    }
    return true
  })

  const {field,dir} = stockState.sort
  rows.sort((a,b)=>{
    const pa=stockState.productMap[a.id_product]||{}
    const pb=stockState.productMap[b.id_product]||{}
    const wa=stockState.warehouseMap[a.id_warehouse]||{}
    const wb=stockState.warehouseMap[b.id_warehouse]||{}
    const value=(r,p,w)=>{
      switch(field){
        case "code": return p.code||""
        case "name": return p.name||""
        case "dvt": return p.dvtGoc||""
        case "tinh_chat": return p.tinhchat||p.tinh_chat||""
        case "warehouse": return w.name||""
        case "qty": return Number(r.qty_balance||0)
        case "cost": return Number(r.avg_cost||0)
        case "value": return Number(r.stock_value||0)
        default: return ""
      }
    }
    let va=value(a,pa,wa), vb=value(b,pb,wb)
    if(typeof va==="string"){va=va.toLowerCase();vb=vb.toLowerCase()}
    return va<vb ? (dir==="asc"?-1:1) : va>vb ? (dir==="asc"?1:-1) : 0
  })

  // Hide fields not relevant to the selected stock source.
  const headers = root.querySelectorAll("thead th")
  headers.forEach(th=>{
    if(th.dataset.sort==="warehouse") th.style.display=isTax?"none":""
    if(th.classList.contains("transfer-col")) th.style.display=transferMode?"":"none"
    if(th.classList.contains("check-col")) th.style.display=checkMode?"":"none"
    if(th.textContent.includes("Giá vốn") || th.textContent.includes("Giá trị tồn")) th.style.display=isTax?"none":""
  })

  updateChangedChip(root)
  if(!rows.length){
    body.innerHTML=`<tr><td colspan="${isTax?6:(checkMode?10:transferMode?9:8)}" style="text-align:center;padding:20px">Không có dữ liệu</td></tr>`
    toggleTransferToolbar(root)
    return
  }

  body.innerHTML=rows.map(r=>{
    const p=stockState.productMap[r.id_product]||{}
    const warehouse=stockState.warehouseMap[r.id_warehouse]||{}
    const qty=Number(r.qty_balance||0)
    const qtyClass=qty<0?"color:#dc2626;font-weight:600":qty===0?"color:#6b7280":""
    const key=`${r.id_product}_${isTax?"tax":r.id_warehouse}`
    const checkValue=stockState.checkCache[key]??qty
    const transferValue=stockState.transferCache[key]??0
    const diff=checkValue-qty
    const diffColor=diff>0?"green":diff<0?"red":""
    return `<tr>
      <td><a href="#" class="barcode-link" data-id="${r.id_product}">${p.code||""}</a></td>
      <td>${p.name||""}</td>
      <td>${p.tinhchat||p.tinh_chat||r.tinh_chat||""}</td>
      <td>${p.dvtGoc||r.dvtGoc||""}</td>
      <td style="${isTax?"display:none":""}">${warehouse.name||""}</td>
      <td class="num" style="${qtyClass}">${formatDecimal(qty)}</td>
      ${checkMode?`<td class="check-col"><input type="number" class="table-input count-input" value="${checkValue}" data-system="${qty}" data-product="${r.id_product}" data-warehouse="${isTax?"tax":r.id_warehouse}"></td><td class="check-col diff-cell" style="color:${diffColor}">${formatDecimal(diff)}</td>`:""}
      ${transferMode?`<td class="transfer-col"><input type="number" min="0" max="${qty>0?qty:0}" value="${transferValue}" class="table-input transfer-qty" data-product="${r.id_product}" data-warehouse="${r.id_warehouse}"></td>`:""}
      <td class="num" style="${isTax?"display:none":""}">${formatMoney(r.avg_cost)}</td>
      <td class="num" style="${isTax?"display:none":""}">${formatMoney(r.stock_value)}</td>
    </tr>`
  }).join("")

  toggleTransferToolbar(root)
  bindLedgerButtons(root,isTax)
  bindSort(root)
  bindChangedChip(root)
  if(checkMode) bindCheckInputs(root)
  if(transferMode) bindTransferInputs(root)
}

function bindLedgerButtons(root, isTax){

  root.querySelectorAll(".barcode-link").forEach(btn => {

    btn.onclick = e => {

      e.preventDefault()

      const productId = btn.dataset.id

      openTab(
        `stock-ledger-${productId}-${isTax ? "tax" : "normal"}`,
        "Thẻ kho",
        "stock",
        {
          type: "ledger",
          ref: productId,
          isTax: isTax
        }
      )

    }

  })

}


function bindCheckInputs(root){
  root.querySelectorAll(".count-input").forEach(input=>{
    input.oninput=()=>{
      const tr=input.closest("tr")
      const diffCell=tr.querySelector(".diff-cell")
      if(!diffCell) return
      const sys=Number(input.dataset.system||0)
      const real=Number(input.value||0)
      const key=`${input.dataset.product}_${input.dataset.warehouse}`
      if(real===sys) delete stockState.checkCache[key]
      else stockState.checkCache[key]=real
      const diff=real-sys
      diffCell.textContent=formatDecimal(diff)
      diffCell.style.color=diff>0?"green":diff<0?"red":""
      updateChangedChip(root)
    }
  })
}

function bindTransferInputs(root){
  root.querySelectorAll(".transfer-qty").forEach(input=>{
    input.oninput=()=>{
      const key=`${input.dataset.product}_${input.dataset.warehouse}`
      const qty=Number(input.value||0)
      if(qty<=0) delete stockState.transferCache[key]
      else stockState.transferCache[key]=qty
      updateChangedChip(root)
    }
  })
}

function bindSort(root){
  root.querySelectorAll("thead th[data-sort]").forEach(th=>{
    th.onclick=()=>{
      const field=th.dataset.sort
      if(stockState.sort.field===field) stockState.sort.dir=stockState.sort.dir==="asc"?"desc":"asc"
      else {stockState.sort.field=field;stockState.sort.dir="asc"}
      render(root)
    }
  })
}

function bindChangedChip(root){
  const chip=$(root,"btn-changed")
  if(chip) chip.onclick=()=>{stockState.onlyChanged=!stockState.onlyChanged;render(root)}
}

function updateChangedChip(root){
  const chip=$(root,"btn-changed")
  if(!chip) return
  const count=isCheckMode()?Object.keys(stockState.checkCache).length:stockState.transferMode?Object.keys(stockState.transferCache).length:0
  if(!count) stockState.onlyChanged=false
  chip.style.display=count?"":"none"
  chip.textContent=`Chọn: ${count}`
  chip.classList.toggle("active",stockState.onlyChanged)
}
