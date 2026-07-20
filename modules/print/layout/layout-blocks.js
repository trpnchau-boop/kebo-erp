// layout/layout-blocks.js

const DEFAULT_GAP = 20

export function layoutBlocks(

  section,
  itemsCount = 0

){

  if(
    !section?.blocks?.length
  ){
    return
  }

  const blocks =

    [...section.blocks]

      .sort(

        (a,b)=>

          (a.y || 0) -
          (b.y || 0)

      )

  /* ======================================
  FIND TABLE
  ====================================== */

  const table =

    blocks.find(
      block =>
        block.type === "table"
    )

  if(!table){
    return
  }

  /* ======================================
  TABLE HEIGHT
  ====================================== */

  const rowHeight =

    table.props?.rowHeight || 24

  const extraRows =

    Math.max(
      itemsCount - 1,
      0
    )

  table.renderHeight =

    table.renderHeight ??

    (
      table.height +
      extraRows * rowHeight
    )

  /* ======================================
  LAYOUT BLOCKS BELOW TABLE
  ====================================== */

  let currentY =

    table.y +
    table.renderHeight

  blocks.forEach(block=>{

    if(
      block === table
    ){
      return
    }

    if(
      block.y <= table.y
    ){
      return
    }

    block.y =

      currentY +
      DEFAULT_GAP

    currentY =

      block.y +

      (
        block.renderHeight ??

        block.height ??

        0
      )

  })

}