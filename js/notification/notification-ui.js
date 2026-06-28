//notification-ui.js

import {

  getList,

  getUnreadCount,

  remove

}

from "./notification.js"

let root
let bell
let badge
let panel

/* =========================
INIT
========================= */

export function initNotifications(){

  createUI()

  renderNotifications()

  bindEvents()

}

/* =========================
CREATE
========================= */

function createUI(){

  root =

    document.querySelector(

      "#notification-root"

    )

  if(!root){
    return
  }

  root.innerHTML = `

    <button
      class="notification-bell"
      title="Thông báo"
    >

      <i class="bi bi-bell"></i>

      <span
        class="notification-badge"
      ></span>

    </button>

    <div
      class="notification-panel"
    ></div>

  `

  bell =

    root.querySelector(

      ".notification-bell"

    )

  badge =

    root.querySelector(

      ".notification-badge"

    )

  panel =

    root.querySelector(

      ".notification-panel"

    )

}

/* =========================
RENDER
========================= */

export function renderNotifications(){

  if(!panel){
    return
  }

  const list =

    getList()

  const count =

    getUnreadCount()

  badge.textContent =

    count || ""

  badge.style.display =

    count

    ? "flex"

    : "none"

  panel.innerHTML =

    list.length

    ? list

      .map(buildItem)

      .join("")

    :

    `
      <div
        class="notification-empty"
      >
        Không có thông báo
      </div>
    `

}

/* =========================
ITEM
========================= */

function buildItem(item){

  return `

    <div

      class="notification-item"

      data-id="${item.id}"

    >

      <div
        class="notification-title"
      >

        ${item.title}

      </div>

      <div
        class="notification-subtitle"
      >

        ${item.subtitle||""}

      </div>

      <div
        class="notification-status"
      >

        ${item.status}

      </div>

      <button

        class="notification-remove"

        data-id="${item.id}"

      >

        ×

      </button>

    </div>

  `

}

/* =========================
EVENT
========================= */

function bindEvents(){

  bell.addEventListener(

    "click",

    togglePanel

  )

  panel.addEventListener(

    "click",

    onPanelClick

  )

  document.addEventListener(

    "click",

    onDocumentClick

  )

}

/* =========================
TOGGLE
========================= */

function togglePanel(e){

  e.stopPropagation()

  panel.classList.toggle(

    "show"

  )

}

/* =========================
OUTSIDE
========================= */

function onDocumentClick(e){

  if(

    root.contains(

      e.target

    )

  ){

    return

  }

  panel.classList.remove(

    "show"

  )

}

/* =========================
CLICK
========================= */

function onPanelClick(e){

  const removeBtn =

    e.target.closest(

      ".notification-remove"

    )

  if(removeBtn){

    remove(

      removeBtn.dataset.id

    )

    return

  }

  const item =

    e.target.closest(

      ".notification-item"

    )

  if(!item){
    return
  }

  const data =

    getList().find(

      x=>

      String(x.id)

      ===

      String(item.dataset.id)

    )

  if(!data){
    return
  }

  window.dispatchEvent(

    new CustomEvent(

      "notification-click",

      {

        detail:data

      }

    )

  )

  panel.classList.remove(

    "show"

  )

}