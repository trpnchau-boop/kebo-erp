export function calcSectionHeight(

  section,
  itemsCount = 0

){

  let maxBottom = 0

  ;(section.blocks || [])

    .forEach(block=>{

let height = block.height || 0

if(block.type==="table"){

    const rowHeight =
        block.props?.rowHeight || 24

    const extraRows =
        Math.max(itemsCount-1,0)

    height =
        block.height +
        extraRows*rowHeight
}

block.renderHeight = height


      const bottom =

        (block.y || 0) +
        height

      if(
        bottom > maxBottom
      ){
        maxBottom = bottom
      }
    })

  return Math.max(

    0,

    maxBottom + 10
  )
}