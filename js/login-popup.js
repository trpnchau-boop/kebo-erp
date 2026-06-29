import {
  login
}
from "./auth.js"

const overlay =
  document.getElementById(
    "login-overlay"
  )

const popup =
  document.getElementById(
    "login-popup"
  )

/* =========================
OPEN
========================= */

export function openLoginPopup(){

  overlay.hidden = false

  popup.innerHTML = `

    <form
      id="login-form"
      class="login-form"
    >

      <h2>
        Đăng nhập
      </h2>

      <input
        id="login-email"
        type="email"
        placeholder="Email"
        autocomplete="username"
        required
      >

      <input
        id="login-password"
        type="password"
        placeholder="Mật khẩu"
        autocomplete="current-password"
        required
      >

      <div class="login-actions">

        <button
          type="button"
          id="login-cancel"
        >
          Hủy
        </button>

        <button
          type="submit"
        >
          Đăng nhập
        </button>

      </div>

    </form>

  `

  bindEvents()

}

/* =========================
CLOSE
========================= */

export function closeLoginPopup(){

  overlay.hidden = true

  popup.innerHTML = ""

}

/* =========================
EVENTS
========================= */

function bindEvents(){

  const form =
    document.getElementById(
      "login-form"
    )

  const email =
    document.getElementById(
      "login-email"
    )

  const password =
    document.getElementById(
      "login-password"
    )

  document
    .getElementById(
      "login-cancel"
    )
    .onclick =
      closeLoginPopup

  overlay.onclick = e=>{

    if(
      e.target === overlay
    ){

      closeLoginPopup()

    }

  }

  form.onsubmit =
  async e=>{

    e.preventDefault()

    const {

      error

    } = await login(

      email.value.trim(),

      password.value

    )

    if(error){

      console.error(error)  

      alert(
        error.message
      )

      return

    }
    
    closeLoginPopup()
    
    location.reload()

  }

}