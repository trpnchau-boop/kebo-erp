import {getAll,insertRow,deleteWhere} from "../../../js/crud.js"
import {initSmartLabels} from "../engine/form-builder.js"
import {
  bindDropdownSelect,  
  renderDropdownSelect
} from "/js/components/dropdown-select.js"

import {
  getFieldValue
} from "../core/form-field.js"

import {
  bindDropdownMenus
} from "/js/components/dropdown-menu.js"

let dvtCache = null

export async function initUnitUI(ctx){

  const box = document.getElementById("unit-box")
  if(!box) return

  const btn = document.getElementById("btn-add-unit")

  if(btn && !btn.dataset.bind){
    btn.dataset.bind = "1"
    btn.onclick = () => addUnitRow()
  }

  // clear list
  const list = document.getElementById("unit-list")
  if(list) list.innerHTML = ""

  // load dữ liệu
  if(ctx?.id){
    const rows = await getAll("product_unit", { id_sp: ctx.id })

    for(const r of rows){
      await addUnitRow({
        unit: r.unit,
        ratio: r.ratio
      })
    }
  }
}

async function addUnitRow(data={}){

const list = document.getElementById("unit-list")


// cache đơn vị
if(!dvtCache){
dvtCache = await getAll("set_sp_dvt")
}

const options = dvtCache.map(d=>({
  value: d.dvt,
  label: d.dvt
}))

const html = `
<div class="unit-row editor-grid-3">

<div class="editor-field">
<label class="editor-label">Đơn vị</label>
${renderDropdownSelect({
  value: data.unit ?? "",
  options,
  field: "",
  rowId: "",
  className: "unit",
  allowEmpty: true,
  emptyText: ""
})}
</div>

<div class="editor-field">
<label class="editor-label">Quy đổi</label>
<input
class="ratio editor-input"
type="number"
step="0.01"
value="${data.ratio ?? ""}">
</div>

<div class="editor-field">
<label class="editor-label">&nbsp;</label>
<button class="remove-unit" type="button">×</button>
</div>

</div>
`

list.insertAdjacentHTML("beforeend",html)
bindDropdownMenus()
bindDropdownSelect(list)

const row = list.lastElementChild

row.querySelector(".ratio").value = data.ratio ?? ""

initSmartLabels(row)

row.querySelector(".remove-unit").onclick = e=>{
e.target.closest(".unit-row").remove()
}

}

export async function saveUnits(productId){

const rows =
document.querySelectorAll("#unit-list .unit-row")
await deleteWhere("product_unit",{id_sp:productId})

for(const r of rows){

const unit =
String(
  getFieldValue(
    r.querySelector(
      ".unit .dropdown-select-trigger"
    )
  )
).trim()
const ratio = Number(r.querySelector(".ratio")?.value) || 1

if(!unit) continue

await insertRow("product_unit",{
id_sp:productId,
unit,
ratio
})


}

}