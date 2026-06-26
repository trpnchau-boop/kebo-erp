import {
getAll,
insertRow,
updateRow,
deleteRow
}
from "../../js/crud.js"

export async function saveAttendance(
matrix,
config
){

const oldMaps =
await getAll(config.mapTable)

/* =========================
MAP CŨ
========================= */

const oldMap = new Map()

for(const m of oldMaps){

const key =
m[config.mapRowField]
+
"|"
+
m[config.mapColumnField]

oldMap.set(key,m)

}

/* =========================
CELL HIỆN TẠI
========================= */

const cells =
matrix.tbody.querySelectorAll(
".attendance-cell"
)

for(const cell of cells){

const row =
cell.dataset.row

const col =
cell.dataset.col

const value =
cell.dataset.value || ""

const key =
row + "|" + col

const old =
oldMap.get(key)

/* =========================
DELETE
========================= */

if(old && !value){

await deleteRow(
config.mapTable,
old.id
)

continue

}

/* =========================
INSERT
========================= */

if(!old && value){

await insertRow(
config.mapTable,
{
[config.mapRowField]: row,
[config.mapColumnField]: col,
month: col.slice(0,7),
shift_code: parseShiftValue(value)
}
)

continue

}

/* =========================
UPDATE
========================= */

if(old){

if(
Number(old.shift_code)
===
Number(value)
){
continue
}

await updateRow(
config.mapTable,
old.id,
{
shift_code: parseShiftValue(value)
}
)

}

}

}

function parseShiftValue(value){

value = String(value || "").trim()

if(value === "1/2"){
return 0.5
}

return Number(value) || 0

}