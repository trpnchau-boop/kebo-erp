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

    <div class="login-brand">

      <img
        src="/images/logo.webp"
        alt="KEBO ERP"
        class="login-logo"
      >

      <div class="login-name">
        KEBO ERP
      </div>

    </div>

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
        type="submit"
        class="login-submit"
        aria-label="Đăng nhập"  
      ></button>

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

  form.onclick = e=>{

    if(
      e.target.closest("input, button")
    ){
      return
    }

    closeLoginPopup()

  }

  popup.onclick = e=>{

    if(e.target === popup){

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