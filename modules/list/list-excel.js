import {getAll, insertMany} from "../../js/crud.js"
import { schema } from "/js/schema/index.js"

function getColumns(table){

const fields = schema[table]?.fields || {}

return Object.entries(fields)
.filter(([key,f]) => {

if(key === "id") return false
if(f.hidden) return false

return f.showInList || !f.hidden

})
.map(([key,f]) => ({
key,
label: f.label || key,
field: f
}))

}

/* ======================
XUẤT EXCEL
====================== */

export async function exportExcel(table){

const rows = await getAll(table)

const cols = getColumns(table)

const data = rows.map((r,i)=>{

const obj = {}

obj["STT"] = i + 1

cols.forEach(c=>{

obj[c.label] = r[c.key] ?? ""

})

return obj

})

const ws = XLSX.utils.json_to_sheet(data)

const wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb, ws, table)

XLSX.writeFile(wb, table + ".xlsx")

}

