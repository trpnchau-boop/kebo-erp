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

  const hash = location.hash.replace(/^#\//,"")
  if(!hash) return null

  const [page, rest] = hash.split("/")

  if(rest?.startsWith("form?")){

    const qs = rest.slice(5) // bỏ "form?"

    const p = new URLSearchParams(qs)

    return {
      page,
      key: p.get("type") || "",
      ref: p.get("ref") || "",
      id: p.get("id") || "",
      action: p.get("action") || "",
      ids: p.get("ids") || ""
    }
  }

  const parts = hash.split("/")

  return {
    page: parts[0] || "",
    key: parts[1] || "",
    ref: parts[2] || "",
    id: parts[3] || "",
    action: parts[4] || "",
    ids: parts[5] || ""
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

    scheduleLogoFlip()

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

  scheduleLogoFlip()

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

/* =========================
LOGO FLIP
========================= */

function scheduleLogoFlip(){

  const logo =
    document.querySelector(".sidebar-logo-img")

  if(!logo) return

  // 20 ~ 80 giây
  const delay =
    20000 + Math.random() * 60000

  setTimeout(()=>{

    // số lần lắc: 1 ~ 3
    const count =
      Math.floor(Math.random() * 3) + 1

    playFlip(logo, count)

  }, delay)

}

function playFlip(
  logo,
  remain
){

  logo.classList.remove("flip")
  void logo.offsetWidth
  logo.classList.add("flip")

  setTimeout(()=>{

    logo.classList.remove("flip")

    if(remain > 1){

      // nghỉ ngắn rồi lắc tiếp
      setTimeout(()=>{

        playFlip(
          logo,
          remain - 1
        )

      },300 + Math.random() * 500)

    }else{

      // xong chu kỳ
      scheduleLogoFlip()

    }

  },800)

}

/* =========================
ROW HIGHLIGHT
========================= */

let activeRow = null;

document.addEventListener("pointerover", e => {

  const row = e.target.closest(
    "tr,.table-row,[data-row]"
  );

  if(!row) return;

  if(activeRow && activeRow !== row){
    activeRow.classList.remove("row-active");
  }

  activeRow = row;
  activeRow.classList.add("row-active");

});

document.addEventListener("pointerdown", e => {

  const row = e.target.closest(
    "tr,.table-row,[data-row]"
  );

  if(!row) return;

  activeRow?.classList.remove("row-active");

  activeRow = row;
  activeRow.classList.add("row-active");

});