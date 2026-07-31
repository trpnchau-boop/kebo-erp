// modules/stock/stock-transfer.js

import {stockState} from "./stock-state.js"
import {render} from "./stock-render.js"
import {loadStock} from "./stock-load.js"
import {saveDocument} from "./stock-save.js"
import {
  getStockRow,
  getProduct
}
from "./stock-helper.js"

import {
  getDropdownValue
}
from "/js/components/dropdown-select.js"

function $(root,id){
  return root.querySelector(`#${id}`)
}

export function toggleTransferMode(root){

  stockState.transferMode =
  !stockState.transferMode

  if(stockState.transferMode){
    stockState.checkMode = false
  }

  const btnTransfer =
  $(root,"btn-transfer")

  if(btnTransfer){

    btnTransfer.textContent =
    stockState.transferMode
    ? "Thoát"
    : "Chuyển kho"

  }

  const btnMode =
  $(root,"btn-mode")

  if(btnMode){

    btnMode.style.display =
    stockState.transferMode
    ? "none"
    : ""

  }

  render(root)

}

export function toggleTransferToolbar(root){

  const show =
  stockState.transferMode

  root
  .querySelectorAll(".transfer-col")
  .forEach(x=>{

    x.style.display =
    show ? "" : "none"

  })

}

export async function saveTransfer(root){

  const fromId =
  Number(
    getDropdownValue(
      $(root,"filter-kho")
    )
  )

  const toId =
  Number(
    getDropdownValue(
      $(root,"transfer-to")
    )
  )

  if(!fromId){
    alert("Chọn kho nguồn")
    return
  }

  if(!toId){
    alert("Chọn kho đích")
    return
  }

  if(fromId === toId){
    alert("Kho nguồn và kho đích trùng nhau")
    return
  }

  const items = []

  for(const key in stockState.transferCache){

    const qty =
    Number(
      stockState.transferCache[key]
    )

    if(qty <= 0)
      continue

    const [
      productId
    ] =
    key
    .split("_")
    .map(Number)

    const p =
    getProduct(productId)

    if(!p)
      continue

    const s =
    getStockRow(
      productId,
      fromId
    )

    if(!s)
      continue

    const max =
    Number(
      s.qty_balance || 0
    )

    if(qty > max)
      continue

    const cost =
    Number(
      s.avg_cost || 0
    )

    items.push(

      {

        id_product: productId,
        parent_id:
          p.parent_id || null,
        line:
          p.dinhluong || 0,

        id_warehouse:
          fromId,

        qty: -qty,
        tongsoluong: -qty,

        name:
          p.name || "",

        dvtGoc:
          p.dvtGoc || "",

        id_unit:
          p.id_unit || null,

        dongiavon:
          cost,

        tienvon:
          -qty * cost,

        note:
          "Chuyển kho xuất"

      },

      {

        id_product: productId,
        parent_id:
          p.parent_id || null,
        line:
          p.dinhluong || 0,

        id_warehouse:
          toId,

        qty: qty,
        tongsoluong: qty,

        name:
          p.name || "",

        dvtGoc:
          p.dvtGoc || "",

        id_unit:
          p.id_unit || null,

        dongiavon:
          cost,

        tienvon:
          qty * cost,

        note:
          "Chuyển kho nhập"

      }

    )

  }

  if(!items.length){
    alert("Không có số lượng chuyển")
    return
  }

  const doc =
  await saveDocument(
    "TRANSFER",
    {
      note:"Chuyển kho nội bộ"
    },
    items
  )

  if(!doc)
    return

  alert("Đã lưu chuyển kho")

  stockState.transferCache = {}

  stockState.transferMode = false
  stockState.onlyChanged = false

  await loadStock(root)

}