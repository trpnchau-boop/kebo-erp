let overlay
let text

export function showProgress(title = "Đang xử lý..."){

  if(!overlay){

    overlay = document.createElement("div")
    overlay.className = "progress-overlay"

    overlay.innerHTML = `
      <div class="progress-box">

        <div class="progress-spinner"></div>

        <div class="progress-title"></div>

        <div class="progress-status"></div>

      </div>
    `

    document.body.appendChild(overlay)

    text =
      overlay.querySelector(
        ".progress-status"
      )

  }

  overlay.querySelector(
    ".progress-title"
  ).textContent = title

  text.textContent = ""

  overlay.hidden = false

}

export function updateProgress(
  current,
  total
){

  text.textContent =
    `${current} / ${total}`

}

export function hideProgress(){

  if(overlay){

    overlay.hidden = true

  }

}