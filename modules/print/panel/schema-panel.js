//panel/schema-panel.js//

import {
  printStore
}
from "/modules/print/core/store.js"

import {
  addBlock
}
from "/modules/print/core/actions.js"

import {
  buildPrintFields
}
from "/modules/print/services/build-print-fields.js"

import {
  createPrintBlock
}
from "/modules/print/services/create-print-block.js"

/* =========================================================
SCHEMA
========================================================= */

import {
  BASE_DOCUMENT
}
from "/modules/document/base-document.js"

import {
  companySchema
}
from "/js/schema/company.js"

/* =========================================================
ALL SCHEMAS
========================================================= */

const SCHEMAS = [

  {
    key:"document",

    label:"Chứng từ",

    schema:
      BASE_DOCUMENT
  },

  {
    key:"company",

    label:"Doanh nghiệp",

    schema:
      companySchema
        .set_company
  }
]

/* =========================================================
GET ADDED FIELD IDS
========================================================= */

function getAddedFieldIds(state){

  const section =

    state.document.sections.find(
      section =>

        section.id ===
        (
          state.selectedLayoutId ||
          state.selectedSectionId
        )
    )

  if(!section){
    return []
  }

  return (section.blocks || [])

    .map(block=>{

      return block.props?.fieldKey
    })

    .filter(Boolean)
}

/* =========================================================
RENDER SCHEMA PANEL
========================================================= */

export function renderSchemaPanel(){

  const state =
    printStore.getState()
  
  const selectedBlock =

    state.document.sections

      .flatMap(
        section => section.blocks || []
      )

      .find(block=>{

        return (
          state.selectedIds || []
        )
        .includes(
          block.id
        )
      })

  const addedFieldIds =
    getAddedFieldIds(state)

  const html =

    SCHEMAS.map(item=>{

      const fields =
        buildPrintFields(
          item.schema,
          item.key
        )

      const fieldsHtml =

        fields.map(field=>{

          if(field.type === "divider"){

            return `
              <div class="schema-group-title">
                ${field.label}
              </div>
            `
          }

          let checked = false

          if(

            selectedBlock &&

            selectedBlock.type ===
            "table"

          ){

            checked =

    (
      selectedBlock
        .props
        ?.columns || []
    )

    .some(column=>{

      return (
        column.key ===
        field.key
      )
    })

}else{

  checked =

    addedFieldIds.includes(
      field.key
    )
}

          return `

            <button
              
              class="
                schema-field-item
                ${
                  checked
                    ? "active"
                    : ""
                }
              "

              data-schema-key="${item.key}"

              data-field-key="${field.key}"
            >

              
              <!-- =========================
              CHECKBOX
              ========================== -->

              <div

                class="
                  matrix-check
                  ${
                    checked
                      ? "state-extra"
                      : "state-none"
                  }
                "
              >

                ${
                  checked
                    ? "✓"
                    : ""
                }

              </div>

              <!-- =========================
              LABEL
              ========================== -->

              <div
                class="schema-field-label"
              >

                ${
                  field.label ||
                  field.key
                }

              </div>

            </button>
          `
        })

        .join("")

      return `

        <div
          class="schema-group"
        >

          <!-- =========================
          HEADER
          ========================== -->

          <div
            class="schema-group-title"
          >

            ${item.label}

          </div>

          <!-- =========================
          FIELDS
          ========================== -->

          <div>

            ${fieldsHtml}

          </div>

        </div>
      `
    })

    .join("")

  return `

    <div
      class="schema-panel"
    >

      <!-- =====================================
      TITLE
      ====================================== -->

      <div
        class="schema-panel-title"
      >

        Print Fields

      </div>

      ${html}

    </div>
  `
}

/* =========================================================
BIND SCHEMA PANEL
========================================================= */

export function bindSchemaPanel(
  root
){

  if(!root){
    return
  }

  root.addEventListener(

    "click",

    event=>{
 
      const fieldButton =
        event.target.closest(
          "[data-field-key]"
        )
 
      if(!fieldButton){
        return
      }

      const schemaKey =

        fieldButton.dataset
          .schemaKey

      const fieldKey =

        fieldButton.dataset
          .fieldKey

      /* =====================================
      FIND SCHEMA
      ====================================== */

      const schemaItem =

        SCHEMAS.find(item=>{

          return (
            item.key ===
            schemaKey
          )
        })

      if(!schemaItem){
        return
      }

      /* =====================================
      FIND FIELD
      ====================================== */

      const fields =
        buildPrintFields(
          schemaItem.schema,
          schemaKey
          
        )

      const field =

        fields.find(item=>{

          return (
            item.key ===
            fieldKey
          )
        })

      if(!field){
        return
      }
      
/* =====================================
TOGGLE BLOCK
===================================== */

printStore.setState(state=>{

  const layoutId =

    state.selectedLayoutId ||

    state.selectedSectionId

  const selectedBlock =

    state.document.sections

      .flatMap(
        section => section.blocks || []
      )

      .find(block=>{

        return (
          state.selectedIds || []
        )
        .includes(
          block.id
        )
      })

  /* ===================================
  TABLE MODE
  ==================================== */

  if(
    selectedBlock &&
    selectedBlock.type === "table"
  ){

    selectedBlock.props ??= {}

    selectedBlock.props.columns ??= []

    const exists =

      selectedBlock.props.columns
        .some(column=>{

          return (
            column.key ===
            field.key
          )
        })

    if(exists){

      selectedBlock.props.columns =

        selectedBlock.props.columns
          .filter(column=>{

            return (
              column.key !==
              field.key
            )
          })

    }else{

selectedBlock.props.columns.push({

  key: field.key,

  label: field.label,

  width:
    field.print?.width || 120,

  layout:"none",  

  align: "left",

  main:{

    field: field.key,

    fontSize:12,

    bold:false,

    italic:false,

    underline:false,

    color:"#000000",

    align:"left"

  },

  detail:{

    field:"",

    fontSize:11,

    bold:false,

    italic:false,

    underline:false,

    color:"#666666",

    align:"left"

  }

})
    }

    return
  }

  /* ===================================
  TEXT MODE
  ==================================== */

  const section =

    state.document.sections.find(
      section =>
      section.id === layoutId
    )

  if(!section){

    alert(
      "Vui lòng chọn layout"
    )

    return
  }

  const existingBlock =

    (section.blocks || [])
      .find(block=>{

      return (

        block.props?.fieldKey ===
        field.key

        &&

        block.props?.schemaKey ===
        schemaKey
      )
      })

  if(existingBlock){

    section.blocks =

      section.blocks
        .filter(block=>{

          return (
            block.id !==
            existingBlock.id
          )
        })

    return
  }

  const block =
    createPrintBlock(
      field
    )

  if(!block){
    return
  }

  block.props ??= {}

  block.props.schemaKey = schemaKey

  const blockCount =

    section.blocks?.length || 0

  block.x =

    40 +
    (
      blockCount % 2
    ) * 260

  block.y =

    40 +
    Math.floor(
      blockCount / 2
    ) * 60

  addBlock(

    state,

    section.id,

    block
  )

})
    }
  )
}
