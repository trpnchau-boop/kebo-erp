import {
  DOCUMENT_TYPES
}
from "./document-types.js"

import {
  initDocument
}
from "./document-init.js"

import {
  createDocState
}
from "./document-state.js"

export async function init(
  route,
  root
){

  const schema =
    DOCUMENT_TYPES[
      route.type
    ] ||
    DOCUMENT_TYPES.SALE

  const state =
    route.state ||
    createDocState()

  state.docType =
    route.type
    ||
    schema.meta.code

  await initDocument(
    root,
    schema,
    {
      ...route,
      state
    },
  )

}