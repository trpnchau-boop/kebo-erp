let overlay
let image

/* =========================
INIT
========================= */

function init(){

  if(overlay){
    return
  }

  overlay =
    document.createElement("div")

  overlay.className =
    "image-preview-overlay"

  overlay.innerHTML = `
    <img class="image-preview-img">
  `

  image =
    overlay.querySelector("img")

  document.body.appendChild(
    overlay
  )

  /* click nền */

  overlay.addEventListener(
    "click",
    e=>{

      if(e.target===overlay){

        closeImagePreview()

      }

    }
  )

  /* esc */

  document.addEventListener(
    "keydown",
    e=>{

      if(
        e.key==="Escape"
      ){

        closeImagePreview()

      }

    }
  )

}

/* =========================
OPEN
========================= */

export function openImagePreview(src){

  if(!src){
    return
  }

  init()

  image.src = src

  overlay.classList.add(
    "show"
  )

}

/* =========================
CLOSE
========================= */

export function closeImagePreview(){

  if(!overlay){
    return
  }

  overlay.classList.remove(
    "show"
  )

}