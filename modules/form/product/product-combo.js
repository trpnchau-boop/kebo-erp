import {getAll,insertRow,deleteWhere} from "../../../js/crud.js"
import {initSmartLabels} from "../engine/form-builder.js"
import {
  bindDropdownSelect,  
  renderDropdownSelect
} from "/js/components/dropdown-select.js"

import {
  bindDropdownMenus
} from "/js/components/dropdown-menu.js"
import {
  getFieldValue
} from "../core/form-field.js"

let productCache = null

export async function initComboUI(ctx){

  const box = document.getElementById("product-children")
  if(!box) return

  const btn = document.getElementById("btn-add-child")

  if(btn && !btn.dataset.bind){
    btn.dataset.bind = "1"
    btn.addEventListener("click",()=>addComboRow(ctx))
  }

  const list = document.getElementById("children-list")
  if(list) list.innerHTML = ""

  if(ctx?.id){
    const rows =
      await getAll("product_structure",{
        product_id: Number(ctx.id)
      })

    await renderCombo(ctx, rows)
  }
}

async function addComboRow(ctx,data={}){

const {id} = ctx

if(!productCache){
productCache = await getAll("data_product")
}

const options = []

productCache.forEach(p=>{

  if(id && p.id === id) return

  options.push({
    value: p.id,
    label: p.name
  })

})

const html = `
<div class="combo-row editor-grid-3">
<div class="editor-field">

<label class="editor-label">Sản phẩm</label>

${renderDropdownSelect({
  value: data.id_sp_con ?? "",
  options,
  field: "id_sp_con",
  rowId: "",
  className: "combo-product",
  allowEmpty: true,
  emptyText: ""
})}
</div>

<div class="editor-field">
<label class="editor-label">Số lượng</label>
<input
class="combo-qty editor-input"
type="number"
step="0.01"
value="${data.qty ?? ""}">
</div>

<div class="editor-field">
<label class="editor-label">&nbsp;</label>
<button class="remove-combo" type="button">×</button>
</div>

</div>
`

const list = document.getElementById("children-list")

list.insertAdjacentHTML("beforeend",html)

const row = list.lastElementChild
bindDropdownMenus()
bindDropdownSelect(row)

row.querySelector(".combo-qty").value = data.qty ?? ""

initSmartLabels(row)
row.querySelectorAll(`
  .dropdown-select-trigger,
  input
`).forEach(i=>{
  i.dispatchEvent(new Event("input"))
  i.dispatchEvent(new Event("change"))
})

row.querySelector(".remove-combo").onclick = e=>{
e.target.closest(".combo-row").remove()
}

}

export async function saveCombo(productId){

if(!productId) return   // ← chặn lỗi

const rows =
document.querySelectorAll("#children-list .combo-row")

await deleteWhere("product_structure",{product_id:Number(productId)})

for(const r of rows){

const id_sp_con =
Number(
  getFieldValue(
    r.querySelector(
      ".combo-product .dropdown-select-trigger"
    )
  )
)

const qty =
Number(r.querySelector(".combo-qty")?.value) || 1

if(!id_sp_con) continue

await insertRow("product_structure",{
product_id:Number(productId),
id_sp_con,
qty
})

}

}

export async function renderCombo(ctx,rows){

if(!rows) rows = []

const list = document.getElementById("children-list")
if(!list) return

list.innerHTML=""

// đảm bảo productCache có trước
if(!productCache){
productCache = await getAll("data_product")
}

for(const r of rows){
await addComboRow(ctx,{
id_sp_con:r.id_sp_con,
qty:r.qty
})
}

}