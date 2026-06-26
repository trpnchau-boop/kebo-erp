import {
  isVisible
}
from "./document-visible.js"

import {
  getDocType
}
from "./document-get-doc-type.js"

export function getVisibleActions(
  schema
){

  const docType =
    getDocType(schema)

  return (schema.actions || [])

  .filter(action=>{

    if(

      action.key === "split"

      &&

      !schema.capabilities?.split

    ){

      return false

    }

    return isVisible(
      action,
      null,
      docType
    )

  })

}