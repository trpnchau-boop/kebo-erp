// modules/stock/stock-check.js
import {render} from "./stock-render.js"
import {stockState} from "./stock-state.js"
import {saveDocument} from "./stock-save.js"
import {loadStock} from "./stock-load.js"
import {getStockRow,getProduct} from "./stock-helper.js"
import {saveTaxInvoice} from "../document/actions/save-tax-invoice.js"
import {DOCUMENT_TYPES} from "../document/document-types.js"

function $(root,id){return root.querySelector(`#${id}`)}
export function isCheckMode(){return stockState.checkMode}

export function toggleCheckMode(root){
  stockState.checkMode=!stockState.checkMode
  if(stockState.checkMode) stockState.transferMode=false

  root.querySelectorAll(".check-col").forEach(x=>x.style.display=stockState.checkMode?"":"none")
  const save=$(root,"btn-save-check")
  if(save) save.style.display=stockState.checkMode?"":"none"
  const mode=$(root,"btn-mode")
  if(mode) mode.textContent=stockState.checkMode?"Thoát":"Kiểm kê"
  const transfer=$(root,"btn-transfer")
  if(transfer) transfer.style.display=stockState.checkMode||stockState.stockSource==="tax"?"none":""
  render(root)
}

export async function saveCheck(root){
  const isTax=stockState.stockSource==="tax"
  const groups={XML_IN:[],ISSUE:[]}

  for(const key in stockState.checkCache){
    const real=Number(stockState.checkCache[key])
    const [productId,warehouseKey]=key.split("_")
    const product= getProduct(Number(productId))
    const row=isTax
      ? stockState.rows.find(x=>Number(x.id_product)===Number(productId))
      : getStockRow(Number(productId),Number(warehouseKey))
    if(!row||!product) continue

    const system=Number(row.qty_balance||0)
    const diff=real-system
    if(!diff) continue

    const item={
      id_product:Number(productId),
      parent_id:product.parent_id||null,
      line:product.dinhluong||0,
      id_warehouse:isTax?null:Number(warehouseKey),
      qty:Math.abs(diff),
      tongsoluong:Math.abs(diff),
      name:product.name||"",
      dvtGoc:product.dvtGoc||row.dvtGoc||"",
      id_unit:product.id_unit||null,
      dongia:0,
      thanhtien:0,
      dongiavon:0,
      tienvon:0,
      note:diff>0?"Kiểm kê tăng":"Kiểm kê giảm"
    }

    if(isTax) groups[diff>0?"XML_IN":"ISSUE"].push(item)
    else {
      item.qty=diff
      item.tongsoluong=diff
      item.dongiavon=Number(row.avg_cost||0)
      item.tienvon=diff*item.dongiavon
      groups.ADJUST ||= []
      groups.ADJUST.push(item)
    }
  }

  const entries=isTax
    ? [["XML_IN",groups.XML_IN],["ISSUE",groups.ISSUE]].filter(([,items])=>items.length)
    : [["ADJUST",groups.ADJUST||[]]].filter(([,items])=>items.length)

  if(!entries.length){alert("Không có chênh lệch");return}

  let saved=0
  for(const [type,items] of entries){
    let result
    if(isTax){
      result=await saveTaxInvoice({
        schema:DOCUMENT_TYPES[type],
        state:{
          header:{
            type,
            status:"draft",
            is_act:true,
            day:new Date().toISOString().slice(0,10),
            note:type==="XML_IN"?"Kiểm kê kho thuế tăng":"Kiểm kê kho thuế giảm",
            tongtien:0,
            tongthanhtoan:0
          },
          items
        },
        status:"draft",
        invoiceType:type
      })
    }else{
      result=await saveDocument(type,{note:"Kiểm kê kho"},items)
    }
    if(!result) return
    saved++
  }

  alert(isTax?`Đã lưu ${saved} chứng từ kiểm kê kho thuế`:"Đã lưu kiểm kê")
  stockState.checkCache={}
  stockState.checkMode=false
  stockState.onlyChanged=false
  await loadStock(root)
  render(root)
}
