import { schema } from "/js/schema/index.js"
import {buildForm} from "./engine/form-builder.js"
import {loadData} from "./engine/form-loader.js"
import {saveData} from "./engine/form-save.js"
import {initProductForm} from "./product/product-form.js"
import {bindAllMoneyInputs} from "../../js/core/input-format.js"
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
let id
let fields
let bulk=false
let ids=[]

function root(){
 return document.getElementById("sidebar-panel")
}

function $id(id){
  return root().querySelector(`#${id}`)
}

export async function init(params){
table = params.table
id = params.id
bulk = params.bulk || false
ids = params.ids || []
fields = schema[table].fields

// ===== title =====
const titleEl = $id("title")

if(titleEl){
  titleEl.innerText =
    bulk
    ? "Sửa nhiều " + (schema[table]?.label || table)
    : (schema[table]?.label || table)
}
// ===== build form =====
const layout = schema[table].layout || "2col"

await buildForm(fields,"form",layout)
bindDropdownMenus()
bindDropdownSelect(root())

// init product UI trước để có sẵn box + event + nơi render dữ liệu con
if(table=="data_product"){
  await initProductForm({table,id})
}

// load data sau cùng
if(!bulk){
  await loadData(table,id)
}

bindAllMoneyInputs(root())

// ===== save =====
$id("btn-save").onclick = async ()=>{

  // nếu schema có custom save → dùng
  if(schema[table].onSave){
    await schema[table].onSave({
      table,
      id,
      fields,
      bulk,
      ids,
      root: root()
    })
    return
  }

  // default
  await saveData({
    table,
    id,
    fields,
    bulk,
    ids
  })
}
}