import { schema }
from "../../js/schema/index.js"

import { getAll }
from "../../js/crud.js"

import { createMatrix }
from "./matrix-engine.js"

import { renderMatrix }
from "./matrix-render.js"

import { bindSave }
from "./matrix-save.js"

import {
bindAttendance
}
from "./matrix-attendance.js"

import {
saveAttendance
}
from "./matrix-attendance-save.js"

import {
buildDays
}
from "./attendance-days.js"

import {
bindUserPermission
}
from "./matrix-user-permission.js"

import {
  openSidebarPage
}
from "../../js/sidebar-panel.js"

import {
  createMonthpicker
}
from "/js/ui/init-datepicker.js"

import {
  bindCheckboxMatrix
}
from "./matrix-checkbox.js"

export async function init(params,root){

const config =
schema[params.type]

/* =========================
TOOLBAR
========================= */

await renderToolbar(root,config)
bindRolesButton(root, params)
/* =========================
SAVE
========================= */

const matrix =
createMatrix(root)

bindSave(
root,
matrix,
config,
async ()=>{

if(config.cellType === "attendance"){

await saveAttendance(
matrix,
config
)

}

}
)

/* =========================
MONTH
========================= */

bindMonthChange(
  root,
  config,
  matrix
)

/* =========================
FIRST LOAD
========================= */

await reloadMatrix(
  root,
  config,
  matrix
)

/* =========================
REALTIME ROLES
========================= */

const reloadRoles = async () => {

  await reloadMatrix(
    root,
    config,
    matrix
  )

}

window.addEventListener(
  "roles_changed",
  reloadRoles
)

const oldCleanup = root._cleanup

root._cleanup = () => {

  if(oldCleanup){
    oldCleanup()
  }

  window.removeEventListener(
    "roles_changed",
    reloadRoles
  )

}
}

/* =========================
RELOAD
========================= */

async function reloadMatrix(
root,
config,
matrix
){

const rows =
await getAll(
config.rowsTable
)

let cols = []

if(config.columnsSource === "days"){

cols = buildDays(
getMonthValue(root)
)

}else{

cols = await getAll(
config.columnsTable
)

}
const maps =
await getAll(
config.mapTable
)

let roleMaps = []

if(config.cellType === "user_permission"){

  roleMaps =
  await getAll(
    "role_permissions"
  )

}

/* clear */

matrix.clear()

renderMatrix(
matrix,
config,
rows,
cols,
maps,
roleMaps
)

if(config.cellType === "checkbox"){

  bindCheckboxMatrix(
    matrix
  )

}

if(config.cellType === "user_permission"){

  bindUserPermission(
    matrix
  )

}

if(config.cellType === "attendance"){

bindAttendance(matrix)

}

}

/* =========================
TOOLBAR
========================= */

async function renderToolbar(
root,
config
){

if(config.cellType !== "attendance"){
return
}

const filters =
root.querySelector(
"#matrix-filters"
)

if(filters.dataset.loaded){
return
}

const html = await fetch(
"/modules/matrix/attendance.html"
).then(r=>r.text())

filters.innerHTML = html

filters.dataset.loaded = "1"

initMonth(root)

}

/* =========================
MONTH
========================= */

function getMonthValue(root){

const input =
root.querySelector(
"#attendance-month"
)

if(input?.value){
return input.value
}

const now = new Date()

return (
now.getFullYear()
+
"-"
+
String(
now.getMonth()+1
).padStart(2,"0")
)

}

function bindMonthChange(
root,
config,
matrix
){

const input =
root.querySelector(
"#attendance-month"
)

if(!input) return

if(input.dataset.binded) return

input.dataset.binded = "1"

input.addEventListener(
"change",
async ()=>{

await reloadMatrix(
root,
config,
matrix
)

}
)

}

function initMonth(root){

  const input =
    root.querySelector(
    "#attendance-month"
    )

  if(!input) return

  if(input.value) return

  const now = new Date()

  input.value =
    now.getFullYear()
    +
    "-"
    +
    String(
      now.getMonth()+1
    ).padStart(2,"0")

  createMonthpicker(
    root,
    "#attendance-month"
  )
}

/* =========================
ROLES BUTTON
========================= */

function bindRolesButton(
  root,
  params
){

  const btn =
    root.querySelector(
      "#btn-open-roles"
    )

  if(!btn) return

  if(
    params.type !== "permission_matrix"
  ){

    btn.style.display = "none"
    return

  }

  btn.style.display = ""

  btn.onclick = async () => {

    await openSidebarPage({

  url:
    "/modules/settings/settings.html",

  async onLoad(root){

  const mod = await import(
    "/modules/settings/settings.js"
  )

  await mod.init(
    {
      table: "roles"
    },
    root
  )

}

})

  }

}