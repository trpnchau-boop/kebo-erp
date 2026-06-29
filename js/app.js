import {closeSidebarPanel} from "./sidebar-panel.js"

import {
  openTab,
  activateTab
} from "./tabs.js"

import { getSession, logout } from "./auth.js"
import { initERP } from "./init-erp.js"
import { loadPage } from "./router.js"

import {
  openLoginPopup
}
from "./login-popup.js"

const PUBLIC_PAGES = [
  "catalog"
]
/* =========================
TITLE
========================= */

function setPageTitle(title){
  const el = document.getElementById("page-title")
  if(el) el.textContent = title
}

/* =========================
TAB ID
========================= */

function buildTabId(page, params = {}){

  if(page === "stock") return "stock_main"

  if(page === "modu"){
    return "modu_main" // 👈 chặn luôn
  }

  return [
    page,
    params.type || params.table || "",
    params.id || "",
    params.action || ""
  ].filter(Boolean).join("_")

}

/* =========================
OPEN MENU TAB
========================= */

function openMenuTab(el){

  let page = el.dataset.page

  if(page.includes("/")){
    console.error("❌ PAGE BỊ BẨN:", page)
    page = page.split("/")[0] // auto fix
  }

  const params = {...el.dataset}
  delete params.page

  // 👉 tránh module/module
  if(page === "module"){
    delete params.type
    delete params.table
  }

  const title = el.textContent.trim()
  const id = buildTabId(page, params)

  setPageTitle(title)
  openTab(id, title, page, params)
}

/* =========================
HASH PARSER
========================= */

function parseHash(){

  const hash = location.hash.replace("#/","")
  if(!hash) return null

  const p = hash.split("/")

  return {
    page: p[0] || "",
    key: p[1] || "",
    ref: p[2] || "",
    id: p[3] || "",
    action: p[4] || "",
    ids: p[5] || ""
  }
}

/* =========================
SYNC FROM HASH
========================= */

function syncFromHash(){

  const data = parseHash()
  if(!data) return

  const params = {
    type: data.key,
    table: data.key,
    ref: data.ref,
    id: data.id,
    action: data.action,
    ids: data.ids
  }

  const id = buildTabId(data.page, params)

  // nếu tab đã tồn tại → chỉ activate
  if(document.querySelector(`.tab[data-tab="${id}"]`)){
    activateTab(id)
    return
  }

  // lấy title từ menu
  const menuEl = document.querySelector(
    `#sidebar [data-page="${data.page}"][data-table="${data.key}"],
     #sidebar [data-page="${data.page}"][data-type="${data.key}"],
     #sidebar [data-page="${data.page}"]`
  )

  const title = menuEl
    ? menuEl.textContent.trim()
    : data.page

  openTab(id, title, data.page, params)
}


/* =========================
MENU CLICK
========================= */

document.addEventListener("click", e => {

  const menuTitle = e.target.closest("#sidebar .menu-title")
  if(menuTitle){
    menuTitle.parentElement.classList.toggle("open")
    return
  }

  const el = e.target.closest("#sidebar [data-page]")
  if(!el) return

  e.preventDefault()
  e.stopPropagation()

  closeSidebarPanel()
  openMenuTab(el)

})

/* =========================
SIDEBAR TOGGLE
========================= */

const btnToggle =
  document.getElementById(
    "btn-toggle"
  )

if(btnToggle){

  btnToggle.addEventListener(
    "click",
    ()=>{

      const sidebar =
        document.getElementById(
          "sidebar"
        )

      if(!sidebar) return

      /* =========================
      PANEL MODE
      ========================= */

      if(sidebar.classList.contains("panel-mode")){

        closeSidebarPanel()

        if(window.innerWidth > 768){
          sidebar.classList.remove("collapsed")
        
        }
        
        return

      }

      if(window.innerWidth <= 768){

        sidebar.classList.remove("panel-mode")
        sidebar.classList.toggle("mobile-open")

        return

      }

      /* =========================
      MENU COLLAPSE
      ========================= */

      sidebar.classList.toggle(
        "collapsed"
      )

    }
  )

}

/* =========================
SIDEBAR LOGO
========================= */

const sidebarLogo =
  document.querySelector(".sidebar-logo")

if(sidebarLogo){

  sidebarLogo.addEventListener("click", ()=>{

    const sidebar =
      document.getElementById("sidebar")

    if(!sidebar) return

    if(window.innerWidth > 768) return

    // Đang ở panel → quay về menu
    if(sidebar.classList.contains("panel-mode")){

      closeSidebarPanel()

      sidebar.classList.add("mobile-open")

      return

    }

    // Đang ở menu → đóng sidebar
    sidebar.classList.remove("mobile-open")

  })

}

/* =========================
INIT (QUAN TRỌNG NHẤT)
========================= */

window.addEventListener("DOMContentLoaded", async ()=>{

  const session =
    await getSession()

  const btnAuth =
    document.getElementById(
      "btn-auth"
  )  

  /* =========================
  PUBLIC MODE
  ========================= */

  if(!session){

    const page =
      parseHash()?.page

    if(
      page &&
      !PUBLIC_PAGES.includes(page)
    ){

      location.hash = "#/catalog"

    }

    btnAuth.textContent = "";
    btnAuth.classList.remove("logout");

    btnAuth.onclick =
      openLoginPopup

    document.getElementById("sidebar").hidden = true

    document.getElementById("btn-toggle").hidden = true

    document.getElementById("page-title").textContent =
      "KEBO Catalog"

    await loadPage(
      "catalog",
      {},
      document.getElementById("content")
    )

    if(!location.hash){

      location.hash = "#/catalog"

    }

    return
  }

  /* =========================
  ERP MODE
  ========================= */

  document.getElementById("sidebar").hidden = false

  document.getElementById("btn-toggle").hidden = false

  btnAuth.textContent = "";
  btnAuth.classList.add("logout");

  btnAuth.onclick =
    async ()=>{

      await logout()

      location.reload()

    }

  await initERP(session)

  if(location.hash){

    syncFromHash()

  }else{

    setPageTitle("Dashboard")

  }

})
/* =========================
BACK / FORWARD
========================= */

window.addEventListener(
  "hashchange",
  async ()=>{

    if(window.ignoreHashChange)
      return

    const session =
      await getSession()

    if(!session){

      const page =
        parseHash()?.page

      if(
        page &&
        page !== "catalog"
      ){

        location.hash =
          "#/catalog"

        return

      }

      return
    }

    syncFromHash()

  }
)

