// modules/stock/stock-check.js

import {render} from "./stock-render.js"
import {stockState} from "./stock-state.js"
import {saveDocument} from "./stock-save.js"
import {loadStock} from "./stock-load.js"
import {
getStockRow,
getProduct
} from "./stock-helper.js"

function $(root,id){
  return root.querySelector(`#${id}`)
}

export function isCheckMode(){
  return stockState.checkMode
}

export function toggleCheckMode(root){

  stockState.checkMode =
  !stockState.checkMode

  if(stockState.checkMode){
    stockState.transferMode = false
  }

  root
  .querySelectorAll(".check-col")
  .forEach(x=>{
    x.style.display =
    stockState.checkMode ? "" : "none"
  })

  const btnSave =
  $(root,"btn-save-check")

  if(btnSave){
    btnSave.style.display =
    stockState.checkMode ? "" : "none"
  }

  const btnMode =
  $(root,"btn-mode")

  if(btnMode){
    btnMode.textContent =
    stockState.checkMode
    ? "Thoát"
    : "Kiểm kê"
  }

  const btnTransfer =
  $(root,"btn-transfer")

  if(btnTransfer){
    btnTransfer.style.display =
    stockState.checkMode
    ? "none"
    : ""
  }

  render(root)

}

export async function saveCheck(root){

  const items = []

 for(const key in stockState.checkCache){

  const real =
  Number(stockState.checkCache[key])

  const [
    productId,
    warehouseId
  ] = key.split("_").map(Number)

  const s =
  getStockRow(
    productId,
    warehouseId
  )

  if(!s) continue

  const sys =
  Number(s.qty_balance || 0)

  const diff =
  real - sys

  if(diff === 0) continue

  const p =
  getProduct(productId)

  const cost =
  Number(s.avg_cost || 0)

  items.push({

    id_product: productId,
    parent_id: p.parent_id || null,
    line: p.dinhluong || 0,
    id_warehouse: warehouseId,

    qty: diff,
    tongsoluong: diff,

    name: p.name || "",
    dvtGoc: p.dvtGoc || "",
    id_unit: p.id_unit || null,

    dongiavon: cost,
    tienvon: diff * cost,

    note:
      diff > 0
      ? "Kiểm kê tăng"
      : "Kiểm kê giảm"

  })

 }

  if(!items.length){
    alert("Không có chênh lệch")
    return
  }

  const doc =
  await saveDocument(
    "ADJUST",
    {
      note:"Kiểm kê kho"
    },
    items
  )

  if(!doc) return

  alert("Đã lưu kiểm kê")

  stockState.checkCache = {}

  stockState.checkMode = false
  stockState.onlyChanged = false

  await loadStock(root)


}