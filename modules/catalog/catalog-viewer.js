let overlay = null
let image = null

let currentProducts = []
let currentIndex = 0

let scale = 1
let x = 0
let y = 0

let dragging = false
let startX = 0
let startY = 0

let pinch = null
let swipe = null
let lastTap = 0

function distance(touches){

  const dx =
    touches[0].clientX -
    touches[1].clientX

  const dy =
    touches[0].clientY -
    touches[1].clientY

  return Math.hypot(dx,dy)

}

function updateTransform(){

  if(!image){
    return
  }

  image.style.transform =
    `translate(${x}px,${y}px) scale(${scale})`

}

function resetTransform(){

  scale = 1

  x = 0

  y = 0

  updateTransform()

}

function zoom(delta){

  scale = Math.max(
    1,
    Math.min(
      5,
      scale + delta
    )
  )

  updateTransform()

}

function renderImage(){

  const product =
    currentProducts[currentIndex]

  if(!product){
    return
  }

  image.src =
    product.image

  resetTransform()

}

function nextImage(){

  if(
    currentIndex >=
    currentProducts.length-1
  ){
    return
  }

  currentIndex++

  renderImage()

}

function prevImage(){

  if(
    currentIndex <= 0
  ){
    return
  }

  currentIndex--

  renderImage()

}

export function openCatalogViewer({

  products,

  productId

}){

  closeCatalogViewer()

  currentProducts = products

  currentIndex =

    products.findIndex(

      p =>

        Number(p.id)

        ===

        Number(productId)

    )

  if(currentIndex < 0){
    return
  }

  overlay =
    document.createElement("div")

  overlay.className =
    "catalog-viewer"

  overlay.innerHTML = `

    <button
      class="catalog-viewer-close"
      type="button"
    >
      ×
    </button>

    <img
      class="catalog-viewer-image"
      draggable="false"
    >

  `

  image =
    overlay.querySelector(
      ".catalog-viewer-image"
    )

  renderImage()

  document.body.appendChild(
    overlay
  )

  document.body.style.overflow =
    "hidden"

  overlay.addEventListener(
    "click",
    e=>{

      if(

        e.target===overlay ||

        e.target.classList.contains(
          "catalog-viewer-close"
        )

      ){

        closeCatalogViewer()

      }

    }
  )

  overlay.addEventListener(

    "wheel",

    e=>{

      e.preventDefault()

      zoom(

        e.deltaY<0

          ?0.2

          :-0.2

      )

    },

    {

      passive:false

    }

  )

  image.addEventListener(

    "dblclick",

    ()=>{

      if(scale===1){

        scale=2

      }else{

        resetTransform()

      }

      updateTransform()

    }

  )

  image.addEventListener(

    "pointerdown",

    e=>{

      swipe={

        x:e.clientX,

        y:e.clientY

      }

      if(scale===1){
        return
      }

      dragging=true

      startX=e.clientX-x

      startY=e.clientY-y

      image.setPointerCapture(
        e.pointerId
      )

    }

  )

  image.addEventListener(

    "pointermove",

    e=>{

      if(!dragging){
        return
      }

      x =
        e.clientX-startX

      y =
        e.clientY-startY

      updateTransform()

    }

  )

  image.addEventListener(

    "pointerup",

    e=>{

      dragging=false

      if(!swipe){
        return
      }

      const dx =
        e.clientX-swipe.x

      const dy =
        e.clientY-swipe.y

      if(

        scale===1 &&

        Math.abs(dy)<60

      ){

        if(dx>80){

          prevImage()

        }

        if(dx<-80){

          nextImage()

        }

      }

      swipe=null

    }

  )

  overlay.addEventListener(

    "touchstart",

    e=>{

      if(e.touches.length!==2){

        pinch=null

        return

      }

      pinch={

        distance:
          distance(
            e.touches
          ),

        scale

      }

    },

    {

      passive:true

    }

  )

  overlay.addEventListener(

    "touchmove",

    e=>{

      if(

        !pinch ||

        e.touches.length!==2

      ){
        return
      }

      e.preventDefault()

      scale =

        Math.max(

          1,

          Math.min(

            5,

            pinch.scale *

            distance(e.touches)

            /

            pinch.distance

          )

        )

      updateTransform()

    },

    {

      passive:false

    }

  )

  overlay.addEventListener(

    "touchend",

    ()=>{

      const now =
        Date.now()

      if(

        now-lastTap<300

      ){

        if(scale===1){

          scale=2

        }else{

          resetTransform()

        }

        updateTransform()

      }

      lastTap=now

    }

  )

  window.addEventListener(

    "keydown",

    onKeyDown

  )

}

function onKeyDown(e){

  if(e.key==="Escape"){

    closeCatalogViewer()

  }

  if(e.key==="ArrowRight"){

    nextImage()

  }

  if(e.key==="ArrowLeft"){

    prevImage()

  }

}

export function closeCatalogViewer(){

  if(!overlay){
    return
  }

  overlay.remove()

  overlay = null

  image = null

  currentProducts = []

  currentIndex = 0

  document.body.style.overflow=""

  window.removeEventListener(

    "keydown",

    onKeyDown

  )

}