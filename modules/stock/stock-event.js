import {render} from "./stock-render.js"
import {loadStock} from "./stock-load.js"

import {
toggleCheckMode,
saveCheck
} from "./stock-check.js"

import {
toggleTransferMode,
saveTransfer
} from "./stock-transfer.js"

function $(root,id){
  return root.querySelector(`#${id}`)
}

export function bindEvents(root){

  $(root,"search-stock")
  ?.addEventListener(
    "input",
    ()=>render(root)
  )

  $(root,"filter-kho")
  ?.addEventListener(
    "change",
    ()=>render(root)
  )

  $(root,"filter-status")
  ?.addEventListener(
    "change",
    ()=>render(root)
  )

  $(root,"btn-refresh")
  ?.addEventListener(
    "click",
    async e=>{

      const btn = e.currentTarget

      btn.classList.add("loading")

      try{

        await loadStock(root)

      }finally{

        btn.classList.remove("loading")

      }
  
    }
  )

  $(root,"btn-mode")
  ?.addEventListener(
    "click",
    ()=>toggleCheckMode(root)
  )

  $(root,"btn-transfer")
  ?.addEventListener(
    "click",
    ()=>toggleTransferMode(root)
  )

  $(root,"btn-save-check")
  ?.addEventListener(
    "click",
    ()=>saveCheck(root)
  )

  $(root,"transfer-to")
  ?.addEventListener(
    "change",
    ()=>render(root)
  )

  $(root,"btn-save-transfer")
  ?.addEventListener(
    "click",
    ()=>saveTransfer(root)
  )

}