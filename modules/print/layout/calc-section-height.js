
import {
  getTableMetrics
}
from "/modules/print/layout/get-table-metrics.js"

export function calcSectionHeight(

  section,
  items = []

){

  let maxBottom = 0

  ;(section.blocks || [])

    .forEach(block=>{

let height = block.height || 0

if(block.type === "table"){

    height =

      getTableMetrics(

        block,

        items

      ).tableHeight
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

    80,

    maxBottom
  )
}