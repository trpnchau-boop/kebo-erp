import {getOne,getAll} from "../../../js/crud.js"
import {generateAutoCode} from "../../../js/auto-code.js"
import { schema } from "/js/schema/index.js"
import {formatInput} from "/js/core/input-format.js"
import {bindAllMoneyInputs} from "/js/core/input-format.js"

import {renderVariants, initVariantUI} from "../product/product-variant.js"
import {renderCombo,initComboUI} from "../product/product-combo.js"
//import { initUnitUI } from "../product/product-unit.js"

import {
  getFieldValue,
  setFieldValue
} from "../core/form-field.js"
import { initSmartLabels } from "../engine/form-builder.js"

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

    const form = $id("form")
    if(form){

     const inputs =
        form.querySelectorAll("[data-field]")

      inputs.forEach(i=>{

        const field =
          schema[table]?.fields?.[
            i.dataset.field
         ]

        if(
          field &&
          field.default !== undefined
        ){

          setFieldValue(
            i,
            field.default
          )

        }

      })

    }

    await initAutoCode(table)

    initSmartLabels(form)

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

async function initAutoCode(table, row = {}){

const fields = schema[table]?.fields || {}

for(const key in fields){

const f = fields[key]

if(!f.autoCode) continue

const input = $q(`[data-field="${key}"]`)

if(!input) continue

setFieldValue(
  input,
  await generateAutoCode(table, f, row)
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
$q(`.dropdown-select-trigger[data-field="${f.autoCode.source}"]`)
||
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
export async function cleanForm(table){

  const form = $id("form")
  if(!form) return

  const keep = {
    id_group: getFieldValue(
      form.querySelector('[data-field="id_group"]')
    ),
    type: getFieldValue(
      form.querySelector('[data-field="type"]')
    ),
    id_warehouse: getFieldValue(
      form.querySelector('[data-field="id_warehouse"]')
    )
  }

  const inputs =
    form.querySelectorAll("[data-field]")

  inputs.forEach(i=>{

    if(i.type === "file"){

      i.value = ""

      const preview =
        form.querySelector(
          `[data-preview="${i.dataset.field}"]`
        )

      if(preview){
        preview.removeAttribute("src")
        preview.style.display = "none"
      }

      return
    }

    const field =
      schema[table]?.fields?.[
        i.dataset.field
      ]

    const value =
      field?.default

    if(i.type === "checkbox"){

      setFieldValue(
        i,
        value ?? false
      )

    }else{

      setFieldValue(
        i,
        value ?? ""
      )
    }

    i.dispatchEvent(new Event("input"))
    i.dispatchEvent(new Event("change"))

  })

  const group =
    form.querySelector('[data-field="id_group"]')

  const type =
    form.querySelector('[data-field="type"]')

  const warehouse =
    form.querySelector(
      '[data-field="id_warehouse"]'
    )

  setFieldValue(group, keep.id_group)
  setFieldValue(type, keep.type)
  setFieldValue(
    warehouse,
    keep.id_warehouse
  )

  group?.dispatchEvent(new Event("input"))
  group?.dispatchEvent(new Event("change"))

  type?.dispatchEvent(new Event("input"))
  type?.dispatchEvent(new Event("change"))

  warehouse?.dispatchEvent(new Event("input"))
  warehouse?.dispatchEvent(new Event("change"))

  await initAutoCode(table, {
    id_group: keep.id_group
  })

  initSmartLabels(form)

  await initVariantUI({})
  await initComboUI({})
  //await initUnitUI({})

  const nameInput =
    form.querySelector(
      '[data-field="name"]'
    )

  nameInput?.focus()
}