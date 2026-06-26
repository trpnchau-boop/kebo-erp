import {buildInput} from "../core/form-input.js"
import {bindMoneyInput} from "/js/core/input-format.js"
import {
  getFieldValue
} from "../core/form-field.js"

export async function buildForm(fields,target="form",layout="2col"){

let html = `<div class="fields">`

for(const key in fields){

  const f = fields[key]

  if(f.hidden) continue

  const label = f.label || key
  const input = await buildInput(key,f)
  const span = f.span
    ? ` style="grid-column:span ${f.span}"`
    : ""

  let extraClass = ""

  if(["checkbox","image"].includes(f.type)){
    extraClass = " field-inline"
  }

  html += `
  <div class="field${extraClass}"${span}>
    <label>${label}</label>
    ${input}
  </div>
  `
}

html += `</div>`

const box =
 typeof target === "string"
 ? document.getElementById(target)
 : target

if(box){
box.innerHTML = html
box.className = "form-layout-" + layout

initSmartLabels(box)
box.querySelectorAll('[data-format="money"]')
  .forEach(bindMoneyInput)
}

}
export function initSmartLabels(root=document){

const fields =
root.querySelectorAll(".field, .editor-field")

fields.forEach(field=>{

if(field.closest(".company-page")) return
if(field.dataset.smartBind) return
field.dataset.smartBind = "1"

const input =
field.querySelector(`
  input,
  textarea,
  .dropdown-select-trigger
`)

if(!input) return

const sync = ()=>{

  let hasValue = false

  if(input.type === "checkbox"){

    hasValue = input.checked

  }else{

    hasValue =
      String(
        getFieldValue(input)
      ).trim() !== ""
  }

  field.classList.toggle(
    "has-value",
    hasValue
  )
}

input.addEventListener("input", sync)
input.addEventListener("change", sync)

sync()

})

}