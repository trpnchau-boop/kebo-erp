import {getAll, getOne} from "./crud.js"

export async function generateAutoCode(tableName, fieldConfig, row = {}){

const cfg = fieldConfig.autoCode
if(!cfg) return ""

let prefix = cfg.prefix || ""


// lấy prefix động từ bảng ref
if(cfg.source && cfg.table){

const sourceValue = row[cfg.source]

if(sourceValue){

const ref = await getOne(cfg.table, sourceValue)

if(ref?.prefix){
prefix += "-" + ref.prefix
}

}

}


// lấy danh sách hiện có
const rows = await getAll(tableName)

const max = rows.reduce((m,r)=>{

const code = r.code || ""

const num = Number(code.replace(/\D/g,"")) || 0

return Math.max(m,num)

},0)

const next = String(max + 1).padStart(4,"0")

return `${prefix}-${next}`

}