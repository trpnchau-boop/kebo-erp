//renderer/render-block.js//

import {
  BLOCK_REGISTRY
}
from "/modules/print/blocks/index.js"

export function renderBlock(
  block,
  state
){

  if(!block){
    return ""
  }

  const definition =
    BLOCK_REGISTRY[
      block.type
    ]

  if(!definition){
    return ""
  }

  const selected =

    state.selectedIds
      ?.includes(block.id)

    || false

  return `

    <div

      class="
        print-block
        ${
          selected
            ? "print-block-selected"
            : ""
        }
      "

      data-block-id="${block.id}"

      style="

        left:${block.x}px;
        top:${block.y}px;

        width:${block.width}px;
        height:${block.height}px;

        z-index:${block.zIndex || 1};

        transform:
          rotate(${block.rotate || 0}deg);

        display:${
          block.visible === false
            ? "none"
            : "block"
        };

      "
    >

      <div
        class="print-block-content"
      >

        ${
          definition.render(
            block,
            state
          )
        }

      </div>

      ${
        selected

          ? `

            <div
              class="print-block-selection"
            ></div>

            <div

              class="print-resize-handle"

              data-resize-id="${block.id}"

            ></div>

          `

          : ""

      }

    </div>

  `
}