// modules/document/print/layout-hidden-rows.js

export function layoutHiddenRows({

  blocks = [],

  document = {},

  shouldHideBlock

}){

  if(
    !Array.isArray(blocks) ||
    !blocks.length
  ){
    return []
  }

  /* ======================================
  GROUP ROWS
  ====================================== */

  const rowMap = new Map()

  blocks.forEach(block=>{

    const y = Number(block.y || 0)

    if(!rowMap.has(y)){
      rowMap.set(y, [])
    }

    rowMap.get(y).push(block)

  })

  const rows =

    [...rowMap.entries()]

      .sort(
        (a,b)=>a[0]-b[0]
      )

  if(!rows.length){
    return []
  }

  /* ======================================
  GAP
  ====================================== */

  let rowGap = 0

  if(rows.length >= 2){

    const firstY = rows[0][0]

    const firstHeight = Math.max(
      ...rows[0][1].map(
        b => Number(b.height || 0)
      )
    )

    rowGap =

      rows[1][0] -

      firstY -

      firstHeight

    if(rowGap < 0){
      rowGap = 0
    }

  }

  /* ======================================
  REFLOW
  ====================================== */

  const result = []

  let currentY = rows[0][0]

  rows.forEach(([,row])=>{

    const hidden =

      row.some(block=>

        shouldHideBlock(
          block,
          document
        )

      )

    const rowHeight = Math.max(

      ...row.map(

        block=>

          Number(
            block.height || 0
          )

      )

    )

    if(hidden){
      return
    }

    row.forEach(block=>{

      result.push({

        ...block,

        renderY: currentY

      })

    })

    currentY +=

      rowHeight +

      rowGap

  })

  return result

}