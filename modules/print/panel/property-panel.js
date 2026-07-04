//property-panel//

import {
  getSelectedBlock
}
from "/modules/print/core/selectors.js"

import {
  setBlockPosition,
  setBlockSize,
  setBlockProps
}
from "/modules/print/core/actions.js"

import {
  printStore
}
from "/modules/print/core/store.js"

/* =========================================================
RENDER PROPERTY PANEL
========================================================= */

export function renderPropertyPanel(
  state
){

  const block =
    getSelectedBlock(state)

  if(!block){

    return `

      <div
        class="print-property-empty"
      >

        No selection

      </div>
    `
  }

  const isText =
    block.type === "text" ||
    block.type === "textarea"

  const isTable =
    block.type === "table"

  const isLine =
    block.type === "line"  

  const selectedColumn =
    isTable
      ? block.props?.columns?.[
          state.selectedColumnIndex
      ]
      : null  

  if(selectedColumn){

    selectedColumn.main ??= {

      field: selectedColumn.key,

      fontSize:12,

      bold:false,

      italic:false,

      underline:false,
  
      color:"#000000",

      align:selectedColumn.align || "left"

    }

    selectedColumn.detail ??= {

      field:"",

      fontSize:11,

      bold:false,

      italic:false,

      underline:false,

      color:"#666666",

      align:"left"

    }

  }

  const isColumnMode =
    isTable &&
    selectedColumn    

  return `

    <div
      class="print-property-panel"
    >

      <!-- =====================
      POSITION
      ====================== -->

      <div class="print-property-group">

        <label>X</label>

        <input
          type="number"
          data-prop="x"
          value="${block.x}"
        >

      </div>

      <div class="print-property-group">

        <label>Y</label>

        <input
          type="number"
          data-prop="y"
          value="${block.y}"
        >

      </div>

      <!-- =====================
      SIZE
      ====================== -->

      <div class="print-property-group">

        <label>Width</label>

        <input
          type="number"
          data-prop="width"
          value="${block.width}"
        >

      </div>

      <div class="print-property-group">

        <label>Height</label>

        <input
          type="number"
          data-prop="height"
          value="${block.height}"
        >

      </div>

      <!-- =====================
      TYPOGRAPHY
      ====================== -->

      ${
        isText

        ? `

          <hr>

          <h4>
            Typography
          </h4>

          <div
            class="print-property-group"
          >

            <label>
              Font Size
            </label>

            <input
              type="number"
              data-prop="fontSize"
              value="${
                block.props?.fontSize || 14
              }"
            >

          </div>

          <div
            class="print-property-group"
          >

            <label>

              <input
                type="checkbox"
                data-prop="bold"
                ${
                  block.props?.bold
                    ? "checked"
                    : ""
                }
              >

              Bold

            </label>

          </div>

          <div
            class="print-property-group"
          >

            <label>

              <input
                type="checkbox"
                data-prop="italic"
                ${
                  block.props?.italic
                    ? "checked"
                    : ""
                }
              >

              Italic

            </label>

          </div>

          <div
            class="print-property-group"
          >

            <label>

              <input
                type="checkbox"
                data-prop="underline"
                ${
                  block.props?.underline
                    ? "checked"
                    : ""
                }
              >

              Underline

            </label>

          </div>

          <div
  class="print-property-group"
>

  <label>
    Align
  </label>

  <select
    data-prop="textAlign"
  >

    <option
      value="left"
      ${
        block.props?.textAlign === "left"
          ? "selected"
          : ""
      }
    >
      Left
    </option>

    <option
      value="center"
      ${
        block.props?.textAlign === "center"
          ? "selected"
          : ""
      }
    >
      Center
    </option>

    <option
      value="right"
      ${
        block.props?.textAlign === "right"
          ? "selected"
          : ""
      }
    >
      Right
    </option>

  </select>

</div>

          <div
            class="print-property-group"
          >

            <label>
              Color
            </label>

            <input
              type="color"
              data-prop="color"
              value="${
                block.props?.color ||
                "#000000"
              }"
            >

          </div>

          <div
            class="print-property-group"
          >

            <label>
              Background
            </label>

            <input
              type="color"
              data-prop="backgroundColor"
              value="${
                block.props?.backgroundColor ||
                "#ffffff"
              }"
            >
          </div>

        `
        : ""
      }

${
  isTable && !isColumnMode

  ? `

    <hr>

    <h4>
      Table Header
    </h4>

    <div
      class="print-property-group"
    >

      <label>
        Font Size
      </label>

      <input
        type="number"
        data-prop="headerFontSize"
        value="${
          block.props?.headerFontSize || 14
        }"
      >

    </div>

    <div
      class="print-property-group"
    >

      <label>

        <input
          type="checkbox"
          data-prop="headerBold"
          ${
            block.props?.headerBold
              ? "checked"
              : ""
          }
        >

        Bold

      </label>

    </div>

    <div
      class="print-property-group"
    >

      <label>

        <input
          type="checkbox"
          data-prop="headerItalic"
          ${
            block.props?.headerItalic
              ? "checked"
              : ""
          }
        >

        Italic

      </label>

    </div>

    <div
      class="print-property-group"
    >

      <label>

        <input
          type="checkbox"
          data-prop="headerUnderline"
          ${
            block.props?.headerUnderline
              ? "checked"
              : ""
          }
        >

        Underline

      </label>

    </div>

    <div
      class="print-property-group"
    >

      <label>
        Header Color
      </label>

      <input
        type="color"
        data-prop="headerColor"
        value="${
          block.props?.headerColor ||
          "#000000"
        }"
      >

    </div>

    <div
      class="print-property-group"
    >

      <label>
        Header Background
      </label>

      <input
        type="color"
        data-prop="headerBackgroundColor"
        value="${
          block.props?.headerBackgroundColor ||
          "#f3f4f6"
        }"
      >

    </div>    `

    : ""
}
${
  isColumnMode

  ? `

    <hr>

    <h4>
      Column
    </h4>

    <!-- =========================
    HEADER
    ========================== -->

    <div class="print-property-group">

      <label>
        Header Text
      </label>

      <input
        type="text"
        data-column-prop="label"
        value="${selectedColumn.label || ""}"
      >

    </div>

    <div class="print-property-group">

      <label>
        Layout
      </label>

      <select
        data-column-prop="layout"
      >

        <option
          value="none"
          ${
            (selectedColumn.layout || "none") === "none"
              ? "selected"
              : ""
          }
        >
          None
        </option>

        <option
          value="row"
          ${
            selectedColumn.layout === "row"
              ? "selected"
              : ""
          }
        >
          Row
        </option>

        <option
          value="column"
          ${
            selectedColumn.layout === "column"
              ? "selected"
              : ""
          }
        >
          Column
        </option>

      </select>

    </div>

    <hr>

    <h4>
      Main Content
    </h4>

    <div class="print-property-group">

      <label>
        Print Field
      </label>

      <input
        type="text"
        data-column-main="field"
        value="${selectedColumn.main.field || ""}"
      >

    </div>

    <div class="print-property-group">

      <label>
        Font Size
      </label>

      <input
        type="number"
        data-column-main="fontSize"
        value="${selectedColumn.main.fontSize}"
      >

    </div>

    <div class="print-property-group">

      <label>

        <input
          type="checkbox"
          data-column-main="bold"
          ${
            selectedColumn.main.bold
              ? "checked"
              : ""
          }
        >

        Bold

      </label>

    </div>

    <div class="print-property-group">

      <label>

        <input
          type="checkbox"
          data-column-main="italic"
          ${
            selectedColumn.main.italic
              ? "checked"
              : ""
          }
        >

        Italic

      </label>

    </div>

    <div class="print-property-group">

      <label>

        <input
          type="checkbox"
          data-column-main="underline"
          ${
            selectedColumn.main.underline
              ? "checked"
              : ""
          }
        >

        Underline

      </label>

    </div>

    <div class="print-property-group">

      <label>
        Align
      </label>

      <select
        data-column-main="align"
      >

        <option
          value="left"
          ${
            selectedColumn.main.align === "left"
              ? "selected"
              : ""
          }
        >
          Left
        </option>

        <option
          value="center"
          ${
            selectedColumn.main.align === "center"
              ? "selected"
              : ""
          }
        >
          Center
        </option>

        <option
          value="right"
          ${
            selectedColumn.main.align === "right"
              ? "selected"
              : ""
          }
        >
          Right
        </option>

      </select>

    </div>

    <div class="print-property-group">

      <label>
        Color
      </label>

      <input
        type="color"
        data-column-main="color"
        value="${selectedColumn.main.color}"
      >

    </div>

    <hr>

    <h4>
      Detail Content
    </h4>

    <div class="print-property-group">

      <label>
        Print Field
      </label>

      <input
        type="text"
        data-column-detail="field"
        value="${selectedColumn.detail.field || ""}"
      >

    </div>

    <div class="print-property-group">

      <label>
        Font Size
      </label>

      <input
        type="number"
        data-column-detail="fontSize"
        value="${selectedColumn.detail.fontSize}"
      >

    </div>

    <div class="print-property-group">

      <label>

        <input
          type="checkbox"
          data-column-detail="bold"
          ${
            selectedColumn.detail.bold
              ? "checked"
              : ""
          }
        >

        Bold

      </label>

    </div>

    <div class="print-property-group">

      <label>

        <input
          type="checkbox"
          data-column-detail="italic"
          ${
            selectedColumn.detail.italic
              ? "checked"
              : ""
          }
        >

        Italic

      </label>

    </div>

    <div class="print-property-group">

      <label>

        <input
          type="checkbox"
          data-column-detail="underline"
          ${
            selectedColumn.detail.underline
              ? "checked"
              : ""
          }
        >

        Underline

      </label>

    </div>

    <div class="print-property-group">

      <label>
        Align
      </label>

      <select
        data-column-detail="align"
      >

        <option
          value="left"
          ${
            selectedColumn.detail.align === "left"
              ? "selected"
              : ""
          }
        >
          Left
        </option>

        <option
          value="center"
          ${
            selectedColumn.detail.align === "center"
              ? "selected"
              : ""
          }
        >
          Center
        </option>

        <option
          value="right"
          ${
            selectedColumn.detail.align === "right"
              ? "selected"
              : ""
          }
        >
          Right
        </option>

      </select>

    </div>

    <div class="print-property-group">

      <label>
        Color
      </label>

      <input
        type="color"
        data-column-detail="color"
        value="${selectedColumn.detail.color}"
      >

    </div>

  `
  : ""
}



      <!-- =====================
      TEXT
      ====================== -->

      ${
        (
        block.type === "text" ||
        block.type === "textarea"
        )

        ? `

          <hr>

          <h4>
            Text
          </h4>

          <div
            class="print-property-group"
          >

            <label>
              Content
            </label>

            <input
              type="text"
              data-prop="text"
              value="${
                block.props?.text || ""
              }"
            >

          </div>

        `

        : ""
      }

      <!-- =====================
      IMAGE
      ====================== -->

      ${
        block.type === "image"

        ? `

          <hr>

          <h4>
            Image
          </h4>

          <div
            class="print-property-group"
          >

            <label>
              Image URL
            </label>

            <input
              type="text"
              data-prop="src"
              value="${
                block.props?.src || ""
              }"
            >

          </div>

        `

        : ""
      }

${
  isLine

  ? `

    <hr>

    <h4>
      Line
    </h4>

    <div class="print-property-group">

      <label>
        Thickness
      </label>

      <input
        type="number"
        min="1"
        max="20"
        data-prop="thickness"
        value="${
          block.props?.thickness || 2
        }"
      >

    </div>

    <div class="print-property-group">

      <label>
        Color
      </label>

      <input
        type="color"
        data-prop="color"
        value="${
          block.props?.color || "#000000"
        }"
      >

    </div>

    <div class="print-property-group">

      <label>
        Style
      </label>

      <select
        data-prop="style"
      >

        <option
          value="solid"
          ${
            (block.props?.style || "solid")
            === "solid"

              ? "selected"
              : ""
          }
        >
          Solid
        </option>

        <option
          value="dashed"
          ${
            block.props?.style === "dashed"
              ? "selected"
              : ""
          }
        >
          Dashed
        </option>

        <option
          value="dotted"
          ${
            block.props?.style === "dotted"
              ? "selected"
              : ""
          }
        >
          Dotted
        </option>

        <option
          value="double"
          ${
            block.props?.style === "double"
              ? "selected"
              : ""
          }
        >
          Double
        </option>

      </select>

    </div>

  `

  : ""
}      

    </div>

  `
}

/* =========================================================
BIND PROPERTY PANEL
========================================================= */

export function bindPropertyPanel(
  root
){

  if(!root){
    return
  }

  root.addEventListener(

    "input",

    event=>{

      const state =
        printStore.getState()

      const block =
        getSelectedBlock(state)

      if(!block){
        return
      }

      /* =====================================
      COLUMN HEADER
      ===================================== */

      const columnPropInput =
        event.target.closest(
          "[data-column-prop]"
        )

      if(columnPropInput){

        if(block.type !== "table"){
          return
        }

        const column =
          block.props?.columns?.[
            state.selectedColumnIndex
          ]

        if(!column){
          return
        }

        const key =
          columnPropInput.dataset.columnProp

        printStore.setState(()=>{

          column[key] =

            columnPropInput.type === "checkbox"

              ? columnPropInput.checked

              : columnPropInput.value

        })

        return
      }

      /* =====================================
      COLUMN MAIN
      ===================================== */

      const mainInput =
        event.target.closest(
          "[data-column-main]"
        )

      if(mainInput){

        if(block.type !== "table"){
          return
        }

        const column =
          block.props?.columns?.[
            state.selectedColumnIndex
          ]

        if(!column){
          return
        }

        column.main ??= {}

        const key =
          mainInput.dataset.columnMain

        printStore.setState(()=>{

          column.main[key] =

            mainInput.type === "checkbox"

              ? mainInput.checked

              : mainInput.value

        })

        return
      }

      /* =====================================
COLUMN DETAIL
===================================== */

const detailInput =
  event.target.closest(
    "[data-column-detail]"
  )

if(detailInput){

  if(block.type !== "table"){
    return
  }

  const column =
    block.props?.columns?.[
      state.selectedColumnIndex
    ]

  if(!column){
    return
  }

  column.detail ??= {}

  const key =
    detailInput.dataset.columnDetail

  printStore.setState(()=>{

    column.detail[key] =

      detailInput.type === "checkbox"

        ? detailInput.checked

        : detailInput.value

  })

  return

}

      /* =====================================
      BLOCK
      ===================================== */

      const input =
        event.target.closest(
          "[data-prop]"
        )

      if(!input){
        return
      }

      const prop =
        input.dataset.prop

      const value =
        input.value

      printStore.setState(state=>{

        /* =====================
        POSITION
        ====================== */

        if(prop === "x"){

          setBlockPosition(

            state,

            block.id,

            Number(value),

            block.y
          )

          return
        }

        if(prop === "y"){

          setBlockPosition(

            state,

            block.id,

            block.x,

            Number(value)
          )

          return
        }

        /* =====================
        SIZE
        ====================== */

        if(prop === "width"){

          setBlockSize(

            state,

            block.id,

            Number(value),

            block.height
          )

          return
        }

        if(prop === "height"){

          setBlockSize(

            state,

            block.id,

            block.width,

            Number(value)
          )

          return
        }

        /* =====================
        OTHER PROPS
        ====================== */

        setBlockProps(

          state,

          block.id,

          {

            [prop]:

              input.type === "checkbox"

                ? input.checked

                : (

                    isNaN(value)

                      ? value

                      : Number(value)

                  )

          }

        )

      })

    }

  )

}
