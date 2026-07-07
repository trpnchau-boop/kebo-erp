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

function getTouchCenter(touches){

  return {

    x:
      (
        touches[0].clientX +
        touches[1].clientX
      ) / 2,

    y:
      (
        touches[0].clientY +
        touches[1].clientY
      ) / 2

  }

}

function getAnchorCard(x,y){

  return document

    .elementFromPoint(
      x,
      y
    )

    ?.closest(
      ".catalog-card"
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

function keepAnchorPosition(root){

  if(!pinch?.anchorId){
    return
  }

  const card =
    root.querySelector(
      `.catalog-card[data-id="${pinch.anchorId}"]`
    )

  if(!card){
    return
  }

  const rect =
    card.getBoundingClientRect()

  const cardCenterY =
    rect.top +
    rect.height / 2

  const deltaY =
    cardCenterY -
    pinch.centerY

  root.scrollTop += deltaY

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

      const center =
        getTouchCenter(
          e.touches
        )


        const anchor =
          getAnchorCard(
            center.x,
            center.y
          )

        pinch = {
          distance:
          distance(
            e.touches
          ),
 
          width:
            cardWidth,

          centerX:
            center.x,

          centerY:
            center.y,

          anchorId:
            anchor?.dataset.id,
  
          anchorName:
            anchor?.dataset.name
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

        keepAnchorPosition(
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

      const rect =
        root.getBoundingClientRect()

      const anchor =
        getAnchorCard(

          rect.left +
          rect.width / 2,

          rect.top +
          rect.height / 2

        )

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