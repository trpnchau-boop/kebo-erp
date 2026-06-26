import {
  renderBlock
}
from "/modules/print/renderer/render-block.js"

export function renderSection(

  section,
  state

){

  const selected =

   
      state.selectedSectionId === 
      section.id

  const borderColor =

  section.type === "header"
    ? "#2563eb"

    : section.type === "body"
    ? "#16a34a"

    : section.type === "footer"
    ? "#ea580c"

    : "#d1d5db"    

  const blocksHtml =

    (section.blocks || [])

      .map(block=>{

        return renderBlock(
          block,
          state
        )
      })

      .join("")

  return `

    <div

      class="print-section"

      data-section-id="${section.id}"

      data-section-type="${section.type}"

      style="

        position:absolute;

        left:${section.x}px;
        top:${section.y}px;

        width:${section.width}px;
        height:${section.height}px;

        border:${
          selected
            ? `2px solid ${borderColor}`
            : `2px dashed ${borderColor}`
        };

      "
    >

      <div

        class="print-section-label"

      >

        ${section.name}

      </div>

      ${blocksHtml}

    </div>
  `

}