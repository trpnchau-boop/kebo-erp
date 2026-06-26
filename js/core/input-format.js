// js/core/input-format.js

import {formatMoney, parseMoney} from "./format.js"

export function bindMoneyInput(input){

  if(!input) return

  // init luôn
  const initVal = parseMoney(input.value)

  if(initVal !== null){
    input.value = formatMoney(initVal)
  }

  // chỉ chặn bind event
  if(input.dataset.moneyBind) return

  input.dataset.moneyBind = "1"

  input.addEventListener("focus", ()=>{
    const val = parseMoney(input.value)
    input.value = val !== null ? String(val) : ""
  })

  input.addEventListener("blur", ()=>{
    const val = parseMoney(input.value)
    input.value = val !== null ? formatMoney(val) : ""
  })

  input.addEventListener("input", ()=>{
    const raw = input.value.replace(/[^\d]/g,"")
    input.dataset.raw = raw
  })
}

export function formatInput(input){

  if(!input) return

  if(input.dataset.format === "money"){
    input.value = formatMoney(input.value)
    
  }
}

export function bindAllMoneyInputs(root = document){

  root.querySelectorAll('input[data-format="money"]')
    .forEach(bindMoneyInput)

}