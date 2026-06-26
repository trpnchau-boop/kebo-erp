import {getAll} from "./crud.js"
import {schema} from "/js/schema/index.js"

const cache = {}
const mapCache = {}

const dirty = new Set()

/* =========================
LOAD REF
========================= */

export async function loadRef(table){

  if(
    cache[table]
    &&
    !dirty.has(table)
  ){
    return cache[table]
  }

  const rows =
    await getAll(table)

  clearMapByTable(table)

  cache[table] = rows

  dirty.delete(table)

  return rows
}

/* =========================
CLEAR MAP
========================= */

function clearMapByTable(table){

  Object.keys(mapCache)
  .forEach(k=>{

    if(
      k.startsWith(
        table + "_"
      )
    ){
      delete mapCache[k]
    }

  })

}

/* =========================
BUILD MAP
========================= */

export async function buildMap(
  refTable,
  valueField,
  textField
){

  const key =
  `${refTable}_${valueField}_${textField}`

  if(
    mapCache[key]
    &&
    !dirty.has(refTable)
  ){
    return mapCache[key]
  }

  const rows =
  await loadRef(refTable)

  const map = {}

  rows.forEach(r=>{

    map[
      r[valueField]
    ] = r[textField]

  })

  mapCache[key] = map

  return map
}

/* =========================
GET TEXT
========================= */

export async function getText(
  refTable,
  valueField,
  textField,
  id
){

  if(id == null){
    return ""
  }

  const map =
  await buildMap(
    refTable,
    valueField,
    textField
  )

  return map[id] || id
}

/* =========================
MARK DIRTY
========================= */

export function markDirty(table){

  dirty.add(table)

  window.dispatchEvent(
    new CustomEvent(
      "relation-changed",
      {
        detail:{table}
      }
    )
  )

}

/* =========================
FORCE RELOAD
========================= */

export async function reloadRef(table){

  dirty.add(table)

  return await loadRef(table)
}

/* =========================
PRELOAD
========================= */

export async function preloadRelations(){

  for(const table in schema){

    const fields =
    schema[table].fields

    for(const k in fields){

      const f = fields[k]

      if(f.ref){

        await buildMap(
          f.ref,
          f.value || "id",
          f.text || "name"
        )

      }

    }

  }

}