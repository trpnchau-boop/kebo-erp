// js/core/format.js

export function formatMoney(n){
  if(n === null || n === undefined || n === "") return ""

  const num = Number(n)

  if(isNaN(num)) return ""

  return num.toLocaleString("vi-VN")
}

export function formatDecimal(n){
  return Number(n || 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 2
  })
}

export function parseMoney(v){

  if(v === null || v === undefined) return null

  const str = String(v).trim()
  if(str === "") return null

  // chỉ giữ số
  const clean = str.replace(/[^\d]/g,"")

  if(clean === "") return null

  return Number(clean)
}