//block-toolbar.js//

import {
  printStore
}
from "/modules/print/core/store.js"

import {
  getSelectedIds
}
from "/modules/print/core/selectors.js"

import {
  addBlock,
  removeBlock
}
from "/modules/print/core/actions.js"

import {
  insertRow,
  updateRow
}
from "/js/crud.js"

import {
  renderDropdownSelect,
  getDropdownValue,
  bindDropdownSelect
}
from "/js/components/dropdown-select.js"

import {
  bindDropdownMenus
}
from "/js/components/dropdown-menu.js"
/* =========================================================
CREATE BLOCK
========================================================= */

function createTextBlock(){

  return {

    id:
      crypto.randomUUID(),

    type:"text",

    x:40,
    y:40,

    width:160,
    height:40,

    props:{

      text:"Text",

      fontSize:14
    }
  }
}

function createImageBlock(){

  return {

    id:
      crypto.randomUUID(),

    type:"image",

    x:40,
    y:40,

    width:180,
    height:120,

    props:{

      src:
        ""
    }
  }
}

function createTableBlock(){

  return {

    id:
      crypto.randomUUID(),

    type:"table",

    x:40,
    y:40,

    width:500,
    height:160,

    props:{

      rowHeight:24,

      columns:[
    {
        key:"stt",
        label:"STT",
        width:60,

        main:{
            field:"stt",

            fontSize:12,
            bold:false,
            italic:false,
            underline:false,

            color:"#000",

            align:"center"
        },

        detail:{
            field:"",

            fontSize:11,
            bold:false,
            italic:false,
            underline:false,

            color:"#666",

            align:"left"
        }
    }
],

      rows:[

        {
          stt:"1"
        }
      ]
    }
  }
}

function createLineBlock(){

  return {

    id: crypto.randomUUID(),

    type:"line",

    x:40,
    y:40,

    width:200,
    height:2,

    props:{

      color:"#000000",

      thickness:2,

      style:"solid"
    }
  }
}
/* =========================================================
RENDER TOOLBAR
========================================================= */

export function renderBlockToolbar(
  types = [],
  template = null
){

  return `

    <div class="print-toolbar">

    <div class="toolbar-left">
      <div class="search-box">
        <input
          id="print-template-name"
          type="text"
          placeholder="Tên mẫu in"
          style="width:180px"
        />

        <button class="search-btn">
        ✏️
        </button>
      </div>

      ${renderDropdownSelect({

        value: template?.type_code || "",

        options:types.map(type=>({
          value:type.code,
          label:type.name
        })),

        field:"type_code",

        className:"print-type-select print-filter",

        emptyText:"Chọn loại"

      })} 
    </div>  
    <div class="toolbar-center">
      <button 
        class="btn-add"
        data-toolbar-action="add-text">
        + Text
      </button>

      <button
        class="btn-add"
        data-toolbar-action="add-image">
        + Image
      </button>

      <button
        class="btn-add"
        data-toolbar-action="add-table" >
        + Table
      </button>

      <button
        class="btn-add"
        data-toolbar-action="add-line">
        + Line
      </button>
    </div>
    <div class="toolbar-right">  
      <button
        id="btn-del"
        class="toolbar-action"
        data-toolbar-action="delete">
        Delete
      </button>
      
      <button
        id="btn-save" 
        class="toolbar-action"
        data-toolbar-action="save"
      >
        Save
      </button>
    </div>
    </div>

  `
}

/* =========================================================
BIND TOOLBAR
========================================================= */

export function bindBlockToolbar(
  root
){

  if(!root){
    return
  }

  bindDropdownMenus(root)
  bindDropdownSelect(root)

  root.addEventListener(

    "click",

    async event=>{

      const button =
        event.target.closest(
          "[data-toolbar-action]"
        )

      if(!button){
        return
      }

      const action =
        button.dataset
          .toolbarAction

      const state =
        printStore.getState()

      const sectionId =

        state.selectedSectionId ||

        state.document.sections?.[0]
          ?.id

      /* =====================================
      ADD TEXT
      ====================================== */

      if(action === "add-text"){

        printStore.setState(state=>{

          addBlock(

            state,

            sectionId,

            createTextBlock()
          )
        })

        return
      }

      /* =====================================
      ADD IMAGE
      ====================================== */

      if(action === "add-image"){

        printStore.setState(state=>{

          addBlock(

            state,

            sectionId,

            createImageBlock()
          )
        })

        return
      }

      /* =====================================
      ADD TABLE
      ====================================== */

      if(action === "add-table"){

        printStore.setState(state=>{

          addBlock(

            state,

            sectionId,

            createTableBlock()
          )
        })

        return
      }

      /* =====================================
      ADD TABLE
      ====================================== */

      if(action === "add-line"){

        printStore.setState(state=>{

          addBlock(

            state,

            sectionId,

            createLineBlock()
          )
        })

        return
      }      

      /* =====================================
      DELETE
      ====================================== */
if(action === "delete"){

  printStore.setState(state=>{

    const selectedIds =
      state.selectedIds || []

    selectedIds.forEach(id=>{

      removeBlock(
        state,
        id
      )

    })

    state.selectedIds = []

  })

  return
}

/* =====================================
SAVE
===================================== */

if(action === "save"){

  const templateName =

    document
      .querySelector(
        "#print-template-name"
      )
      ?.value
      ?.trim()

  if(!templateName){

    alert(
      "Nhập tên mẫu"
    )

    return
  }

  const typeCode =

    getDropdownValue(
      document.querySelector(
        ".print-type-select"
      )
    )

  if(!typeCode){

    alert(
      "Chọn loại chứng từ"
    )

    return
  }

  const state =
    printStore.getState()

  const payload = {

    name:
      templateName,

    type_code:
      typeCode,

    template_json:
      structuredClone(
        state.document
      )

  }

try{

  const templateId =
    state.templateId

  if(templateId){

    await updateRow(
      "print_templates",
      templateId,
      payload
    )

  }else{

    const row =
      await insertRow(
        "print_templates",
        payload
      )

    printStore.setState(state=>{

      state.templateId =
        row.id
    })
  }

  alert(
    "Đã lưu"
  )

}
  catch(error){

    console.error(error)

    alert(
      "Lưu thất bại"
    )

  }

  return
}

    }
  )
}

