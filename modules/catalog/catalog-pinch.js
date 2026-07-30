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


let catalogSnapshot = null
let swipe = null

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

export function restoreSnapshot(

  root,

  callback

){

  if(!catalogSnapshot){
    return false
  }

  const snapshot = catalogSnapshot

  catalogSnapshot = null

  cardWidth = snapshot.width

  applyCatalogZoom(root)

  saveZoom()

  callback?.(snapshot)

  requestAnimationFrame(()=>{

    root
      .querySelector(
        `.catalog-card[data-id="${snapshot.id}"]`
      )
      ?.scrollIntoView({

        behavior:"smooth",

        block:"center"

      })

  })

  return true

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

export function saveSnapshot(state){

  catalogSnapshot = {

    ...state,

    width: cardWidth

  }

}

export function zoomDefault(
    root,
    snapshot
){

  if(cardWidth >= DEFAULT_WIDTH){
    return
  }

  saveSnapshot(snapshot)

  cardWidth = DEFAULT_WIDTH

  applyCatalogZoom(root)

  saveZoom()

  requestAnimationFrame(()=>{

    root
      .querySelector(
        `.catalog-card[data-id="${snapshot.id}"]`
      )
      ?.scrollIntoView({

        behavior:"smooth",

        block:"center"

      })

  })

}

export function initCatalogPinch(root, options = {}){

  applyCatalogZoom(root)

root.addEventListener(

  "touchstart",

  e=>{

    if(e.touches.length === 1){

        const t = e.touches[0]

        swipe = {

            x: t.clientX,

            y: t.clientY

        }

    }

    if(e.touches.length !== 2){

        pinch = null

        return

    }

    if(

      restoreSnapshot(

        root,

        options.restore

      )

    ){

      pinch = null

      return

    }

    pinch = {

      distance:
        distance(e.touches),

      width:
        cardWidth

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
e=>{

    if(

        swipe &&

        e.changedTouches.length

    ){

        const t =
            e.changedTouches[0]

        const dx =
            t.clientX - swipe.x

        const dy =
            t.clientY - swipe.y

        if(

            dx > 80 &&

            Math.abs(dy) < 40

        ){

            restoreSnapshot(
  root,
  options.restore
)

        }

    }

    swipe = null

    pinch = null

    saveZoom()

}

  )

  root.addEventListener(

    "touchcancel",

    ()=>{

      swipe = null
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

      catalogSnapshot = null

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
export function hasSnapshot(){

  return !!catalogSnapshot

}