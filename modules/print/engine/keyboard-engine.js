import {
  printStore
}
from "/modules/print/core/store.js"

import {
  getSelectedIds,
  getBlockById
}
from "/modules/print/core/selectors.js"

import {
  removeBlock,
  setBlockPosition,
  addBlock
}
from "/modules/print/core/actions.js"

let keyboardBound = false

export function bindKeyboardEngine(){

  if(keyboardBound){
    return
  }

  keyboardBound = true

  window.addEventListener(

    "keydown",

    event=>{

      const state =
        printStore.getState()

      const selectedIds =
        getSelectedIds(state)

      if(!selectedIds.length){
        return
      }

      const tag =
        document.activeElement
          ?.tagName

      if(

        tag === "INPUT" ||

        tag === "TEXTAREA" ||

        tag === "SELECT"

      ){
        return
      }

      /* =========================
      DELETE
      ========================= */

if(

  event.key === "Delete" ||

  event.key === "Backspace"

){

  event.preventDefault()

  printStore.setState(state=>{

    selectedIds.forEach(id=>{

      removeBlock(
        state,
        id
      )

    })

    state.selectedIds = []

    return state
  })

  return
}
    }
  )
}

