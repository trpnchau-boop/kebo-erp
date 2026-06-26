import {
  getBlockById,
  getSectionById
}
from "/modules/print/core/selectors.js"

import {
  reflowSections
}
from "/modules/print/layout/reflow-sections.js"

/* =========================================================
REFLOW
========================================================= */

function reflow(state){

  reflowSections(
    state.document.sections
  )
}

/* =========================================================
SET BLOCK POSITION
========================================================= */

export function setBlockPosition(

  state,

  blockId,

  x,
  y

){

  const block =
    getBlockById(
      state,
      blockId
    )

  if(!block){
    return
  }

  block.x =
    Math.max(0,x)

  block.y =
    Math.max(0,y)

  reflow(state)
}

/* =========================================================
SET BLOCK SIZE
========================================================= */

export function setBlockSize(

  state,

  blockId,

  width,
  height

){

  const block =
    getBlockById(
      state,
      blockId
    )

  if(!block){
    return
  }

  block.width =
    Math.max(
      40,
      width
    )

  const minHeight =
    block.type === "line"
      ? 1
      : 30

  block.height =
    Math.max(
      minHeight,
      height
    )

  reflow(state)
}

/* =========================================================
SET BLOCK PROPS
========================================================= */

export function setBlockProps(

  state,

  blockId,

  props = {}

){

  const block =
    getBlockById(
      state,
      blockId
    )

  if(!block){
    return
  }

  block.props = {

    ...block.props,

    ...props
  }
}

/* =========================================================
SELECT BLOCK
========================================================= */

export function selectBlock(

  state,
  blockId

){

  if(!blockId){

    state.selectedIds = []

    return
  }

  state.selectedIds = [
    blockId
  ]
}

/* =========================================================
CLEAR SELECTION
========================================================= */

export function clearSelection(
  state
){

  state.selectedIds = []

  state.selectedSectionId =
    null
}

/* =========================================================
ADD BLOCK
========================================================= */

export function addBlock(

  state,

  sectionId,

  block

){

  const section =
    getSectionById(
      state,
      sectionId
    )

  if(!section){
    return
  }

  if(!section.blocks){

    section.blocks = []
  }

  section.blocks.push(block)

  reflow(state)
}

/* =========================================================
REMOVE BLOCK
========================================================= */

export function removeBlock(

  state,
  blockId

){

  state.document.sections
    .forEach(section=>{

      section.blocks =

        (section.blocks || [])
          .filter(block=>{

            return (
              block.id !== blockId
            )
          })
    })

  reflow(state)
}
