import {
  calcSectionHeight
}
from "/modules/print/layout/calc-section-height.js"

import {
  layoutBlocks
}
from "/modules/print/layout/layout-blocks.js"

export function reflowSections(

  sections,
  itemsCount = 0

){

  let currentY = 40

  sections.forEach(section=>{

    // 1. Tính lại vị trí block
    layoutBlocks(
      section,
      itemsCount
    )

    // 2. Tính lại chiều cao section
    section.height =

      calcSectionHeight(
        section,
        itemsCount
      )

    // 3. Đặt vị trí section
    section.y =
      currentY

    currentY +=
      section.height + 20

  })

}