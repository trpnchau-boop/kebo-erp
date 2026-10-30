// modules/stock/stock-load.js

import {getAll} from "../../js/crud.js"
import {stockState} from "./stock-state.js"
import {render} from "./stock-render.js"
import {renderDropdownSelect} from "/js/components/dropdown-select.js"

function $(root,id){ return root.querySelector(`#${id}`) }

export async function loadMaster(root){
  const products = await getAll("data_product")
  const warehouses = await getAll("set_kho")

  stockState.productMap = {}
  stockState.warehouseMap = {}
  products.forEach(x => stockState.productMap[x.id] = x)
  warehouses.forEach(x => stockState.warehouseMap[x.id] = x)

  const sourceEl = $(root,"stock-source")
  if(sourceEl){
    sourceEl.innerHTML = renderDropdownSelect({
      value: stockState.stockSource,
      allowEmpty:false,
      className:"stock-filter",
      options:[
        {value:"stock",label:"Kho hàng"},
        {value:"tax",label:"Kho thuế"}
      ]
    })
  }

  const el = $(root,"filter-kho")
  if(el){
    el.innerHTML = renderDropdownSelect({
      value:"",
      allowEmpty:false,
      className:"stock-filter",
      options:[
        {value:"",label:"Tất cả kho"},
        ...warehouses.map(x=>({value:x.id,label:x.name || x.code}))
      ]
    })
  }

  const statusEl = $(root,"filter-status")
  if(statusEl){
    statusEl.innerHTML = renderDropdownSelect({
      value:"",
      allowEmpty:false,
      className:"stock-filter",
      options:[
        {value:"",label:"Tất cả"},
        {value:"positive",label:"Còn hàng"},
        {value:"zero",label:"Hết hàng"},
        {value:"negative",label:"Âm kho"}
      ]
    })
  }

  fillTransferSelect(root,"transfer-to",warehouses)
  syncSourceControls(root)
}

export async function loadStock(root){
  const body = $(root,"stock-body")
  if(body) body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px">Đang tải...</td></tr>`

  const view = stockState.stockSource === "tax"
    ? "vw_tax_inventory"
    : "vw_stock"

  stockState.rows = await getAll(view)
  render(root)
}

export function syncSourceControls(root){
  const isTax = stockState.stockSource === "tax"
  const warehouseFilter = $(root,"filter-kho")
  const transferButton = $(root,"btn-transfer")
  const transferSave = $(root,"btn-save-transfer")
  const transferTo = $(root,"transfer-to")

  if(warehouseFilter) warehouseFilter.style.display = isTax ? "none" : ""
  if(transferButton) transferButton.style.display = isTax ? "none" : ""
  if(transferSave) transferSave.style.display = isTax ? "none" : ""
  if(transferTo) transferTo.style.display = isTax ? "none" : ""

  if(isTax && stockState.transferMode){
    stockState.transferMode = false
  }
}

function fillTransferSelect(root,id,list){
  const el = $(root,id)
  if(!el) return
  el.innerHTML = renderDropdownSelect({
    value:"",
    allowEmpty:false,
    className:"stock-filter",
    options:[
      {value:"",label:"Kho đích"},
      ...list.map(x=>({value:x.id,label:x.name || x.code || ""}))
    ]
  })
}
