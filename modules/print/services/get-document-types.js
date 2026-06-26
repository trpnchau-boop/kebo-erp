import {
  getAll
}
from "/js/crud.js"

export async function getDocumentTypes(){

  return await getAll(
    "set_document_type",
    {
      is_active:true
    }
  )
}