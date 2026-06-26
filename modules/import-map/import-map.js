import {
getAll,
insertMany,
updateRow
} from "../../js/crud.js"

import { schema } from "/js/schema/index.js"

import {
  openSidebarPanel,
  closeSidebarPanel
} from "/js/sidebar-panel.js"

let table = ""
let rows = []
let headers = []
let headerRow = 3

export async function init(params){

table = params.type

const title =
schema[table]?.label || table

document.getElementById("title")
.innerText = "Nạp Excel - " + title

document
.getElementById("excel-file")
.addEventListener("change", readFile)

document
.getElementById("header-row")
.addEventListener("change", ()=>{

headerRow =
Number(
document.getElementById("header-row").value
) - 1

buildMap()
renderPreview()

})

document
.getElementById("btn-run")
.addEventListener("click", runImport)

}

/* =====================
READ FILE
===================== */

async function readFile(e){

const file = e.target.files[0]
if(!file) return

const buf = await file.arrayBuffer()

const wb = XLSX.read(buf)

const ws = wb.Sheets[wb.SheetNames[0]]

rows = XLSX.utils.sheet_to_json(ws,{
  header:1,
  defval:""
})

document.getElementById("file-name").textContent = file.name

openSidebarPanel(`
<div class="import-map-panel">

    <h3>Map cột</h3>

    <div id="map-box"></div>

</div>
`)

buildMap()

renderPreview()

}

/* =====================
FIELDS
===================== */

function getFields(){

const fields =
schema[table]?.fields || {}

return Object.entries(fields)
.filter(([k,f])=>
k !== "id" &&
!f.hidden &&
(f.showInList || !f.hidden)
)

}

/* =====================
MAP UI
===================== */

function buildMap(){

headers = rows[headerRow] || []

let html = `
<table class="table">
<tr>
<th>Hệ thống</th>
<th>Cột Excel</th>
</tr>
`

getFields().forEach(([key,f])=>{

html += `
<tr>

<td>
${f.label || key}
</td>

<td>
<select class="map-col"
data-key="${key}">

<option value="">
-- Bỏ qua --
</option>
`

headers.forEach((h,i)=>{

html += `
<option value="${i}">
${h}
</option>
`

})

html += `
</select>
</td>

</tr>
`

})

html += "</table>"

const box = document.getElementById("map-box")

if(!box) return

box.innerHTML = html

autoMap()

}

/* =====================
AUTO MAP
===================== */

function autoMap(){

document
.querySelectorAll(".map-col")
.forEach(sel=>{

const label =
sel.parentNode
.parentNode
.children[0]
.innerText
.trim()
.toLowerCase()

headers.forEach((h,i)=>{

const t =
String(h)
.toLowerCase()

if(
t.includes(label) ||
label.includes(t)
){
sel.value = i
}

})

})

}

/* =====================
PREVIEW
===================== */

function renderPreview(){

let html = `
<table class="table">
`

rows.slice(0,10).forEach(r=>{

html += "<tr>"

r.forEach(c=>{

html += `<td>${c}</td>`

})

html += "</tr>"

})

html += "</table>"

document
.getElementById("preview-box")
.innerHTML = html

}

/* =====================
RUN IMPORT
===================== */

async function runImport(){

const map = {}

document
.querySelectorAll(".map-col")
.forEach(x=>{

if(x.value !== ""){
map[x.dataset.key] =
Number(x.value)
}

})

const data = []

for(let i=headerRow+1;i<rows.length;i++){

const r = rows[i]

const obj = {}

Object.entries(map).forEach(([k,col])=>{

const value = r[col]

if(value !== "" && value != null){

obj[k] = value

}

})

if(
Object.values(obj)
.some(v=>v !== "" && v != null)
){
data.push(obj)
}

}

if(!data.length){
alert("Không có dữ liệu")
return
}

const mode =
document.getElementById("dup-mode").value

if(mode === "skip"){

await importSkip(data)

}else{

await importUpdate(data)

}

alert("Đã nạp xong")

closeSidebarPanel()

if(window.reloadCurrentList){
window.reloadCurrentList()
}

}

/* =====================
SKIP DUP CODE
===================== */

async function importSkip(data){

const old = await getAll(table)

const codeSet = new Set(
old.map(x=>x.code)
)

const insertRows =
data.filter(x=>
!x.code ||
!codeSet.has(x.code)
)

if(insertRows.length){
await insertMany(table, insertRows)
}

}

/* =====================
UPDATE DUP CODE
===================== */

async function importUpdate(data){

const old = await getAll(table)

for(const row of data){

if(!row.code){

await insertMany(table,[row])
continue

}

const found =
old.find(x=>x.code === row.code)

if(found){

await updateRow(
table,
found.id,
row
)

}else{

await insertMany(table,[row])

}

}

}