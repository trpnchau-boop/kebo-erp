import {
  loadDocument
}
from "/modules/document/document-load.js"

import {
  createDocState
}
from "/modules/document/document-state.js"

export async function loadPrintData({

  id,
  schema,
  company = {}

}){

  const state =
    createDocState()

  await loadDocument(
    id,
    schema,
    state
  )

  return {

    document:{

      ...state.header,

      company

    },

    items:state.items

  }

}