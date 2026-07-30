const STORAGE_KEY = "catalog-card-width"

const DEFAULT_WIDTH = 210

let cardWidth =
  Number(
    localStorage.getItem(STORAGE_KEY)
  ) || DEFAULT_WIDTH

const BASE_WIDTH = {
  1: 420,
  2: 320,
  3: 210
}
let layout = 3

detectLayout()

let pinch = null
let raf = 0

let zoomSnapshot = null

function getZoom(){

    return cardWidth / BASE_WIDTH[layout]

}

function setZoom(z){

    z = Math.max(
        1,
        Math.min(2,z)
    )

    cardWidth =
        BASE_WIDTH[layout] * z

}

function normalizeZoom(
  zoom,
  layout
){

  while(
    zoom > 2 &&
    layout > 1
  ){

    const width =
      BASE_WIDTH[layout] * zoom

    layout--

    zoom =
      width /
      BASE_WIDTH[layout]

  }

  while(
    zoom < 1 &&
    layout < 3
  ){

    const width =
      BASE_WIDTH[layout] * zoom

    layout++

    zoom =
      width /
      BASE_WIDTH[layout]

  }

  return {
    zoom,
    layout
  }

}

function changeZoom(
  root,
  zoom,
  baseLayout = layout
){

  const result =
    normalizeZoom(
      zoom,
      baseLayout
    )

  layout =
    result.layout

  setZoom(
    result.zoom
  )

  applyCatalogZoom(
    root
  )

}


function saveZoom(){

  localStorage.setItem(
    STORAGE_KEY,
    Math.round(cardWidth)
  )

}

function distance(touches){

  const dx =
    touches[0].clientX -
    touches[1].clientX

  const dy =
    touches[0].clientY -
    touches[1].clientY

  return Math.hypot(
    dx,
    dy
  )

}

export function applyCatalogZoom(root){

  root
    .querySelectorAll(".catalog-grid")
    .forEach(grid=>{

      grid.style.setProperty(
        "--card-width",
        `${cardWidth}px`
      )

    })

}

export function zoomDefault(
  root,
  id
){

  if(cardWidth >= DEFAULT_WIDTH){
    return
  }

  zoomSnapshot = {

    width: cardWidth,

    id

  }

  cardWidth = DEFAULT_WIDTH

  applyCatalogZoom(root)

  saveZoom()

  requestAnimationFrame(()=>{

    root
      .querySelector(
        `.catalog-card[data-id="${id}"]`
      )
      ?.scrollIntoView({

        behavior:"smooth",

        block:"center"

      })

  })

}

export function initCatalogPinch(root){

  applyCatalogZoom(root)

root.addEventListener(

  "touchstart",

  e=>{

    if(e.touches.length !== 2){

      pinch = null
      return

    }

if(zoomSnapshot){

  cardWidth =
    zoomSnapshot.width

  applyCatalogZoom(root)

  saveZoom()

  const id =
    zoomSnapshot.id

  zoomSnapshot = null

  requestAnimationFrame(()=>{

    root
      .querySelector(
        `.catalog-card[data-id="${id}"]`
      )
      ?.scrollIntoView({

        behavior:"smooth",

        block:"center"

      })

  })

  pinch = null

  return

}

    pinch = {

      distance:
        distance(
          e.touches
        ),

      zoom:
        getZoom(),

      layout  
 
    }

  },

  {
    passive:true
  }

)

  root.addEventListener(

    "touchmove",

    e=>{

      if(

        !pinch ||

        e.touches.length !== 2

      ){

        return

      }

      e.preventDefault()

      const now =
        distance(
          e.touches
        )

      const scale =
        now /
        pinch.distance

      let nextZoom =
        pinch.zoom *
        scale


      if(raf){

        cancelAnimationFrame(
          raf
        )

      }

      raf = requestAnimationFrame(()=>{

        raf = 0

        changeZoom(
  root,
  nextZoom,
  pinch.layout
)

      })

    },

    {
      passive:false
    }

  )

  root.addEventListener(

    "touchend",


    ()=>{

      pinch = null

      saveZoom()

    }

  )

  root.addEventListener(

    "touchcancel",

    ()=>{

      pinch = null

      saveZoom()

    }

  )

  root.addEventListener(

    "wheel",

    e=>{

      if(!e.ctrlKey){
        return
      }

      e.preventDefault()

      zoomSnapshot = null

      const delta =
  e.deltaY > 0
    ? -0.08
    : 0.08

changeZoom(
  root,
  getZoom() + delta
)

saveZoom()

    },

    {
      passive:false
    }

  )

}

function detectLayout(){

  if(cardWidth >= BASE_WIDTH[1]){

    layout = 1

  }

  else if(cardWidth >= BASE_WIDTH[2]){

    layout = 2

  }

  else{

    layout = 3

  }

}