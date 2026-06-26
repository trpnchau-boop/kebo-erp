// modules/document-list/document-list-load.js

import {
  db
}
from "/js/supabase.js"

import {
  buildMap
}
from "/js/relation-cache.js"

export async function loadDocuments({
  schema,
  types,
  status = "",
  search = "",
  fromDate = "",
  toDate = ""  
}){

  const fields = [
    "id",
    "type",
    "status",

    ...schema.list
  ]


  let query = db
    .from(schema.table || "document")
    .select(fields.join(","))
    .in("type", types)
  

  if(status){
    query = query.eq(
      "status",
      status
    )
  }

  if(search){
    query = query.ilike(
      "code",
      `%${search}%`
    )
  }  

  if(fromDate){
    query = query.gte(
      "day",
      fromDate
    )
  }

  if(toDate){
    query = query.lte(
      "day",
      toDate
    )
  }

  const {
    data,
    error
  } = await query.order(
    "id",
    {
      ascending:false
    }
  )  
  /* =====================================
  ERROR
  ===================================== */

  if(error){
    console.error(error)
    return []
  }

  /* =====================================
  MAPS
  ===================================== */

  let customerMap = {}
  let employeeMap = {}

  /* ---------- customer ---------- */

  if(
    schema.list.includes(
      "id_customer"
    )
  ){
    customerMap =
      await buildMap(
        "data_customer",
        "id",
        "name"
      )
  }

  /* ---------- employee ---------- */

  if(
    schema.list.includes(
      "id_employee"
    )
  ){
    employeeMap =
      await buildMap(
        "data_employee",
        "id",
        "name"
      )
   }

  /* =====================================
  MAP DISPLAY TEXT
  ===================================== */

  return (data || [])

    .map(row=>{

      return {

        ...row,

        id_customer_text:

          customerMap[
            row.id_customer
          ]
          || "",

        id_employee_text:

          employeeMap[
            row.id_employee
          ]
          || ""

      }

    })

}

export async function loadOptions(

  table,
  valueField = "id",
  labelField = "name"

){

  const {
    data,
    error
  }

  = await db

    .from(table)

    .select(
      `${valueField},${labelField}`
    )

  if(error){

    console.error(error)

    return []

  }

  return data || []

}