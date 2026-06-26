import {
  printStore
}
from "/modules/print/core/store.js"

import {
  getBlockById
}
from "/modules/print/core/selectors.js"

import {
  setBlockSize
}
from "/modules/print/core/actions.js"

/* =========================================================
CREATE GUIDE
========================================================= */

function createGuide(){

  const guide =
    document.createElement("div")

  guide.style.position =
    "absolute"

  guide.style.background =
    "#3b82f6"

  guide.style.pointerEvents =
    "none"

  guide.style.zIndex =
    "99999"

  guide.style.display =
    "none"

  return guide
}

/* =========================================================
RESIZE ENGINE
========================================================= */

export function bindResizeEngine(root){

  if(!root){
    return
  }

  let resizing = false

  let blockId = null

  let blockEl = null

  let pageEl = null

  let startX = 0
  let startY = 0

  let startWidth = 0
  let startHeight = 0

  let verticalGuide = null
  let horizontalGuide = null

  /* =======================================================
  POINTER DOWN
  ======================================================= */

  root.addEventListener(

    "pointerdown",

    event=>{

      const handle =
        event.target.closest(
          "[data-resize-id]"
        )

      if(!handle){
        return
      }

      event.stopPropagation()

      const state =
        printStore.getState()

      const block =
        getBlockById(
          state,
          handle.dataset.resizeId
        )

      if(!block){
        return
      }

      blockEl =
        root.querySelector(
          `[data-block-id="${block.id}"]`
        )

      if(!blockEl){
        return
      }

      pageEl =
        root.querySelector(
          ".print-page"
        )

      if(!pageEl){
        return
      }

      resizing = true

      blockId =
        block.id

      startX =
        event.clientX

      startY =
        event.clientY

      startWidth =
        block.width

      startHeight =
        block.height

      /* =========================================
      CREATE GUIDES
      ========================================== */

      verticalGuide =
        createGuide()

      horizontalGuide =
        createGuide()

      pageEl.appendChild(
        verticalGuide
      )

      pageEl.appendChild(
        horizontalGuide
      )
    }
  )

  /* =======================================================
  POINTER MOVE
  ======================================================= */

  window.addEventListener(

    "pointermove",

    event=>{

      if(!resizing){
        return
      }

      if(!blockEl){
        return
      }

      const dx =
        event.clientX - startX

      const dy =
        event.clientY - startY

      let nextWidth =
        startWidth + dx

      let nextHeight =
        startHeight + dy

      /* =========================================
      MIN SIZE
      ========================================== */

      nextWidth =
        Math.max(
          40,
          nextWidth
        )

      nextHeight =
        Math.max(
          30,
          nextHeight
        )

      /* =========================================
      REALTIME RESIZE
      ========================================== */

      blockEl.style.width =
        `${nextWidth}px`

      blockEl.style.height =
        `${nextHeight}px`

      /* =========================================
      RESET GUIDES
      ========================================== */

      verticalGuide.style.display =
        "none"

      horizontalGuide.style.display =
        "none"

      /* =========================================
      GET BLOCKS
      ========================================== */

      const state =
        printStore.getState()

      const allBlocks =

        state.document.sections
          .flatMap(section=>{

            return (
              section.blocks || []
            )
          })

      /* =========================================
      CHECK SIZE ALIGN
      ========================================== */

      allBlocks.forEach(other=>{

        if(other.id === blockId){
          return
        }

        /* =====================================
        SAME WIDTH
        ====================================== */

        if(

          Math.abs(
            nextWidth - other.width
          ) < 4

        ){

          nextWidth =
            other.width

          blockEl.style.width =
            `${nextWidth}px`

          verticalGuide.style.display =
            "block"

          verticalGuide.style.left =
            `${
              blockEl.offsetLeft +
              nextWidth
            }px`

          verticalGuide.style.top =
            "0"

          verticalGuide.style.bottom =
            "0"

          verticalGuide.style.width =
            "1px"
        }

        /* =====================================
        SAME HEIGHT
        ====================================== */

        if(

          Math.abs(
            nextHeight - other.height
          ) < 4

        ){

          nextHeight =
            other.height

          blockEl.style.height =
            `${nextHeight}px`

          horizontalGuide.style.display =
            "block"

          horizontalGuide.style.top =
            `${
              blockEl.offsetTop +
              nextHeight
            }px`

          horizontalGuide.style.left =
            "0"

          horizontalGuide.style.right =
            "0"

          horizontalGuide.style.height =
            "1px"
        }
      })
    }
  )

  /* =======================================================
  POINTER UP
  ======================================================= */

  window.addEventListener(

    "pointerup",

    ()=>{

      if(!resizing){
        return
      }

      /* =========================================
      SAVE SIZE
      ========================================== */

      if(blockEl){

        const finalWidth =
          parseFloat(
            blockEl.style.width
          ) || 0

        const finalHeight =
          parseFloat(
            blockEl.style.height
          ) || 0

        printStore.setState(state=>{

          setBlockSize(

            state,

            blockId,

            finalWidth,

            finalHeight
          )
        })
      }

      /* =========================================
      REMOVE GUIDES
      ========================================== */

      if(verticalGuide){
        verticalGuide.remove()
      }

      if(horizontalGuide){
        horizontalGuide.remove()
      }

      resizing = false

      blockId = null

      blockEl = null

      pageEl = null

      verticalGuide = null

      horizontalGuide = null
    }
  )
}

