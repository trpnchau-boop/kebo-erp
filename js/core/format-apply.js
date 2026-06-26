// js/core/format-apply.js
import {formatMoney} from "./format.js"

const formatters = {
  money: formatMoney
}

export function applyFormat(value, field){
  if(value == null) return ""

  const fn = formatters[field.format]
  return fn ? fn(value) : value
}