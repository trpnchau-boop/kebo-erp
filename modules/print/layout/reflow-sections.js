import {
  calcSectionHeight
} from "/modules/print/layout/calc-section-height.js"

import {
  layoutBlocks
} from "/modules/print/layout/layout-blocks.js"

export function reflowSections(

  sections,
  items = []

){

  let currentY = 40

  sections.forEach(section => {

    // 1. Tính lại vị trí các block
    layoutBlocks(
      section,
      items
    )

    // 2. Tính lại chiều cao section
    section.height =
      calcSectionHeight(
        section,
        items
      )

    // 3. Đặt section vào vị trí mới
    section.y =
      currentY

    // 4. Section sau nhường chỗ
    currentY +=
      section.height + 20

  })

  return sections

}