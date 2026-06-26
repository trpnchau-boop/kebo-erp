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
  isTable

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

    </div>

          ${
  selectedColumn

  ? `

    <hr>

    <h4>
      Column
    </h4>

    <div
      class="print-property-group"
    >

      <label>
        Header Text
      </label>

      <input
        type="text"
        data-column-prop="label"
        value="${
          selectedColumn.label || ""
        }"
      >

    </div>

    <div
      class="print-property-group"
    >

      <label>
        Align
      </label>

      <select
        data-column-prop="align"
      >

        <option
          value="left"
          ${
            (selectedColumn.align || "left")
            === "left"

              ? "selected"
              : ""
          }
        >
          Left
        </option>

        <option
          value="center"
          ${
            selectedColumn.align
            === "center"

              ? "selected"
              : ""
          }
        >
          Center
        </option>

        <option
          value="right"
          ${
            selectedColumn.align
            === "right"

              ? "selected"
              : ""
          }
        >
          Right
        </option>

      </select>

    </div>

  `
  : ""
}

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

      const columnInput =

  event.target.closest(
    "[data-column-prop]"
  )

if(columnInput){

  const state =
    printStore.getState()

  const block =
    getSelectedBlock(state)

  if(
    !block ||
    block.type !== "table"
  ){
    return
  }

  const column =

    block.props.columns[
      state.selectedColumnIndex
    ]

  if(!column){
    return
  }

  printStore.setState(()=>{

    column[
      columnInput.dataset.columnProp
    ] = columnInput.value

  })

  return
}

      const input =
        event.target.closest(
          "[data-prop]"
        )

      if(!input){
        return
      }

      const state =
        printStore.getState()

      const block =
        getSelectedBlock(state)

      if(!block){
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

        if( input.type === "checkbox"){

          setBlockProps(

            state,

             block.id,

            {
              [prop]:
              input.checked
            }
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

              isNaN(value)
                ? value
                : Number(value)
          }
        )
      })
    }
  )
}

