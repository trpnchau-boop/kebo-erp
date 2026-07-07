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

  if(
    cardWidth >= DEFAULT_WIDTH
  ){
    return
  }

  cardWidth =
    DEFAULT_WIDTH

  applyCatalogZoom(root)

  saveZoom()

  requestAnimationFrame(()=>{

    const card =
      root.querySelector(
        `.catalog-card[data-id="${id}"]`
      )

    if(!card){
      return
    }

    card.scrollIntoView({

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

        pinch = {

          distance:
            distance(
              e.touches
            ),
 
            width:
              cardWidth,

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

        applyCatalogZoom(
          root
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