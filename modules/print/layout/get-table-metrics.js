import {
  formatMoney
} from "/js/core/format.js"

/* =========================================
CONFIG
========================================= */

const METRICS = {

  lineHeight: 1.2,

  defaultFont: "Arial",

  mainPadding:
    "3px 1px 2px 3px",

  detailPadding:
    "3px 0 2px 3px"

}

/* =========================================
PUBLIC
========================================= */

export function getTableMetrics(
  table,
  rows = []
){

  const headerFontSize =
    Number(
      table.props?.headerFontSize || 14
    )

  const rowHeight =
    Math.max(

      Number(
        table.props?.rowHeight || 24
      ),

      headerFontSize

    )

  /*
    Nếu caller truyền number,
    giữ compatibility với logic cũ.
  */

  if(typeof rows === "number"){

    return {

      rowHeight,

      headerHeight:
        rowHeight,

      tableHeight:
        rowHeight +
        rows * rowHeight

    }

  }

  /*
    ĐO CHÍNH TABLE HTML THẬT
  */

  const measured =
    measureRealTable({

      table,

      rows,

      rowHeight

    })

  return {

    rowHeight,

    headerHeight:
      measured.headerHeight,

    tableHeight:
      measured.tableHeight

  }

}

/* =========================================
MEASURE REAL TABLE
========================================= */

function measureRealTable({

  table,

  rows,

  rowHeight

}){

  const columns =
    table.props?.columns || []

  /*
    Tạo chính <table> mà print-render
    đang tạo.

    Không dùng display:none vì browser
    sẽ không layout nó.
  */

  const measurementTable =
    document.createElement("table")

  measurementTable.className =
    "print-table"

  measurementTable.style.position =
    "absolute"

  measurementTable.style.left =
    "-100000px"

  measurementTable.style.top =
    "0"

  measurementTable.style.visibility =
    "hidden"

  measurementTable.style.pointerEvents =
    "none"

  measurementTable.style.width =
    `${Number(table.width || 0)}px`

  measurementTable.style.borderCollapse =
    "collapse"

  /*
    Giống print-render.js:
      <colgroup>
        <col style="width:...">
      </colgroup>
  */

  const colgroup =
    document.createElement("colgroup")

  for(const column of columns){

    const col =
      document.createElement("col")

    col.style.width =
      `${Number(
        column.width || 0
      )}px`

    colgroup.appendChild(col)

  }

  measurementTable.appendChild(
    colgroup
  )

  const tbody =
    document.createElement("tbody")

  measurementTable.appendChild(
    tbody
  )

  /* =======================================
  HEADER
  ======================================= */

  const headerRow =
    document.createElement("tr")

  for(const column of columns){

    const main =
      column.main || {}

    const th =
      document.createElement("th")

    th.style.border =
      "1px solid #000"

    th.style.padding =
      "4px"

    th.style.textAlign =
      main.align || "left"

    th.style.fontSize =
      `${Number(
        table.props?.headerFontSize || 14
      )}px`

    th.style.fontWeight =
      table.props?.headerBold
        ? "700"
        : "400"

    th.style.fontStyle =
      table.props?.headerItalic
        ? "italic"
        : "normal"

    th.style.textDecoration =
      table.props?.headerUnderline
        ? "underline"
        : "none"

    th.style.color =
      table.props?.headerColor ||
      "#000"

    th.style.background =
      table.props?.headerBackgroundColor ||
      "#eeeeee"

    th.textContent =
      column.label ||
      cleanColumnKey(column.key)

    headerRow.appendChild(th)

  }

  tbody.appendChild(
    headerRow
  )

  /* =======================================
  DATA ROWS
  ======================================= */

  rows.forEach(
    (item, index) => {

      const tr =
        document.createElement("tr")

      for(const column of columns){

        const main =
          column.main || {}

        const detail =
          column.detail || {}

        const layout =
          column.layout || "none"

        /*
          MAIN
        */

        let mainValue = ""

        if(column.key === "stt"){

          mainValue =
            index + 1

        }else{

          mainValue =
            getColumnValue(
              item,
              main,
              column.key
            )

        }

        /*
          DETAIL
        */

        const detailValue =
          getColumnValue(
            item,
            detail,
            ""
          )

        /*
          SPECIAL QTY
        */

        if(column.key === "qty"){

          const qty =
            Number(
              item?.qty || 0
            )

          const tong =
            Number(
              item?.tongsoluong || 0
            )

          if(qty === tong){

            mainValue = ""

          }

        }

        const td =
          document.createElement("td")

        /*
          Giống print-render.js
        */

        td.style.border =
          "1px solid #000"

        td.style.padding =
          "0px"

        td.style.verticalAlign =
          "top"

        /*
          layout === none
          thì renderer không render gì.
        */

        if(layout !== "none"){

          const content =
            document.createElement("div")

          /*
            COLUMN
          */

          if(layout === "column"){

            content.style.display =
              "flex"

            content.style.flexDirection =
              "column"

            content.style.gap =
              "0"

          }

          /*
            ROW
          */

          else if(layout === "row"){

            content.style.display =
              "flex"

            content.style.flexDirection =
              "row"

            content.style.alignItems =
              "center"

            content.style.gap =
              "0"

            content.style.flexWrap =
              "wrap"

          }

          /*
            MAIN
          */

          if(mainValue !== ""){

            content.appendChild(

              createTextElement({

                value:
                  mainValue,

                config:
                  main,

                padding:
                  METRICS.mainPadding

              })

            )

          }

          /*
            DETAIL
          */

          if(detailValue !== ""){

            content.appendChild(

              createTextElement({

                value:
                  detailValue,

                config:
                  detail,

                padding:
                  METRICS.detailPadding

              })

            )

          }

          td.appendChild(
            content
          )

        }

        tr.appendChild(td)

      }

      tbody.appendChild(tr)

    }
  )

  /*
    Thêm vào DOM để browser thực sự layout.
  */

  document.body.appendChild(
    measurementTable
  )

  /*
    Ép browser layout trước khi đọc.
  */

  const tableRect =
    measurementTable
      .getBoundingClientRect()

  const headerRect =
    headerRow
      .getBoundingClientRect()

  const tableHeight =
    tableRect.height

  const headerHeight =
    headerRect.height

  /*
    Xóa ngay sau khi đo.
  */

  measurementTable.remove()

  return {

    tableHeight,

    headerHeight

  }

}

/* =========================================
CREATE TEXT ELEMENT
========================================= */

function createTextElement({

  value,

  config,

  padding

}){

  const el =
    document.createElement("div")

  el.style.display =
    "block"

  el.style.padding =
    padding

  el.style.boxSizing =
    "border-box"

  el.style.textAlign =
    config?.align || "left"

  el.style.fontFamily =
    METRICS.defaultFont

  el.style.fontSize =
    `${Number(
      config?.fontSize || 12
    )}px`

  el.style.lineHeight =
    String(
      METRICS.lineHeight
    )

  el.style.fontWeight =
    config?.bold
      ? "700"
      : "400"

  el.style.fontStyle =
    config?.italic
      ? "italic"
      : "normal"

  el.style.textDecoration =
    config?.underline
      ? "underline"
      : "none"

  el.style.color =
    config?.color ||
    "#000"

  /*
    Giống div thực tế.
  */

  el.style.whiteSpace =
    "normal"

  el.style.wordBreak =
    "normal"

  el.style.overflowWrap =
    "normal"

  /*
    Dùng textContent thay vì innerHTML.
  */

  el.textContent =
    String(value)

  return el

}

/* =========================================
COLUMN VALUE
========================================= */

function getColumnValue(

  item,

  config,

  fallbackKey

){

  const field =
    config?.field ||
    fallbackKey

  if(
    !field ||
    field === "none"
  ){

    return ""

  }

  return formatValue(

    resolveBindingValue(
      field,
      item
    ),

    field

  )

}

/* =========================================
DISPLAY VALUE RESOLVER
========================================= */

function resolveBindingValue(

  key,

  data = {}

){

  if(!key){

    return ""

  }

  const displayMap = {

    id_customer:
      data.customer_name,

    id_employee:
      data.employee_name,

    id_product:
      data.name,

    id_unit:
      data.unit_name,

    id_warehouse:
      data.warehouse_name

  }

  if(
    displayMap[key] !== undefined
  ){

    return displayMap[key]

  }

  return getBindingValue(
    key,
    data
  )

}

/* =========================================
GET VALUE BY PATH
========================================= */

function getBindingValue(

  path,

  data = {}

){

  if(!path){

    return ""

  }

  const keys =
    String(path).split(".")

  let current =
    data

  for(const key of keys){

    if(current == null){

      return ""

    }

    current =
      current[key]

  }

  return current ?? ""

}

/* =========================================
FORMAT VALUE
========================================= */

function formatValue(

  value,

  key

){

  const moneyFields = [

    "dongia",
    "thanhtien",

    "tongtien",
    "tongthanhtoan",

    "thue",
    "chietkhau",

    "dongiavon",
    "tienvon"

  ]

  if(
    moneyFields.includes(key)
  ){

    return formatMoney(value)

  }

  return value

}

/* =========================================
CLEAN COLUMN KEY
========================================= */

function cleanColumnKey(

  key = ""

){

  return String(key)

    .replace(
      "items.",
      ""
    )

    .replace(
      "document_items.",
      ""
    )

}