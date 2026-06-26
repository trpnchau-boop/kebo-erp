import {getAll,insertRow,deleteRow,updateRow} from "../../../js/crud.js"
import { schema } from "/js/schema/index.js"
import {loadRef} from "/js/relation-cache.js"
import {initSmartLabels} from "../form/engine/form-builder.js"
import {formatMoney, parseMoney} from "../../../js/core/format.js"
import {
  renderDropdownSelect,
  getDropdownValue,
  bindDropdownSelect
}
from "/js/components/dropdown-select.js"

import {
  bindDropdownMenus
}
from "/js/components/dropdown-menu.js"

let table
let fields

let listEl
let titleEl

function $(root,s){
  return root.querySelector(s)
}

function $$(root,s){
  return root.querySelectorAll(s)
}

export async function init(params, root){

table = params.table

const page = $(root,".form-page")
const listPage = $(root,".list-page")

if(page){
  page.classList.remove("company-page")
}

if(table === "set_company" && page){
  page.classList.add("company-page")
}

if(listPage){

  listPage.classList.toggle(
    "form-head",
    !!schema[table]?.formHead
  )

}

fields = schema[table].fields

titleEl = $(root,"#title")

const visibleFields = Object.values(fields)
  .filter(f => !f.hidden)

const cols =
  schema[table]?.columns ??
  visibleFields.length

listEl = $(root,"#list")

if(listEl){
  listEl.style.setProperty(
    "--form-cols",
    cols
  )
}

if(titleEl){
  titleEl.innerText = schema[table]?.label || table
}

listEl = $(root,"#list")

const btnAdd = $(root,"#btn-add")
  if(btnAdd){
  btnAdd.onclick = addRow
}

const btnSave = $(root,"#btn-save")
  if(btnSave){
  btnSave.onclick = saveAll
}

if(listEl){
  listEl.onclick = handleDelete
  listEl.addEventListener("click",handleTagClick)
  listEl.addEventListener("focusin", handleColumnFocus)
  listEl.addEventListener("focusout", handleColumnBlur)
  listEl.addEventListener("focusin", handlePercentFocus)
  listEl.addEventListener("focusout", handlePercentBlur)
  listEl.addEventListener("focusin", handleMoneyFocus)
  listEl.addEventListener("focusout", handleMoneyBlur)
}

bindDropdownMenus(root)
bindDropdownSelect(root)

await load()

root._cleanup = () => {

  if(!listEl) {

  listEl.removeEventListener(
    "click",
    handleTagClick
  )

  listEl.removeEventListener(
    "focusin",
    handleColumnFocus
  )

  listEl.removeEventListener(
    "focusout",
    handleColumnBlur
  )

  listEl.removeEventListener(
    "focusin",
    handlePercentFocus
  )

  listEl.removeEventListener(
    "focusout",
    handlePercentBlur
  )

  listEl.removeEventListener(
    "focusin",
    handleMoneyFocus
  )

  listEl.removeEventListener(
    "focusout",
    handleMoneyBlur
  )
}}

}

//
// LOAD
//

async function load(){

const rows = await getAll(table)

if(table === "set_payroll_item"){

  rows.sort((a,b)=>{

    const groupA = a.type === "income" ? 0 : 1
    const groupB = b.type === "income" ? 0 : 1

    if(groupA !== groupB){
      return groupA - groupB
    }

    return Number(a.sort_order || 0)
         - Number(b.sort_order || 0)
  })

}

let html=""

for(const r of rows){
html += await buildCard(r)
}
html += await buildCard({})

listEl.innerHTML = html
initSmartLabels(listEl)
}

//
// BUILD CARD
//

async function buildCard(row){

let inputs=""

for(const key in fields){

const f = fields[key]

if(f.hidden) continue

const value = row[key] ?? f.default ?? ""

inputs += await buildInput(key,f,value,row)

}

return `
<div class="card" data-id="${row.id||""}">

<div class="fields">
${inputs}
</div>

    <button
      type="button"
      class="delete icon-btn danger">
      ×
    </button>

</div>
`

}

//
// BUILD INPUT
//

async function buildInput(key, f, value, row = {}){

const label = f.label || key

// checkbox

if(f.type==="checkbox"){

return `
<div class="field check-field">
<label>${label}</label>
<input
type="checkbox"
data-field="${key}"
${value ? "checked":""}>
</div>
`

}

// number

if(f.type==="number"){

  if(f.format==="money"){

    value = value
      ? formatMoney(value)
      : ""

    return `
      <div class="field">
        <label>${label}</label>
        <input
          data-field="${key}"
          data-format="${f.format || ""}"
          value="${value ?? ""}">
      </div>
    `
  } 
  if(f.format==="percent"){
    value =
      value !== ""
      && value != null
        ? `${value}%`
        : ""

    return `
      <div class="field">
        <label>${label}</label>
        <input
          data-field="${key}"
          data-format="percent"
          value="${value}">
      </div>
    `
  }
  return `
<div class="field">
<label>${label}</label>
<input
  type="number"
  data-field="${key}"
  value="${value ?? ""}">
</div>
`
}

// select

if(f.type === "select"){

  if(f.ref){

    const rows = await loadRef(f.ref)

    const options = rows.map(r => ({
      value: r[f.value],
      label: r[f.text]
    }))

    return `
      <div class="field">
        <label>${label}</label>
        ${renderDropdownSelect({
          value,
          options,
          rowId: row?.id || "",
          field: key,
          className: "form-dropdown",
          allowEmpty: !f.required,
          emptyText: f.placeholder ?? ""
        })}
      </div>
    `
  }

  if(f.options){

    const options = f.options.map(o => ({
      value: o.value,
      label: o.text
    }))

    return `
      <div class="field">
        <label>${label}</label>
        ${renderDropdownSelect({
          value,
          options,
          rowId: row?.id || "",
          field: key,
          className: "form-dropdown",
          allowEmpty: !f.required,
          emptyText: f.placeholder ?? ""
        })}
      </div>
    `
  }
}

if(f.type==="multi_select_tags"){

const selected = String(value || "")
  .split(",")
  .map(x=>x.trim())
  .filter(Boolean)

let tags = ""

f.options.forEach(o=>{

const active = selected.includes(o.value)

tags += `
<button
type="button"
class="tag-btn ${active ? "active" : ""}"
data-value="${o.value}">
${o.text}
</button>
`

})

return `
<div class="field">
<label>${label}</label>

<input
type="text"
readonly
class="tag-value"
data-field="${key}"
value="${value || ""}">

<div class="tag-group">
${tags}
</div>

</div>
`
}


// default text

return `
<div class="field">
<label>${label}</label>
<input
data-field="${key}"
value="${value ?? ""}">
</div>
`

}

//
// ADD ROW
//

async function addRow(){

const html = await buildCard({})

listEl.insertAdjacentHTML("beforeend",html)
initSmartLabels(listEl.lastElementChild)
}

//
// SAVE
//

async function saveAll(){

const cards = listEl.querySelectorAll(".card")

const jobs=[]

for(const c of cards){

const id = c.dataset.id

const inputs = c.querySelectorAll(`
  input[data-field],
  textarea[data-field],
  select[data-field],
  .dropdown-select[data-field]
`)

let row={}

for(const i of inputs){

  const field = i.dataset.field
  const f = fields[field]

  let value = ""

  if(i.classList.contains("dropdown-select")){

    value = getDropdownValue(i)

  }else if(i.type === "checkbox"){

    value = i.checked

  }else{

    value = i.value.trim()

    if(i.dataset.format === "money"){
      value = parseMoney(value)
    }

    if(i.dataset.format === "percent"){
      value = value.replace("%","").trim()
    }
  }

  if(f.required && f.type !== "checkbox" && !value){
    alert((f.label || field) + " không được để trống")
    return
  }

  row[field] = value
}

const hasData = Object.values(row).some(v=>{
return v !== "" && v !== null && v !== false
})

if(id){

jobs.push(updateRow(table,id,row))

}else if(hasData){

jobs.push(insertRow(table,row))

}

}

await Promise.all(jobs)

alert("Đã lưu")

await load()

window.dispatchEvent(
  new CustomEvent(`${table}_changed`)
)
}

//
// DELETE
//

function handleDelete(e){

if(!e.target.closest(".delete")) return

const card = e.target.closest(".card")

const id = card.dataset.id

if(id){

if(confirm("Xóa dòng này?")){

deleteRow(table,id).then(async ()=>{

  await load()

  window.dispatchEvent(
    new CustomEvent(`${table}_changed`)
  )

})

}

}else{

card.remove()

}

}
function handleTagClick(e){

const btn = e.target.closest(".tag-btn")
if(!btn) return

btn.classList.toggle("active")

const field = btn.closest(".field")
const input = field.querySelector('[data-field]')

const values = [...field.querySelectorAll(".tag-btn.active")]
.map(x => x.dataset.value)

input.value = values.join(",")

/* cập nhật text đang thấy */
input.dispatchEvent(new Event("input"))
}

function handleColumnFocus(e){

  const field = e.target.closest(".field")
  if(!field) return

  const card = field.closest(".card")
  const fieldsInCard = [...card.querySelectorAll(".field")]

  const colIndex = fieldsInCard.indexOf(field)

  listEl
    .querySelectorAll(".field.column-focus")
    .forEach(x => x.classList.remove("column-focus"))

  listEl
    .querySelectorAll(".card")
    .forEach(card => {

      const fields = card.querySelectorAll(".field")

      if(fields[colIndex]){
        fields[colIndex].classList.add("column-focus")
      }

    })
}

function handleColumnBlur(){

  requestAnimationFrame(()=>{

    if(
      listEl.contains(document.activeElement)
    ){
      return
    }

    listEl
      .querySelectorAll(".field.column-focus")
      .forEach(x => x.classList.remove("column-focus"))

  })
}

function handlePercentFocus(e){

  const input = e.target

  if(
    input.tagName !== "INPUT" ||
    input.dataset.format !== "percent"
  ){
    return
  }

  input.value = input.value.replace("%","")
}

function handlePercentBlur(e){

  const input = e.target

  if(
    input.tagName !== "INPUT" ||
    input.dataset.format !== "percent"
  ){
    return
  }

  const value = input.value.trim()

  if(value){
    input.value =
      value.replace("%","") + "%"
  }
}

function handleMoneyFocus(e){

  const input = e.target

  if(
    input.tagName !== "INPUT" ||
    input.dataset.format !== "money"
  ){
    return
  }

  input.value = parseMoney(input.value)
}

function handleMoneyBlur(e){

  const input = e.target

  if(
    input.tagName !== "INPUT" ||
    input.dataset.format !== "money"
  ){
    return
  }

  const value = parseMoney(input.value)

  if(value !== ""){
    input.value = formatMoney(value)
  }
}