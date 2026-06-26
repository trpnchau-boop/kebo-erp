//render-page.js//

import {
  renderSection
}
from "/modules/print/renderer/render-section.js"

export function renderPage(
  document,
  state
){

  const page =
    document.page

  const sectionsHtml =

    (document.sections || [])

      .map(section=>{

        return renderSection(
          section,
          state
        )

      })

      .join("")

  return `

    <div
      class="list-page"
    >

      <div

        class="print-page"

        style="

          width:${page.width}px;
          height:${page.height}px;

        "
      >

        ${sectionsHtml}

      </div>

    </div>

  `
}