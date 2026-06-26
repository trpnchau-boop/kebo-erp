import {
  calcSectionHeight
}
from "/modules/print/layout/calc-section-height.js"

export function reflowSections(

  sections,
  itemsCount = 0

){

  let currentY = 40

  sections.forEach(section=>{

    section.height =

      calcSectionHeight(
        section,
        itemsCount
      )

    section.y =
      currentY

    currentY +=
      section.height + 20
  })

}