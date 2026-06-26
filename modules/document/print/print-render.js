import {
  formatMoney
}
from "/js/core/format.js"

function shouldHideBlock(
  block,
  document
){

  const bind =
    block.props?.bind

  const tongTien =
    Number(document.tongtien || 0)

  const thanhToan =
    Number(document.tongthanhtoan || 0)

  const thue =
    Number(document.thue || 0)

  const chietKhau =
    Number(document.chietkhau || 0)

  if(
    bind === "tongtien" &&
    tongTien === thanhToan &&
    thue === 0 &&
    chietKhau === 0
  ){
    return true
  }

  if(
    bind === "thue" &&
    thue === 0
  ){
    return true
  }

  if(
    bind === "chietkhau" &&
    chietKhau === 0
  ){

    return true
  }

  return false
}
/* =========================================================
RENDER BLOCKS
========================================================= */

export function renderBlocks({

  blocks = [],
  document = {},
  company = {},
  items = []

}){


const renderList =

  blocks.filter(
    block =>
      !shouldHideBlock(
        block,
        document
      )
  )

  reflowBlocks(renderList)

  return renderList
    .map(block=>
      renderBlock({
        block,
        document,
        company,
        items
      })
    )
    .join("")
}

function reflowBlocks(
  blocks = []
){

  const totalBlocks =

    blocks.filter(
      block =>
        [
          "tongtien",
          "thue",
          "chietkhau",
          "tongthanhtoan"
        ].includes(
          block.props?.bind
        )
    )

  if(!totalBlocks.length){
    return
  }

  totalBlocks.sort(
    (a,b)=>
      (a.y || 0) -
      (b.y || 0)
  )

  const startY = 0

  totalBlocks.forEach(
    (block,index)=>{

      block.y =
        startY +
        index * 32

    }
  )

}

/* =========================================================
RENDER BLOCK
========================================================= */

function renderBlock({

  block,

  document,

  company,

  items

}){

  if(!block){

    return ""
  }

  /* =======================================================
  TEXT
  ======================================================= */

  if(

    block.type === "text" ||

    block.type === "textarea"

  ){

    const rawText =

      block.props?.text || ""

    const bind =

      block.props?.bind ||

      block.props?.binding ||

      block.props?.fieldKey

    const schemaKey =

      block.props?.schemaKey ||

      "document"

    let sourceData =

      document

    if(

      schemaKey === "company"

    ){

      sourceData =

        company || {}
    }

    let value =

      resolveBindingValue(
        bind,
        sourceData
      )
    value =

      formatValue(
        value,
        bind
      )

    const tongTien =
      Number(document.tongtien || 0)

    const thanhToan =
      Number(document.tongthanhtoan || 0)

    const thue =
      Number(document.thue || 0)

    const chietKhau =
      Number(document.chietkhau || 0)  

    const text =
      value
        ? `${rawText}: ${value}`
        : rawText

    if(
      bind &&
        (
          value === null ||
          value === undefined ||
          value === ""
        )

    ){
      return ""
    }

    /* ======================================= 
    AUTO HIDE TOTAL BLOCKS
    ======================================= */

    if(
      bind === "tongtien" &&
      tongTien === thanhToan &&
      thue === 0 &&
      chietKhau === 0
    ){
      return ""
    }

    if(
      bind === "thue" &&
      thue === 0
    ){
      return ""
    }

    if(
      bind === "chietkhau" &&
      chietKhau === 0
    ){
      return ""
    }

    const fontSize =

      block.props?.fontSize ??
 
      block.style?.fontSize ??

      14

    const color =

      block.props?.color ??

      block.style?.color ??

      "#000"

    const textAlign =

      block.props?.textAlign ??

      block.style?.align ??

      "left"

    const fontWeight =

      block.props?.bold

        ? 700

        : (

            block.style?.fontWeight ||

            400

          )    

 return `

      <div

        class="print-block"

        style="
          position:absolute;

          left:${block.x}px;
          top:${block.y}px;

          width:${block.width}px;

          height:${block.height}px;

          font-size:${fontSize}px;

          font-weight:${fontWeight};

          color:${color};

          text-align:${textAlign};

          display:flex;

          align-items:center;

          justify-content:${
            textAlign === "center"
              ? "center"
              : textAlign === "right"
              ? "flex-end"
              : "flex-start"
          };

          padding:4px;

          box-sizing:border-box;

          overflow:hidden;

        "
      >

        ${text}

      </div>
    `
  }

  /* =======================================================
  IMAGE
  ======================================================= */

  if(block.type === "image"){

    return `

      <img

        class="print-block"

        src="${
          block.props?.src || ""
        }"

        style="
          position:absolute;

          left:${block.x}px;
          top:${block.y}px;

          width:${block.width}px;
          height:${block.height}px;

          object-fit:contain;
        "
      >
    `
  }

  /* =======================================================
  TABLE
  ======================================================= */

  if(block.type === "table"){

    const columns =
      block.props?.columns || []

    return `

      <table

        class="print-table"

        style="     
          position:absolute;

          left:${block.x}px;
          top:${block.y}px;

          width:${block.width}px;

          border-collapse:collapse;

          font-size:${
            block.style?.fontSize || 12
          }px;
        "
      >

        <tbody>

          <tr>

            ${
              columns.map(col=>`

                <th
                  style="
                    border:1px solid #000;
                    padding:4px;
                    height:${block.props?.rowHeight || 22}px;
                    text-align:
                      ${col.align || "left"};
                    background:${
                      block.props?.headerBackgroundColor ||
                      block.style?.headerBackground ||
                      "#eee"
                    };
                  "
                >

                  ${
                    col.label ||
                    cleanColumnKey(
                      col.key
                    )
                  }

                </th>

              `).join("")
            }

          </tr>


          ${
            items.map((item,index)=>{

              return `

                <tr
                  style="
                    height:${block.props?.rowHeight || 22}px;
                  "                
                >

                  ${
                    columns.map(col=>{

                      const cleanKey =

                        cleanColumnKey(
                          col.key
                        )

                      let value = ""

                      if(
                        cleanKey === "stt"
                      ){

                        value =
                          index + 1

                      }else{

                        value =
                          resolveBindingValue(
                            cleanKey,
                            item
                          )
                        value =
                          formatValue(
                            value,
                            cleanKey
                          )  
                      }

                      if(
                        cleanKey === "qty"
                      ){
                        
                        const qty =
                          Number(item.qty || 0)
                          
                        const tongsoluong =
                          Number(
                            item.tongsoluong || 0
                          )

                      if(
                        qty === tongsoluong
                      ){
                        value = ""
                      }
                    }

                      return `

                        <td
                          style="
                            border:1px solid #000;
                            padding:4px;
                            text-align:
                              ${col.align || "left"};
                          "
                        >

                          ${
                            value ?? ""
                          }

                        </td>
                      `
                    }).join("")
                  }

                </tr>
              `
            }).join("")
          }

        </tbody>

      </table>
    `
  }

/* =======================================================
LINE
======================================================= */

if(block.type === "line"){

  const thickness =

    block.props?.thickness || 2

  const color =

    block.props?.color || "#000000"

  const style =

    block.props?.style || "solid"

  return `

    <div

      class="print-line"

      style="
        position:absolute;

        left:${block.x}px;
        top:${block.y}px;

        width:${block.width}px;

        border-top:
          ${thickness}px
          ${style}
          ${color};

        box-sizing:border-box;
      "

    ></div>

  `
}  

  return ""
}

/* =========================================================
DISPLAY VALUE RESOLVER
========================================================= */

function resolveBindingValue(

  key,

  data = {}

){

  if(!key){

    return ""
  }

  /* =======================================================
  SPECIAL DISPLAY MAP
  ======================================================= */

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

  /* =======================================================
  NESTED PATH
  ======================================================= */

  return getBindingValue(
    key,
    data
  )
}

/* =========================================================
CLEAN COLUMN KEY
========================================================= */

function cleanColumnKey(

  key = ""

){

  return String(key)
    .replace("items.","")
    .trim()
}

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

/* =========================================================
GET VALUE BY PATH
========================================================= */

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

/* =========================================================
VARIABLES
========================================================= */

function replaceVariables(

  text = "",

  data = {}

){

  return String(text)

    .replace(

      /\[(.*?)\]/g,

      (_,key)=>

        resolveBindingValue(
          key.trim(),
          data
        ) ?? ""
    )

    .replace(

      /\{\{(.*?)\}\}/g,

      (_,key)=>

        resolveBindingValue(
          key.trim(),
          data
        ) ?? ""
    )
}