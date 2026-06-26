import {
  printStore
}
from "/modules/print/core/store.js"

import {
  openPropertySidebar
}
from "/modules/print/panel/open-property-sidebar.js"


/* =========================================================
SELECT BOX
========================================================= */

let selecting = false

let startX = 0
let startY = 0

let selectionBox = null

/* =========================================================
CREATE SELECTION BOX
========================================================= */

function createSelectionBox(){

  const box =
    document.createElement("div")

  box.style.position =
    "fixed"

  box.style.border =
    "1px solid #2563eb"

  box.style.background =
    "rgba(37,99,235,.08)"

  box.style.pointerEvents =
    "none"

  box.style.zIndex =
    "999999"

  return box
}

/* =========================================================
BIND SELECT ENGINE
========================================================= */

export function bindSelectEngine(root){

  if(!root){
    return
  }

  /* =======================================================
  POINTER DOWN
  ======================================================= */

root.addEventListener(

  "pointerdown",

  event=>{

    try{

      const columnEl =

        event.target.closest(
          "[data-column-index]"
        )

      if(columnEl){

        const blockEl =
          columnEl.closest(
            "[data-block-id]"
          )

        const sectionEl =
          blockEl?.closest(
            "[data-section-id]"
          )

        printStore.setState(state=>{

          state.selectedIds = [
            blockEl.dataset.blockId
          ]

          state.selectedColumnIndex =
            Number(
              columnEl.dataset.columnIndex
            )

          state.selectedSectionId =
            sectionEl?.dataset?.sectionId
            || null
        })

        return
      }

      const sidebar =

        event.target.closest(
          ".print-sidebar,.print-schema"
        )

      if(sidebar){
        return
      }

      const toolbar =
        event.target.closest(
          ".print-toolbar"
        )

      if(toolbar){
        return
      }

      const resizeHandle =
        event.target.closest(
          "[data-resize-id]"
        )

     if(resizeHandle){
        return
      }

      const movingBlock =
        root.querySelector(
          ".print-block-moving"
        )

      if(movingBlock){
        return
      }

      const blockEl =
        event.target.closest(
          "[data-block-id]"
        )





      if(!blockEl){

  const sectionEl =
    event.target.closest(
      "[data-section-id]"
    )

        selecting = true

        startX =
          event.clientX

        startY =
          event.clientY

        selectionBox =
          createSelectionBox()

        selectionBox.style.left =
          `${startX}px`

        selectionBox.style.top =
          `${startY}px`

        selectionBox.style.width =
          "0px"

        selectionBox.style.height =
          "0px"

        document.body.appendChild(
          selectionBox
        )

        printStore.setState(state=>{

          state.selectedIds = []

          state.selectedColumnIndex = null

          state.selectedSectionId =
            sectionEl?.dataset
              ?.sectionId || null
        })        

        return
      }


      const sectionEl =
        blockEl.closest(
          "[data-section-id]"
        )

      const blockId =
        blockEl.dataset.blockId

      printStore.setState(state=>{

        state.selectedIds = [
          blockId
        ]

        state.selectedColumnIndex =
          null

        state.selectedSectionId =
          sectionEl?.dataset?.sectionId
          || null
      })

      openPropertySidebar()


    }catch(err){


    }finally{


    }
  }
)

  /* =======================================================
  POINTER MOVE
  ======================================================= */

  window.addEventListener(

    "pointermove",

    event=>{

      if(!selecting){
        return
      }

      if(!selectionBox){
        return
      }

      const x =
        Math.min(
          startX,
          event.clientX
        )

      const y =
        Math.min(
          startY,
          event.clientY
        )

      const width =
        Math.abs(
          event.clientX - startX
        )

      const height =
        Math.abs(
          event.clientY - startY
        )

      /* =========================================
      UPDATE BOX
      ========================================== */

      selectionBox.style.left =
        `${x}px`

      selectionBox.style.top =
        `${y}px`

      selectionBox.style.width =
        `${width}px`

      selectionBox.style.height =
        `${height}px`

      /* =========================================
      CHECK BLOCKS
      ========================================== */

      const selectedIds = []

      root
        .querySelectorAll(
          "[data-block-id]"
        )

        .forEach(blockEl=>{

          const rect =
            blockEl.getBoundingClientRect()

          const overlap =

            !(
              rect.right < x ||
              rect.left > x + width ||
              rect.bottom < y ||
              rect.top > y + height
            )

          if(overlap){

            selectedIds.push(
              blockEl.dataset.blockId
            )
          }
        })

      printStore.setState(state=>{

        state.selectedIds =
          selectedIds
      })
    }
  )

  /* =======================================================
  POINTER UP
  ======================================================= */

  window.addEventListener(

    "pointerup",

    ()=>{

      selecting = false

      if(selectionBox){

        selectionBox.remove()

        selectionBox = null
      }
    }
  )
}

