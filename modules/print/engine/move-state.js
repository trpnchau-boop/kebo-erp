export function getSelectedBlockElements(
  root,
  ids
){

  return ids

    .map(id=>{

      return root.querySelector(
        `[data-block-id="${id}"]`
      )

    })

    .filter(Boolean)
}

export function buildStartPositions(
  ids,
  getBlockById,
  state
){

  const result = {}

  ids.forEach(id=>{

    const block =
      getBlockById(
        state,
        id
      )

    if(!block){
      return
    }

    result[id] = {

      x:block.x,
      y:block.y
    }
  })

  return result
}

export function getAllBlocks(
  state
){

  return state.document.sections

    .flatMap(section=>{

      return (
        section.blocks || []
      )

      .map(block=>({

        ...block,

        pageX:
          section.x + block.x,

        pageY:
          section.y + block.y
      }))
    })
}