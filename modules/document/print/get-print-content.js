// modules/document/print/get-print-content.js

import {
  renderBlocks
}
from "/modules/document/print/print-render.js"

import {
  calcSectionHeight
}
from "/modules/print/layout/calc-section-height.js"

import {
  reflowSections
} from "/modules/print/layout/reflow-sections.js"

export function getPrintContent({

  template,
  document,
  items = []

}){

  const company =
    document?.company || {}

  const sections =
    structuredClone(
      template
        ?.template_json
        ?.sections || []
    )

  reflowSections(
    sections,
    items
  )

  return sections

    .map(section=>{

      const height =

        calcSectionHeight(
          section,
          items
        )

      const blocks =

        (section.blocks || [])

          .map(block=>({

            ...block,

            x:
              (section.x || 0) +
              (block.x || 0),

            y:
              block.y || 0

          }))

return `

  <div

    class="print-section"

    style="
      position:relative;

      width:${section.width || 714}px;
      height:${height}px;
    "

  >

    ${

      renderBlocks({

        blocks,

        document,

        company,

        items

      })

    }

  </div>

`

    })

    .join("")

}