//mount/mount-print.js//

import {
  printStore
}
from "/modules/print/core/store.js"

import {
  renderPage
}
from "/modules/print/renderer/render-page.js"

import {
  getDocumentTypes
}
from "/modules/print/services/get-document-types.js"

import {
  createDocument
}
from "/modules/print/models/create-document.js"

import {
  reflowSections
}
from "/modules/print/layout/reflow-sections.js"

/* =========================================================
ENGINES
========================================================= */

import {
  bindMoveEngine
}
from "/modules/print/engine/move-engine.js"

import {
  bindResizeEngine
}
from "/modules/print/engine/resize-engine.js"

import {
  bindSelectEngine
}
from "/modules/print/engine/select-engine.js"

import {
  bindKeyboardEngine
}
from "/modules/print/engine/keyboard-engine.js"

import {
  bindTableResizeEngine
}
from "/modules/print/engine/table-resize-engine.js"

/* =========================================================
PANELS
========================================================= */

import {
  renderPropertyPanel,
}
from "/modules/print/panel/property-panel.js"

import {
  renderBlockToolbar,
  bindBlockToolbar
}
from "/modules/print/panel/block-toolbar.js"

import {
  renderSchemaPanel,
  bindSchemaPanel
}
from "/modules/print/panel/schema-panel.js"

import {
  openPropertySidebar
}
from "/modules/print/panel/open-property-sidebar.js"

/* =========================================================
MOUNT PRINT
========================================================= */

export async function mountPrint({

  root,

  template = null

}){

  const documentTypes =
    await getDocumentTypes()

  if(!root){
    return
  }

if(
  template?.template_json
){

  printStore.setState(
    state=>{

      state.document =
        structuredClone(
          template.template_json
        )
      state.templateId = template.id
      state.selectedIds = []
      state.selectedSectionId = null

    }
  )

}else{

  printStore.setState(
    state=>{

      const document =
        createDocument()

      reflowSections(
        document.sections
      )

      state.document =
        document

      state.templateId = null  
      state.selectedIds = []
      state.selectedSectionId = null

    }
  )

}

  /* =======================================================
  BUILD STATIC APP
  ======================================================= */

  root.innerHTML = `

    <div class="print-app">

      <!-- =====================================
      TOOLBAR
      ====================================== -->

      <div
        class="print-toolbar-wrap"
      >

        ${renderBlockToolbar(
          documentTypes,
          template
        )}

      </div>

      <!-- =====================================
      BODY
      ====================================== -->

      <div
        class="print-body"
      >

        <!-- =================================
        CANVAS
        ================================== -->

        <div
          class="print-canvas-wrap"
        >

          <div
            class="print-canvas"
          ></div>

          <div
            class="print-guide-layer"
          ></div>  

        </div>


        <!-- =================================
        SCHEMA
        ================================== -->

        <div
          class="print-schema"
        ></div>

      </div>

    </div>
  `

  /* =====================================
LOAD TEMPLATE INFO
===================================== */

const nameInput =
  root.querySelector(
    "#print-template-name"
  )

if(
  nameInput &&
  template
){
  nameInput.value =
    template.name || ""
}

  /* =======================================================
  QUERY ROOTS
  ======================================================= */

  const canvasEl =
    root.querySelector(
      ".print-canvas"
    )

  const sidebarEl =
    root.querySelector(
      ".print-sidebar"
    )

  const schemaEl =
    root.querySelector(
      ".print-schema"
    )

  /* =======================================================
  RENDER CANVAS
  ======================================================= */

  function renderCanvas(){

    if(!canvasEl){
      return
    }

    const state =
      printStore.getState()

    canvasEl.innerHTML =

      renderPage(

        state.document,

        state
      )
  }

  /* =======================================================
  RENDER SIDEBAR
  ======================================================= */

  function renderSidebar(){

    if(!sidebarEl){
      return
    }

    const state =
      printStore.getState()

    sidebarEl.innerHTML =

      renderPropertyPanel(
        state
      )
  }

  /* =======================================================
  RENDER SCHEMA
  ======================================================= */

function renderSchema(){

  if(!schemaEl){
    return
  }

  const scrollTop =

    schemaEl.querySelector(
      ".schema-panel"
    )?.scrollTop || 0

  schemaEl.innerHTML =

    renderSchemaPanel()

  schemaEl.querySelector(
    ".schema-panel"
  )?.scrollTo({
    top:scrollTop
  })
}

  /* =======================================================
  MAIN RENDER
  ======================================================= */

function render(){

  renderCanvas()

  renderSchema()
}

  /* =======================================================
  INITIAL RENDER
  ======================================================= */

  render()

  /* =======================================================
  ENGINES
  ======================================================= */

  bindMoveEngine(root)

  bindResizeEngine(root)

  bindSelectEngine(root)

  bindKeyboardEngine()

  bindTableResizeEngine(root)

  /* =======================================================
  PANELS
  ======================================================= */

  bindBlockToolbar(root)

  bindSchemaPanel(root)

  /* =======================================================
  STORE SUBSCRIBE
  ======================================================= */

  printStore.subscribe(()=>{

    render()
  })

}