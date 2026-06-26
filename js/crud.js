import {db} from "./supabase.js"

export async function getAll(table,where={}){

let q = db
.from(table)
.select("*")

for(const key in where){
q = q.eq(key, where[key])
}

const noIdTables = [
"role_permissions"
]

if(
!table.startsWith("vw_")
&&
!noIdTables.includes(table)
){
q = q.order("id",{ascending:true})
}

const {data,error} = await q

if(error){
alert(error.message)
return []
}

return data || []

}

export async function getOne(table,id){
const {data,error} = await db
.from(table)
.select("*")
.eq("id",id)
.single()

if(error){
alert(error.message)
return null
}
return data
}

const noTimestampTables = [
"role_permissions",
"user_permission_extra"
]

export async function insertRow(table,row){

if(
!noTimestampTables.includes(table)
){

row.created_at =
new Date().toISOString()

row.updated_at =
new Date().toISOString()

}

const {data,error} = await db
.from(table)
.insert([row])
.select()
.single()

if(error){

alert(error.message)
return

}
if (error) {
  console.error("SUPABASE ERROR >>>", error)
  throw error
}
return data
}

export async function updateRow(table,id,row){

if(
!noTimestampTables.includes(table)
){
row.updated_at =
new Date().toISOString()
}

const {data,error} = await db
.from(table)
.update(row)
.eq("id",id)

if(error){
alert(error.message)
return
}

return data

}


export async function deleteRow(table,id){

const {data,error} = await db
.from(table)
.delete()
.eq("id",id)

if(error){
alert(error.message)
return
}

return data

}

export async function deleteWhere(table,where){

if(!where){
return
}

let q = db.from(table).delete()

for(const key in where){

const value = where[key]

if(value===undefined || value===null) continue

if(key.endsWith("_not_in")){

const col = key.replace("_not_in","")

q = q.not(col,"in",`(${value.join(",")})`)

}else{

q = q.eq(key,value)

}

}

const {data,error} = await q

if(error){
alert(error.message)
return
}

return data
}

export async function insertMany(table, rows){

if(
  !noTimestampTables.includes(table)
){

  rows = rows.map(r=>({
    ...r,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

}

const {data,error} = await db
.from(table)
.insert(rows)
.select()

if(error){
return null
}

return data
}