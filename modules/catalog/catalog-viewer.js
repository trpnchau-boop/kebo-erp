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
let raf = 0

function distance(touches){

  const dx =
    touches[0].clientX -
    touches[1].clientX

  const dy =
    touches[0].clientY -
    touches[1].clientY

  return Math.hypot(dx,dy)

}

function clampPosition(){

  if(scale <= 1){

    x = 0
    y = 0

    return

  }

  const rect =
    image.getBoundingClientRect()

  const maxX =
    Math.max(
      0,
      (rect.width - window.innerWidth) / 2
    )

  const maxY =
    Math.max(
      0,
      (rect.height - window.innerHeight) / 2
    )

  x = Math.max(
    -maxX,
    Math.min(
      maxX,
      x
    )
  )

  y = Math.max(
    -maxY,
    Math.min(
      maxY,
      y
    )
  )

}

function updateTransform(){

  if(!image){
    return
  }

  clampPosition()

  image.style.transform =
     `translate3d(${x}px,${y}px,0) scale(${scale})`

}

function requestUpdate(){

  if(raf){
    return
  }

  raf = requestAnimationFrame(()=>{

    raf = 0

    updateTransform()

  })

}

function resetTransform(){

  scale = 1

  x = 0

  y = 0

  updateTransform()

}

function zoom(delta, clientX, clientY){

  const rect =
    image.getBoundingClientRect()

  const ox =
    clientX - rect.left

  const oy =
    clientY - rect.top

  const oldScale =
    scale

  scale = Math.max(
    1,
    Math.min(
      5,
      scale + delta
    )
  )

  const ratio =
    scale / oldScale

  x -=
    (ox - rect.width / 2) *
    (ratio - 1)

  y -=
    (oy - rect.height / 2) *
    (ratio - 1)

  updateTransform()

}

function renderImage(){

  const product =
    currentProducts[currentIndex]

  if(!product){
    return
  }

  const title =
    overlay.querySelector(
      ".catalog-viewer-title"
    )

  const prevBtn =
    overlay.querySelector(
      ".catalog-viewer-prev"
    )

  const nextBtn =
    overlay.querySelector(
      ".catalog-viewer-next"
    )

  title.textContent =
    product.name || ""

  prevBtn.style.visibility =

    currentIndex === 0

      ? "hidden"

      : "visible"

  nextBtn.style.visibility =

    currentIndex ===
    currentProducts.length - 1

      ? "hidden"

      : "visible"

  image.src =
    product.image_url ||
    "/images/no-image.png"

  image.alt =
    product.name || ""

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

    <div class="catalog-viewer-title"></div>

    <button
      class="catalog-viewer-close"
      type="button"
    >
      ×
    </button>

    <button
      class="catalog-viewer-prev"
      type="button"
    >
      ❮
    </button>

    <button
      class="catalog-viewer-next"
      type="button"
    >
      ❯
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

  document.body.appendChild(
    overlay
  )

  renderImage()

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

          :-0.2,

        e.clientX,

        e.clientY  

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

      requestUpdate()

    }

  )

  image.addEventListener(

    "pointerup",

    e=>{

      dragging=false

      if(

        image.hasPointerCapture?.(
          e.pointerId
        )

       ){

          image.releasePointerCapture(
            e.pointerId
          )

        }

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

image.addEventListener(

  "pointercancel",

  e=>{

    dragging = false

    swipe = null

    if(

      image.hasPointerCapture?.(
        e.pointerId
      )

    ){

      image.releasePointerCapture(
        e.pointerId
      )

    }

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

      requestUpdate()

    },

    {

      passive:false

    }

  )

overlay.addEventListener(

  "touchend",

  ()=>{

    if(pinch){

      pinch = null

      return

    }

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

    lastTap = now

  }

)

  overlay
    .querySelector(
      ".catalog-viewer-prev"
    )
    .onclick = prevImage

  overlay
    .querySelector(
      ".catalog-viewer-next"
    )
    .onclick = nextImage

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

  if(raf){

    cancelAnimationFrame(
      raf
    )

    raf = 0

  }

  dragging = false

  pinch = null

  swipe = null

  lastTap = 0

  scale = 1

  x = 0

  y = 0

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