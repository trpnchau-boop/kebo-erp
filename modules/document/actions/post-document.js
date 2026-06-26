import {
  saveDocument
}
from "./save-document.js"

export async function postDocument({
  root,
  schema,
  state
}){

  return await saveDocument({

    root,
    schema,
    state,
    status:"posted"

  })

}