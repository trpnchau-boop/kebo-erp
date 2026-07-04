import { printStore }
from "/modules/print/core/store.js"

import { getBlockById }
from "/modules/print/core/selectors.js"

import { setBlockPosition }
from "/modules/print/core/actions.js"

import {
  createGuide,
  hideGuides,
  showVerticalGuide,
  showHorizontalGuide,
  removeGuides
}
from "./move-guides.js"

import {
  getSelectedBlockElements,
  buildStartPositions,
  getAllBlocks
}
from "./move-state.js"

import {
  findSnap
}
from "./move-snap.js"

export function bindMoveEngine(root){

  if(!root){
    return
  }

  let dragging = false
  let pendingDrag = false

  let selectedIds = []
  let selectedBlocks = []

  let startPositions = {}

  let startX = 0
  let startY = 0

  let mainStartX = 0
  let mainStartY = 0

  let verticalGuide = null
  let horizontalGuide = null

  /* =====================================================
  POINTER DOWN
  ===================================================== */

  root.addEventListener(
    "pointerdown",
    event=>{

      if(
        event.target.closest("[data-resize-id]")
      ){
        return
      }

      const blockEl =
        event.target.closest(
          "[data-block-id]"
        )

      if(!blockEl){
        return
      }

      const state =
        printStore.getState()

      const block =
        getBlockById(
          state,
          blockEl.dataset.blockId
        )

      if(!block){
        return
      }

      if(
        !document.querySelector(
          ".print-page"
        )
      ){
        return
      }

      pendingDrag = true

      selectedIds =
        state.selectedIds.includes(
          block.id
        )
          ? state.selectedIds
          : [block.id]

      selectedBlocks =
        getSelectedBlockElements(
          root,
          selectedIds
        )

      startPositions =
        buildStartPositions(
          selectedIds,
          getBlockById,
          state
        )

      startX = event.clientX
      startY = event.clientY

      mainStartX = block.x
      mainStartY = block.y

      verticalGuide =
        createGuide()

      horizontalGuide =
        createGuide()

      const guideLayer =
        document.querySelector(
          ".print-guide-layer"
        )

      if(!guideLayer){
        return
      }

      guideLayer.append(
        verticalGuide,
        horizontalGuide
      )

    }
  )

  /* =====================================================
  POINTER MOVE
  ===================================================== */

  window.addEventListener(
    "pointermove",
    event=>{

      if(!selectedBlocks.length){
        return
      }

      const dx =
        event.clientX - startX

      const dy =
        event.clientY - startY

      if(
        pendingDrag &&
        (
          Math.abs(dx) > 3 ||
          Math.abs(dy) > 3
        )
      ){
        dragging = true
        pendingDrag = false
      }

      if(!dragging){
        return
      }

      const livePageEl =
        document.querySelector(
          ".print-page"
        )

      if(!livePageEl){  
        return
      }  

      const pageRect =
        livePageEl.getBoundingClientRect()

      const state =
        printStore.getState()

      const section =
        state.document.sections.find(
          s=>{

            const main =
              selectedBlocks[0]

            return (
              main.closest(
                "[data-section-id]"
              )?.dataset.sectionId
              === s.id
            )
          }
        )

      const sectionX =
        section?.x || 0

      const sectionY =
        section?.y || 0

      const nextPageX =
        sectionX +
        mainStartX +
        dx

      const nextPageY =
        sectionY +
        mainStartY +
        dy

      const mainEl =
        selectedBlocks[0]

      const nextCenterX =
        nextPageX +
        mainEl.offsetWidth / 2

      const nextCenterY =
        nextPageY +
        mainEl.offsetHeight / 2

      hideGuides(
        verticalGuide,
        horizontalGuide
      )

      const snap =
        findSnap({

          nextPageX,
          nextPageY,

          nextCenterX,
          nextCenterY,

          selectedIds,

          allBlocks:
            getAllBlocks(
              state
            )
        })


      if(
        snap.guideX !== null
      ){

        const guideScreenX =
          pageRect.left +
          snap.guideX

        showVerticalGuide(
          verticalGuide,
          guideScreenX
        )
      }

      if(
        snap.guideY !== null
      ){

        const guideScreenY =
          pageRect.top +
          snap.guideY

        showHorizontalGuide(
          horizontalGuide,
          guideScreenY
        )
      }

      selectedIds.forEach(id=>{

        const el =
          root.querySelector(
            `[data-block-id="${id}"]`
          )

        const start =
          startPositions[id]

        if(
          !el ||
          !start
        ){
          return
        }

        const finalLeft =
          start.x +
          dx +
          snap.snapDeltaX

        const finalTop =
          start.y +
          dy +
          snap.snapDeltaY

        el.style.left =
          `${finalLeft}px`

        el.style.top =
          `${finalTop}px`
      })

    }
  )

  /* =====================================================
  POINTER UP
  ===================================================== */

  window.addEventListener(
    "pointerup",
    ()=>{

      if(!dragging){

        removeGuides(
          verticalGuide,
          horizontalGuide
        )

        verticalGuide = null
        horizontalGuide = null

        selectedIds = []
        selectedBlocks = []
        startPositions = {}  

        pendingDrag = false

        return
      }

      printStore.setState(
        state=>{

          selectedIds.forEach(
            id=>{

              const el =
                root.querySelector(
                  `[data-block-id="${id}"]`
                )

              if(!el){
                return
              }

              const x =
                parseFloat(
                  el.style.left
                ) || 0

              const y =
                parseFloat(
                  el.style.top
                ) || 0

              setBlockPosition(
                state,
                id,
                x,
                y
              )
            }
          )
        }
      )

      removeGuides(
        verticalGuide,
        horizontalGuide
      )

      dragging = false
      pendingDrag = false

      selectedIds = []
      selectedBlocks = []

      startPositions = {}

      verticalGuide = null
      horizontalGuide = null
    }
  )
}