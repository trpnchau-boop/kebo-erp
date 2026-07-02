//modules/document/actions/delete-document.js//

import {
  renderDocumentTable
}
from "../document-table.js"

import {
  renderInputBar
}
from "../document-input.js"

import {syncInputs}
from "../document-sync-inputs.js"

/* =====================================================
CLEAR DOCUMENT
===================================================== */

export async function clearDocument({

  root,
  schema,
  state

}){

  if(!state){
    return
  }

  /* =========================
  CLEAR STATE
  ========================= */

  Object.keys(state.header).forEach(key=>{
    delete state.header[key]
  })

  Object.assign(state.header,{
    type: schema.meta.code,
    code: `${schema.meta.prefix}...`,
    day: new Date()
      .toISOString()
      .slice(0,10)
  })

  state.items = []
  state.draftRow = {}

  /* =========================
  TABLE
  ========================= */

  await renderDocumentTable(
    root,
    schema,
    state
  )

  /* =========================
  INPUT BAR
  ========================= */

  renderInputBar(
    root,
    schema,
    state
  )

  /* =========================
  HEADER UI
  ========================= */

  await syncInputs({
    schema,
    target: state.header,
    scope: "header"
  })

}

/* =====================================================
DELETE DOCUMENT
===================================================== */

export async function deleteDocument({

  root,
  schema,
  state

}){

  if(
    !confirm(
      "Xóa toàn bộ dữ liệu trên form?"
    )
  ){
    return
  }

  await clearDocument({
    root,
    schema,
    state
  })

}