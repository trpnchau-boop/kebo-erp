export function createGuide(){

  const guide =
    document.createElement("div")

  guide.style.position =
    "fixed"

  guide.style.background =
    "#3b82f6"

  guide.style.pointerEvents =
    "none"

  guide.style.zIndex =
    "99999"

  guide.style.display =
    "none"

  return guide
}

export function hideGuides(
  verticalGuide,
  horizontalGuide
){

  if(verticalGuide){
    verticalGuide.style.display =
      "none"
  }

  if(horizontalGuide){
    horizontalGuide.style.display =
      "none"
  }
}

export function showVerticalGuide(
  guide,
  x
){

  if(!guide){
    return
  }

  guide.style.display =
    "block"

  guide.style.left =
    `${x}px`

  guide.style.top =
    "0"

  guide.style.bottom =
    "0"

  guide.style.width =
    "1px"
}

export function showHorizontalGuide(
  guide,
  y
){

  if(!guide){
    return
  }

  guide.style.display =
    "block"

  guide.style.top =
    `${y}px`

  guide.style.left =
    "0"

  guide.style.right =
    "0"

  guide.style.height =
    "1px"
}

export function removeGuides(
  verticalGuide,
  horizontalGuide
){

  verticalGuide?.remove()
  horizontalGuide?.remove()
}