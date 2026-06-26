//selectors.js//

/* =========================================================
GET SECTIONS
========================================================= */

export function getSections(
  state
){

  return (
    state?.document?.sections || []
  )
}

/* =========================================================
GET ALL BLOCKS
========================================================= */

export function getAllBlocks(
  state
){

  return getSections(state)
    .flatMap(section=>{

      return (
        section.blocks || []
      )
    })
}

/* =========================================================
GET BLOCK BY ID
========================================================= */

export function getBlockById(

  state,
  blockId

){

  if(!blockId){
    return null
  }

  return getAllBlocks(state)
    .find(block=>{

      return (
        block.id === blockId
      )
    })
}

/* =========================================================
GET SECTION BY ID
========================================================= */

export function getSectionById(

  state,
  sectionId

){

  if(!sectionId){
    return null
  }

  return getSections(state)
    .find(section=>{

      return (
        section.id === sectionId
      )
    })
}

/* =========================================================
GET SECTION BY BLOCK ID
========================================================= */

export function getSectionByBlockId(

  state,
  blockId

){

  return getSections(state)
    .find(section=>{

      return (
        section.blocks || []
      )
      .some(block=>{

        return (
          block.id === blockId
        )
      })
    })
}

/* =========================================================
GET SELECTED IDS
========================================================= */

export function getSelectedIds(
  state
){

  return (
    state.selectedIds || []
  )
}

/* =========================================================
GET SELECTED BLOCK
========================================================= */

export function getSelectedBlock(
  state
){

  const selectedIds =
    getSelectedIds(state)

  const blockId =
    selectedIds[0]

  if(!blockId){
    return null
  }

  return getBlockById(
    state,
    blockId
  )
}

/* =========================================================
IS BLOCK SELECTED
========================================================= */

export function isBlockSelected(

  state,
  blockId

){

  return getSelectedIds(state)
    .includes(blockId)
}

