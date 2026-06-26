import {
  printStore
}
from "/modules/print/core/store.js"

import {
  getSelectedBlock
}
from "/modules/print/core/selectors.js"

let resizing = false

export function bindTableResizeEngine(root){

  if(!root){
    return
  }

  let startX = 0
  let startWidth = 0
  let columnIndex = -1

  root.addEventListener(

    "pointerdown",

    event=>{

      const handle =

        event.target.closest(
          ".table-column-resize"
        )

      if(!handle){
        return
      }

      const state =
        printStore.getState()

      const block =
        getSelectedBlock(state)

      if(
        !block ||
        block.type !== "table"
      ){
        return
      }

      resizing = true

      startX =
        event.clientX

      columnIndex =
        Number(
          handle.dataset
            .columnIndex
        )

      startWidth =

        block.props.columns[
          columnIndex
        ].width || 120

      event.preventDefault()
    }
  )

  window.addEventListener(

    "pointermove",

    event=>{

      if(!resizing){
        return
      }

      const delta =

        event.clientX -
        startX

      printStore.setState(state=>{

        const block =
          getSelectedBlock(state)

        if(
          !block ||
          block.type !== "table"
        ){
          return
        }

        const column =

          block.props.columns[
            columnIndex
          ]

        if(!column){
          return
        }

        column.width =

          Math.max(
            40,
            startWidth + delta
          )
      })
    }
  )

  window.addEventListener(

    "pointerup",

    ()=>{

      resizing = false
    }
  )
}