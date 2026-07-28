const canvas = document.createElement("canvas")

const ctx = canvas.getContext("2d")

export function getTableMetrics(
  table,
  rows = []
){

  const headerFontSize =
    table.props?.headerFontSize || 14

  const rowHeight = Math.max(
    table.props?.rowHeight || 24,
    headerFontSize + 12
  )

  const headerHeight = Math.max(
    rowHeight + 8,
    headerFontSize + 18
  )

  // Builder vẫn truyền rows.length
  if(typeof rows === "number"){

    return {

      rowHeight,

      headerHeight,

      tableHeight:
        headerHeight +
        rows * rowHeight

    }

  }

  let tableHeight =
    headerHeight

  for(const row of rows){

    tableHeight += getRowHeight({

      table,

      row,

      baseRowHeight: rowHeight

    })

  }

  return {

    rowHeight,

    headerHeight,

    tableHeight

  }

}

/* ========================================= */

function getRowHeight({

  table,

  row,

  baseRowHeight

}){


  let height =
    baseRowHeight

  const columns =
    table.props?.columns || []


  for(const column of columns){

  let cellHeight =
    baseRowHeight

  /* ==========================
     MAIN
  ========================== */

  const mainField =

    column.main?.field ||

    column.key

  let mainValue =
    row?.[mainField] ?? ""

  if(column.key === "stt"){

    height = Math.max(
        height,
        baseRowHeight
    )

    continue

  }

  const mainLines = 

    estimateLines(

      mainValue,

      column.width - 8,

      column.main?.fontSize || 12,

      column.main?.bold ? 700 : 400

    )

  if(mainLines > 1){

    const mainFontSize =

      column.main?.fontSize || 12

    const mainLineHeight =

      Math.ceil(
        mainFontSize * 1.2
      )

    cellHeight +=

      (mainLines - 1) *

      mainLineHeight

  }

  /* ==========================
     DETAIL
  ========================== */

  const layout =
  column.layout || "none"

  const detailField =
    column.detail?.field

  if(
    layout === "row" &&
    detailField
  ){

    const detailValue =
      row?.[detailField] ?? ""

    const rowText =

      `${mainValue} ${detailValue}`.trim()

    const rowLines =

      estimateLines(

        rowText,

        column.width - 8,

        Math.max(

          column.main?.fontSize || 12,

          column.detail?.fontSize || 11

        ),

        column.main?.bold
          ? 700
          : 400

      )

    if(rowLines > 1){

      const lineHeight =

        Math.ceil(

          Math.max(

            column.main?.fontSize || 12,

            column.detail?.fontSize || 11

          ) * 1.2

        )

      cellHeight +=

        (rowLines - 1) *

        lineHeight

    }

  }  

  else if(
    layout === "column" &&
    detailField
  ){

    const detailValue =
      row?.[detailField] ?? ""

    if(detailValue){

        const detailLines =
          estimateLines(
            detailValue,
            column.width - 8,
            column.detail?.fontSize || 11,
            column.detail?.bold ? 700 : 400
          )

        const detailFontSize =
          column.detail?.fontSize || 11

        const detailLineHeight =
          Math.ceil(detailFontSize * 1.2)

        cellHeight += detailLines * detailLineHeight
    }

}

  height =

    Math.max(
      height,
      cellHeight
    )

}

  return height

}

function estimateLines(

  text = "",

  width = 100,

  fontSize = 12,

  fontWeight = 400

){

  text = String(text)

  if(!text){

    return 1

  }

  ctx.font =

    `${fontWeight} ${fontSize}px Arial`

  const words =

    text.split(/\s+/)

  let lines = 1

  let currentWidth = 0

  for(const word of words){

    const wordWidth =

      ctx.measureText(word + " ").width

    if(

      currentWidth + wordWidth >

      width

    ){

      lines++

      currentWidth = wordWidth

    }

    else{

      currentWidth += wordWidth

    }

  }

  return lines

}