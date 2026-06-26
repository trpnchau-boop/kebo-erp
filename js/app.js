import {preloadRelations} from "/js/relation-cache.js"
import {closeSidebarPanel} from "./sidebar-panel.js"
import {initKeyboard} from "./keyboard.js"
import { db } from './supabase.js'
import {
  openTab,
  restoreTabs,
  activateTab
} from "./tabs.js"

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

  const { data: { session }, error: sessionError } = await db.auth.getSession()

  if (!session) {
    console.warn("❌ Chưa login → redirect")
    window.location.href = "/login.html"
    return
  }

  // =========================
  // 2. LOAD USER
  // =========================
  window.currentUser = session.user



  // =========================
  // 5. APP INIT
  // =========================
  initKeyboard()

  await preloadRelations()

  await new Promise(r=>setTimeout(r,0))

  await restoreTabs()

  if(document.querySelector("#tabs-bar .tab")){
   
    return
  }

  if(location.hash){
  
    syncFromHash()
    return
  }

  openTab(
    "dashboard_main",
    "Dashboard",
    "dashboard",
    {}
  )

})
/* =========================
BACK / FORWARD
========================= */

window.addEventListener("hashchange",()=>{

  if(window.ignoreHashChange) return

  syncFromHash()

})

