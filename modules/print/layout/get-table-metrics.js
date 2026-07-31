const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

/* =========================================
   CONFIG
========================================= */

const METRICS = {

  widthPadding: 8,        // cột "ảo" rộng thêm

  widthScale: 0.95,       // canvas nhỏ hơn browser bao nhiêu

  wrapRatio: 0.5,        // cho phép tràn trước khi xuống dòng

  cellPadding: 6.0,      // padding dọc

  lineHeight: 1.2,

  defaultFont: "Arial"

}

/* ========================================= */

export function getTableMetrics(
  table,
  rows = []
){

  const headerFontSize =
    table.props?.headerFontSize || 14

  const rowHeight = Math.max(
    table.props?.rowHeight || 24,
    headerFontSize
  )

  const headerHeight = Math.max(
    rowHeight,
    headerFontSize * METRICS.lineHeight +
    8
  )

  if(typeof rows === "number"){

    return{

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

    tableHeight +=
      getRowHeight({

        table,

        row,

        baseRowHeight: rowHeight

      })

  }

  return{

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

  for(const column of
      table.props?.columns || []){

    if(column.key==="stt"){
      continue
    }

    height = Math.max(

      height,

      getCellHeight({

        column,

        row,

        baseRowHeight

      })

    )

  }

  return height

}

/* ========================================= */

function getCellHeight({

  column,

  row,

  baseRowHeight

}){

  const layout =
    column.layout || "none"

  const mainField =
    column.main?.field ||
    column.key

  const detailField =
    column.detail?.field

  const mainValue =
    String(row?.[mainField] ?? "")

  const detailValue =
    String(row?.[detailField] ?? "")

  const mainFont =
    column.main?.fontSize || 12

  const detailFont =
    column.detail?.fontSize || 11

  const width =
    column.width +
    METRICS.widthPadding

  let height = 0

  let lines = 0

  const mainLines = estimateLines(

    mainValue,

    width,

    mainFont,

    column.main?.bold
      ? 700
      : 400

  )

  lines = mainLines

  height +=

    mainLines *

    Math.ceil(

      mainFont *
      METRICS.lineHeight

    )

  if(

    layout === "column" &&
    detailField &&
    detailValue

  ){

    const detailLines = estimateLines(

      detailValue,

      width,

      detailFont,

      column.detail?.bold
        ? 700
        : 400

    )

    lines += detailLines

    height +=

      detailLines *

      Math.ceil(

        detailFont *
        METRICS.lineHeight

      )

  }

  else if(

    layout === "row" &&
    detailField &&
    detailValue

  ){

    const font =
      Math.max(
        mainFont,
        detailFont
      )

    lines = estimateLines(

      `${mainValue} ${detailValue}`,

      width,

      font,

      column.main?.bold
        ? 700
        : 400

    )

    height =

      lines *

      Math.ceil(

        font *
        METRICS.lineHeight

      )

  }

  const padding = Math.max(

    2,

    METRICS.cellPadding -
    (lines - 1)

  )

  return Math.max(

    baseRowHeight,

    height + padding

  )

}

/* ========================================= */

function estimateLines(

  text,

  width,

  fontSize,

  fontWeight

){

  text = String(text)

  if(!text){
    return 1
  }

  ctx.font =

    `${fontWeight} ${fontSize}px ${METRICS.defaultFont}`

  const wrapWidth =

    width +

    width *
    METRICS.wrapRatio

  let current = 0

  let lines = 1

  for(const word of text.split(/\s+/)){

    const wordWidth =

      ctx.measureText(

        word + " "

      ).width

      *

      METRICS.widthScale

    if(

      current + wordWidth >
      wrapWidth

    ){

      lines++

      current =
        wordWidth

    }

    else{

      current +=
        wordWidth

    }

  }

  return lines

}