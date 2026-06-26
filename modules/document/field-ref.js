import {
  editDocument
}
from "/modules/document-list/services/document-edit.js"

/* =========================================================
REF FIELD
========================================================= */

export function createRefField(
  field,
  row = {}
){

  const container =
    document.createElement("div")

  container.className =
    "barcode-link"

  const related =
    row.relatedDocs || []

  const typeMap = {

    SALE:"sale",

    EXPORT:"export",

    INVOICE:"invoice"

  }

  related.forEach(doc=>{

    const a =
      document.createElement("a")

    a.href = "#"

    a.textContent =
      doc.code || doc.id

    a.style.marginRight =
      "8px"

    a.addEventListener(
      "click",
      async e=>{

        e.preventDefault()

        const type =

          typeMap[
            doc.type
          ]

        if(!type){

          console.error(
            "Unknown doc type:",
            doc.type
          )

          return

        }

        await editDocument({

          ids:[doc.id],

          type,

          row:{

            code:doc.code

          }

        })

      }
    )

    container.append(a)

  })

  return container

}