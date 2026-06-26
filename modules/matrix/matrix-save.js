import {
getAll,
insertRow,
deleteWhere
}
from "../../js/crud.js"

export function bindSave(
root,
matrix,
config,
onSave = null
){

const btn =
root.querySelector("#btn-save")

if(!btn) return

btn.addEventListener(
"click",
async ()=>{

if(onSave){
await onSave()
}

if(

config.cellType === "checkbox"
||
config.cellType === "user_permission"

){

await saveMatrix(
matrix,
config
)

}

alert("Đã lưu")

}
)

}

export async function saveMatrix(
matrix,
config
){

let inputs = []

if(config.cellType === "checkbox"){

inputs =
matrix.tbody.querySelectorAll(
'.matrix-check'
)

}

if(config.cellType === "user_permission"){

inputs =
matrix.tbody.querySelectorAll(
'.matrix-check'
)

}

const oldMaps =
await getAll(
config.mapTable
)

/* =========================
OLD MAP
========================= */

const oldSet = new Set()

for(const m of oldMaps){

oldSet.add(

m[config.mapRowField]
+
"|"
+
m[config.mapColumnField]

)

}

/* =========================
NEW MAP
========================= */

const newSet = new Set()

inputs.forEach(input=>{

/* checkbox */

if(config.cellType === "checkbox"){

if(input.dataset.state !== "extra") { return

}
}
/* user permission */

if(config.cellType === "user_permission"){

if(
input.dataset.state !== "extra"
){
return
}

}

newSet.add(

input.dataset.row
+
"|"
+
input.dataset.col

)

})

/* =========================
DELETE
========================= */

/* =========================
DELETE
========================= */

for(const key of oldSet){

const [
row,
col
] = key.split("|")

/* chỉ xử lý row hiện tại */

const hasRow =
[...inputs].some(
x =>
String(x.dataset.row)
=== String(row)
)

if(!hasRow){
continue
}

/* vẫn còn */

if(newSet.has(key)){
continue
}

/* delete */

await deleteWhere(
config.mapTable,
{
[config.mapRowField]: row,
[config.mapColumnField]: col
}
)

}
/* =========================
INSERT
========================= */

for(const key of newSet){

if(oldSet.has(key)) continue

const [
row,
col
] = key.split("|")

await insertRow(
config.mapTable,
{
[config.mapRowField]: row,
[config.mapColumnField]: col
}
)

}

}