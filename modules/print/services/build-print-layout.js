//services/build-print-layout.js//

import {
  buildPrintFields
}
from "/modules/print/services/build-print-fields.js"

import {
  createPrintBlock
}
from "/modules/print/services/create-print-block.js"

/* =========================================================
BUILD PRINT LAYOUT
========================================================= */

export function buildPrintLayout(
  schema
){

  if(!schema){
    return []
  }

  const printFields =
    buildPrintFields(
      schema
    )

  /* =======================================================
  GROUP SECTIONS
  ======================================================= */

  const sectionMap = {}

  printFields.forEach(field=>{

    const sectionName =

      field.print?.section ||

      "body"

    if(!sectionMap[sectionName]){

      sectionMap[sectionName] = []
    }

    sectionMap[sectionName]
      .push(field)
  })

  /* =======================================================
  BUILD SECTIONS
  ======================================================= */

  const sections = []

  let currentY = 40

  Object.entries(sectionMap)

    .forEach(([sectionName,fields])=>{

      const blocks = []

      let currentX = 40

      let rowY = 40

      let maxHeight = 0

      fields.forEach(field=>{

        const width =

          field.print?.width ||

          field.width ||

          220

        const height =

          field.print?.height ||

          32

        /* =====================================
        AUTO WRAP
        ====================================== */

        if(
          currentX + width > 700
        ){

          currentX = 40

          rowY +=
            maxHeight + 16

          maxHeight = 0
        }

        /* =====================================
        CREATE BLOCK
        ====================================== */

        const block =
          createPrintBlock(

            field,

            {

              x:currentX,

              y:rowY,

              section:sectionName
            }
          )

        if(block){

          blocks.push(block)
        }

        currentX +=
          width + 16

        maxHeight = Math.max(
          maxHeight,
          height
        )
      })

      /* =====================================
      SECTION HEIGHT
      ====================================== */

      const sectionHeight =

        rowY +
        maxHeight +
        40

      /* =====================================
      PUSH SECTION
      ====================================== */

      sections.push({

        id:
          crypto.randomUUID(),

        name:
          sectionName,

        x:40,

        y:currentY,

        width:714,

        height:sectionHeight,

        blocks
      })

      currentY +=
        sectionHeight + 24
    })

  return sections
}

