import { initVariantUI } from "./product-variant.js"
import { initComboUI } from "./product-combo.js"
import { initUnitUI } from "./product-unit.js"
import { bindAllMoneyInputs } from "/js/core/input-format.js"
import { getFieldValue } from "../core/form-field.js"

function root(){
  return document.getElementById("sidebar-panel")
}

function getTypeTrigger(panel){
  return panel?.querySelector(
    '[data-field="type"].dropdown-select-trigger'
  )
}

export async function initProductForm(ctx){

  const panel = root()
  if(!panel) return

  // luôn re-init data UI con theo id hiện tại
  await initUnitUI(ctx)
  await initComboUI(ctx)
  await initVariantUI(ctx)

  // chỉ bind event 1 lần
  if(panel.dataset.productFormBound !== "1"){

    panel.dataset.productFormBound = "1"

    const bindUpdate = () => {
      setTimeout(updateUI, 0)
    }

    panel.addEventListener("click", e => {
      const typeEl = getTypeTrigger(panel)
      if(!typeEl) return

      const select = typeEl.closest(".dropdown-select")
      if(select && select.contains(e.target)){
        bindUpdate()
      }
    }, true)

    panel.addEventListener("change", e => {
      const typeEl = getTypeTrigger(panel)
      if(!typeEl) return

      if(
        e.target === typeEl ||
        typeEl.contains?.(e.target)
      ){
        bindUpdate()
      }
    }, true)

    panel.addEventListener("input", e => {
      const typeEl = getTypeTrigger(panel)
      if(!typeEl) return

      if(
        e.target === typeEl ||
        typeEl.contains?.(e.target)
      ){
        bindUpdate()
      }
    }, true)
  }

  setTimeout(() => {
    updateUI()
    bindAllMoneyInputs(panel)
  }, 0)

  function updateUI(){

    const typeEl = getTypeTrigger(panel)

    const type =
      String(getFieldValue(typeEl) || "")
        .trim()
        .toLowerCase()

    const comboBox   = panel.querySelector("#product-children")
    const variantBox = panel.querySelector("#variant-box")
    const unitBox    = panel.querySelector("#unit-box")

    if(comboBox) comboBox.style.display = "none"
    if(variantBox) variantBox.style.display = "none"
    if(unitBox) unitBox.style.display = "none"

    if(type === "combo"){
      if(comboBox) comboBox.style.display = "block"
      if(unitBox) unitBox.style.display = "block"
      return
    }

    if(type === "variant"){
      if(variantBox) variantBox.style.display = "block"
      if(unitBox) unitBox.style.display = "block"
      return
    }

    if(unitBox) unitBox.style.display = "block"
  }
}