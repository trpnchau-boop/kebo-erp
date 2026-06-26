import {
  renderDocumentForm
}
from "./document-form.js"

import {
  renderInputBar
}
from "./document-input.js"

import {
  renderDocumentTable
}
from "./document-table.js"

import {
  renderActions
}
from "./document-render-actions.js"

import {
  bindDocumentActions
}
from "./document-bind-actions.js"

import {
  loadDocument
}
from "./document-load.js"

import {
  initSummaryBar
} from "./document-summary-bar.js"

export async function initDocument(
  root,
  schema,
  route,
){

  const state =
    route.state

  if(!state){

    console.error(
      "initDocument: missing state"
    )

    return
  }

  /* =========================
  SCHEMA
  ========================= */

  state.schema =
    schema

  root._docState =
    state

  state.root = root  

  /* =========================
  ROUTE
  ========================= */

  const id =
    route.id

  /* =========================
  LOAD EDIT
  ========================= */

  if(id){

    await loadDocument(
      id,
      schema,
      state
    )

  }

  /* =========================
  CREATE MODE
  ========================= */

  else{

    state.header = {}
    state.items = []
    state.draftRow = {}

    state.header.type =
      schema.meta.code

    state.header.code =
      `${schema.meta.prefix}...`

    state.header.day =
      new Date()
        .toISOString()
        .slice(0,10)

  }

  /* =========================
  RENDER
  ========================= */

  renderDocumentForm(
    root,
    schema,
    state.header,
    state
  )

  renderActions(
    root,
    schema
  )

  renderInputBar(
    root,
    schema,
    state
  )

  renderDocumentTable(
    root,
    schema,
    state
  )

  initSummaryBar(
    root,
    state
  )

  /* =========================
  ACTION EVENTS
  ========================= */

  bindDocumentActions({
    root,
    schema
  })

}