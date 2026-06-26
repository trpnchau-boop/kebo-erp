import {getOne,getAll} from "../../../js/crud.js"
import {renderVariants} from "../product/product-variant.js"
import {renderCombo,initComboUI} from "../product/product-combo.js"
import {generateAutoCode} from "../../../js/auto-code.js"
import { schema } from "/js/schema/index.js"
import {formatInput} from "/js/core/input-format.js"
import {bindAllMoneyInputs} from "/js/core/input-format.js"
import {
  getFieldValue,
  setFieldValue
} from "../core/form-field.js"

function root(){
  return document.getElementById("sidebar-panel") || document
}

function $id(id){
  return root().querySelector(`#${id}`)
}

function $q(s){
  return root().querySelector(s)
}

export async function loadData(table,id){

  if(!id){
    await initAutoCode(table)
    return
  }

  const row = await getOne(table,id)
  if(!row) return

  const form = $id("form")
  if(!form) return

  const inputs =
    form.querySelectorAll("[data-field]")

  inputs.forEach(i=>{

    const field = i.dataset.field
    let value = row[field]

    if(i.type === "file"){

      const preview =
        form.querySelector(
          `[data-preview="${field}"]`
        )

      if(preview && value){
        preview.src = value
        preview.style.display = "block"
      }

    }else{

      setFieldValue(i,value)

      if(
        i.dataset?.format !== "money"
        && !i.classList?.contains(
          "dropdown-select-trigger"
        )
      ){
        formatInput(i)
      }
    }
  })

  bindAllMoneyInputs(form)

  inputs.forEach(i=>{
    i.dispatchEvent(new Event("input"))
    i.dispatchEvent(new Event("change"))
  })
}

async function loadVariants(productId){

const box = $id("variant-box")
if(box) box.style.display = "block"

const variants = await getAll("data_product",{parent_id:Number(productId)})
renderVariants(variants)
}

async function loadCombo(productId){
const ctx = {id:productId}
await initComboUI(ctx)   
const rows =
await getAll("product_structure",{product_id:Number(productId)})
await renderCombo(ctx, rows)
}

async function initAutoCode(table){

const fields = schema[table]?.fields || {}

for(const key in fields){

const f = fields[key]

if(!f.autoCode) continue

const input = $q(`[data-field="${key}"]`)

if(!input) continue

setFieldValue(
  input,
  await generateAutoCode(table,f,{})
)

if(
  input.dataset.format !== "money"
  && !input.classList?.contains(
    "dropdown-select-trigger"
  )
){
  formatInput(input)
}

input.dispatchEvent(new Event("input"))
input.dispatchEvent(new Event("change"))


// nếu có source thì bind onchange
if(f.autoCode.source){

const sourceInput =
$q(`[data-field="${f.autoCode.source}"]`)

if(sourceInput && !sourceInput.dataset.autoBind){

sourceInput.dataset.autoBind = "1"
sourceInput.addEventListener("change",async()=>{

const row = {
  [f.autoCode.source]:
    getFieldValue(sourceInput)
}

setFieldValue(
  input,
  await generateAutoCode(table,f,row)
)

input.dispatchEvent(new Event("input"))
input.dispatchEvent(new Event("change"))

})

}

}

}

}