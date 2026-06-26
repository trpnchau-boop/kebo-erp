// modules/stock/stock.js

import {bindEvents} from "./stock-event.js"
import {loadMaster, loadStock} from "./stock-load.js"
import {toggleCheckMode} from "./stock-check.js"
import {
  bindDropdownMenus
}
from "/js/components/dropdown-menu.js"

import {
  bindDropdownSelect
}
from "/js/components/dropdown-select.js"

export async function init(params={}, root){

if(params.type === "ledger"){

  const res = await fetch("/modules/stock/stock-ledger.html")
  const html = await res.text()

  root.innerHTML = html

  const mod = await import("./stock-ledger.js")

  return mod.init(params, root)
}
bindDropdownMenus(root)
bindDropdownSelect(root)
bindEvents(root)

await loadMaster(root)
await loadStock(root)

if(params.action === "check"){
  toggleCheckMode(root)
}

}