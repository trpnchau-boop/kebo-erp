import {getAll,insertRow,updateRow,deleteWhere} from "../../../js/crud.js"
import { schema } from "/js/schema/index.js"
import {buildInput} from "../core/form-input.js"
import {generateAutoCode} from "../../../js/auto-code.js"
import {initSmartLabels} from "../engine/form-builder.js"
import {bindAllMoneyInputs} from "/js/core/input-format.js"
import {parseMoney} from "/js/core/format.js"
import {
  getFieldValue,
  setFieldValue
} from "../core/form-field.js"
import {
  renderDropdownSelect,
  bindDropdownSelect
} from "/js/components/dropdown-select.js"

import {
  bindDropdownMenus
} from "/js/components/dropdown-menu.js"


let dvtCache = null

const groupInput = await buildInput(
  "id_group",
  schema.data_product.fields.id_group
)

const khoInput = await buildInput(
  "id_warehouse",
  schema.data_product.fields.id_warehouse
)

const dvtInput = await buildInput(
  "dvtGoc",
  schema.data_product.fields.dvtGoc
)

export async function initVariantUI(ctx){

  const box = document.getElementById("variant-box")
  if(!box) return

  const btn = document.getElementById("btn-add-variant")

  if(btn && !btn.dataset.bind){
    btn.dataset.bind = "1"
    btn.onclick = () => addVariantRow()
  }

  const list = document.getElementById("variant-list")
  if(list) list.innerHTML = ""

  if(ctx?.id){
    const variants = await getAll("data_product",{
      parent_id: ctx.id,
      type: "variant"
    })

    await renderVariants(variants)
  }
}

export async function renderVariants(variants){

  const list = document.getElementById("variant-list")
  if(!list) return

  list.innerHTML = ""

  for(const v of variants){
    await addVariantRow(v)
  }

}

async function addVariantRow(data={}){

const list = document.getElementById("variant-list")
if(!list) return

const html = `
<div class="variant-row">

<div class="editor-grid-3">

<div class="editor-field">
<label class="editor-label">Nhóm SP</label>
<div class="variant-group">${groupInput}</div>
</div>

<div class="editor-field">
<label class="editor-label">Tính chất</label>
<input
class="variant-tinhchat editor-input"
value="${data.tinhchat ?? ""}">
</div>

<div class="editor-field">
<label class="editor-label"></label>
<button class="remove-variant" type="button">×</button>
</div>

<div class="editor-field">
<label class="editor-label">Kho</label>
<div class="variant-kho">${khoInput}</div>
</div>

<div class="editor-field">
<label class="editor-label">ĐVT</label>
<div class="variant-dvt">${dvtInput}</div>
</div>

<div class="editor-field">
<label class="editor-label">Định lượng</label>
<input
class="variant-dinhluong editor-input"
type="number"
value="${data.dinhluong ?? ""}">
</div>

<div class="editor-field">
<label class="editor-label">Giá 1</label>
<input
class="variant-gia1 editor-input"
data-format="money"
type="text"
value="${data.dongia1 ?? ""}">
</div>

<div class="editor-field">
<label class="editor-label">Giá 2</label>
<input
class="variant-gia2 editor-input"
data-format="money"
type="text"
value="${data.dongia2 ?? ""}">
</div>

<div class="editor-field">
<label class="editor-label">Giá 3</label>
<input
class="variant-gia3 editor-input"
data-format="money"
type="text"
value="${data.dongia3 ?? ""}">
</div>

</div>

<div class="variant-units"></div>

<button class="toolbar-action add-variant-unit" type="button">
+ Thêm quy cách
</button>

</div>
`

list.insertAdjacentHTML("beforeend",html)

const row = list.lastElementChild

bindAllMoneyInputs(row)

row.dataset.id = data.id || ""
row.dataset.code = data.code || ""

const groupEl =
  row.querySelector(
    '.variant-group [data-field="id_group"]'
  )

const khoEl =
  row.querySelector(
    '.variant-kho [data-field="id_warehouse"]'
  )

const dvtEl =
  row.querySelector(
    '.variant-dvt [data-field="dvtGoc"]'
  )

if(groupEl){
  setFieldValue(
    groupEl,
    data.id_group
  )
}

if(khoEl){
  setFieldValue(
    khoEl,
    data.id_warehouse
  )
}

if(dvtEl){
  setFieldValue(
    dvtEl,
    data.dvtGoc
  )
}

initSmartLabels(row)

row.querySelectorAll(
  `
  input,
  select,
  .dropdown-select-trigger
  `
).forEach(i=>{

  i.dispatchEvent(new Event("input"))
  i.dispatchEvent(new Event("change"))

})

// remove variant
row.querySelector(".remove-variant").onclick=e=>{
e.target.closest(".variant-row").remove()
}

// add unit
const btnUnit = row.querySelector(".add-variant-unit")

if(btnUnit){
 btnUnit.onclick = ()=> addVariantUnit(row)
}

// load unit nếu đã có id
if(data.id){
  await loadVariantUnits(row,data.id)
}

}

async function loadVariantUnits(row,variantId){

const units = await getAll("product_unit",{id_sp:variantId})

for(const u of units){

  await addVariantUnit(row,{
    unit:u.unit,
    ratio:u.ratio
  })

}

}

async function addVariantUnit(row,data={}){

const box = row.querySelector(".variant-units")
if(!box) return

// cache danh sách đơn vị
if(!dvtCache){

  dvtCache =
    await getAll("set_sp_dvt")

}

window.addEventListener(
  "relation-changed",
  e=>{

    if(
      e.detail.table === "set_sp_dvt"
    ){

      dvtCache = null

    }

  }
)

const options = dvtCache.map(d=>({
  value: d.dvt,
  label: d.dvt
}))

const html = `
<div class="variant-unit-row">

${renderDropdownSelect({
  value: data.unit ?? "",
  options,
  field: "",
  rowId: "",
  className: "unit",
  allowEmpty: true,
  emptyText: "",
  allowAdd: true,
  addTable: "set_sp_dvt",
  addField: "dvt" 
})}

<input class="ratio"
type="number"
step="0.01"
value="${data.ratio ?? ""}"
placeholder="Tỷ lệ">

<button class="remove-unit" type="button">×</button>

</div>
`

box.insertAdjacentHTML("beforeend",html)
bindDropdownMenus()
bindDropdownSelect(box)

const r = box.lastElementChild

initSmartLabels(r)

r.querySelectorAll(`
  .dropdown-select-trigger,
  input
`).forEach(i=>{
  i.dispatchEvent(new Event("input"))
  i.dispatchEvent(new Event("change"))
})

r.querySelector(".remove-unit").onclick=()=>{
r.remove()
}

}

export async function saveVariants(productId,parentRow){

if(!productId) return

const rows =
document.querySelectorAll("#variant-list .variant-row")

const keepIds = []

for(const r of rows){

const id = r.dataset.id

const id_group =
Number(
  getFieldValue(
    r.querySelector(
      '.variant-group [data-field="id_group"]'
    )
  )
) || null

let code = ""

if(id){
  code = r.dataset.code || ""
}else{
  code = await generateAutoCode(
    "data_product",
    schema.data_product.fields.code,
    { id_group }
  )
}

const tinhchat =
r.querySelector(".variant-tinhchat")?.value?.trim() || ""

const id_warehouse =
Number(
  getFieldValue(
    r.querySelector(
      '.variant-kho [data-field="id_warehouse"]'
    )
  )
) || null

const dvtGoc =
String(
  getFieldValue(
    r.querySelector(
      '.variant-dvt [data-field="dvtGoc"]'
    )
  )
).trim()

const dinhluong =
Number(r.querySelector(".variant-dinhluong")?.value) || 1

const dongia1 =
parseMoney(r.querySelector(".variant-gia1")?.value) || 0

const dongia2 =
parseMoney(r.querySelector(".variant-gia2")?.value) || 0

const dongia3 =
parseMoney(r.querySelector(".variant-gia3")?.value) || 0

const mainProductName = parentRow?.name || ""

let variantRow = {
code,
id_group,
tinhchat,
id_warehouse,
dvtGoc,
dinhluong,
dongia1,
dongia2,
dongia3,
parent_id: Number(productId),
type: "variant",
name: mainProductName,
gianhapGoc: null,
giavon: null
}

let variantId = id

if(id){

keepIds.push(Number(id))
  const payload = {
    ...variantRow,
    gianhapGoc: null,
    giavon: null
  }

  await updateRow("data_product", id, payload)

}else{

  const payload = {
    ...variantRow,
    gianhapGoc: null,
    giavon: null
  }

  const res = await insertRow("data_product", payload)

  variantId = res.id
  keepIds.push(variantId)

}


await saveVariantUnits(r,variantId)

}

// xóa variant bị remove
await deleteWhere("data_product",{
parent_id:productId,
type:"variant",
id_not_in:keepIds
})

}

async function saveVariantUnits(row,variantId){

const units = row.querySelectorAll(".variant-unit-row")

await deleteWhere("product_unit",{id_sp:variantId})

for(const u of units){

const unit =
String(
  getFieldValue(
    u.querySelector(
      ".unit .dropdown-select-trigger"
    )
  )
).trim()

const ratio =
Number(u.querySelector(".ratio")?.value) || 1

if(!unit) continue

await insertRow("product_unit",{
id_sp:variantId,
unit,
ratio
})

}

}