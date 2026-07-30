const STORAGE_KEY = "catalog-card-width"

const DEFAULT_WIDTH = 210
const MIN_WIDTH = 98
const MAX_WIDTH = 320

let cardWidth =
  Number(
    localStorage.getItem(STORAGE_KEY)
  ) || DEFAULT_WIDTH

let pinch = null
let raf = 0

let zoomSnapshot = null

function clamp(v){

  return Math.max(
    MIN_WIDTH,
    Math.min(
      MAX_WIDTH,
      v
    )
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

function getCardNearPoint(
  root,
  x,
  y
){

  let best = null
  let bestDist = Infinity

  root
    .querySelectorAll(".catalog-card")
    .forEach(card=>{

      const r =
        card.getBoundingClientRect()

      const cx =
        r.left + r.width / 2

      const cy =
        r.top + r.height / 2

      const d =
        Math.hypot(
          cx - x,
          cy - y
        )

      if(d < bestDist){

        bestDist = d
        best = card

      }

    })

  return best

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

const centerX =

  (e.touches[0].clientX +
   e.touches[1].clientX) / 2

const centerY =

  (e.touches[0].clientY +
   e.touches[1].clientY) / 2

pinch = {

  distance:
    distance(e.touches),

  width:
    cardWidth,

  id:

    getCardNearPoint(

      root,

      centerX,

      centerY

    )?.dataset.id

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
const centerX =

  (e.touches[0].clientX +
   e.touches[1].clientX) / 2

const centerY =

  (e.touches[0].clientY +
   e.touches[1].clientY) / 2

      const scale =
        now /
        pinch.distance

      const nextWidth =
        clamp(

          pinch.width *
          scale

        )

      if(raf){

        cancelAnimationFrame(
          raf
        )

      }

      raf = requestAnimationFrame(()=>{

        raf = 0

       cardWidth =
  nextWidth

applyCatalogZoom(root)

const card =

  pinch?.id

    ? root.querySelector(
        `.catalog-card[data-id="${pinch.id}"]`
      )

    : null

if(card){

  const r =
    card.getBoundingClientRect()

  const margin = 40

  if(r.top < margin){

    window.scrollBy({

      top:
        r.top - margin

    })

  }

  else if(

    r.bottom >

    window.innerHeight - margin

  ){

    window.scrollBy({

      top:

        r.bottom -

        window.innerHeight +

        margin

    })

  }

}

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

      cardWidth +=

        e.deltaY > 0

          ? -8

          : 8

      cardWidth =
        clamp(cardWidth)

      applyCatalogZoom(
        root
      )

      saveZoom()

    },

    {
      passive:false
    }

  )

}