import {
  openSidebarPanel,
  closeSidebarPanel
} from "../../js/sidebar-panel.js"

import { init } from "./form.js"
import { schema } from "/js/schema/index.js"

/* =========================
HELPER
========================= */

function getPanel(){
  return document.getElementById("sidebar-panel")
}

function $id(id){
  return getPanel()?.querySelector(`#${id}`)
}

async function loadHtml(url){
  const res = await fetch(url)

  if(!res.ok){
    throw new Error("Không tải được: " + url)
  }

  return await res.text()
}

/* =========================
MAIN
========================= */

export async function openFormSidebar(params = {}){

  let {
    table = "",
    id = null,
    bulk = false,
    ids = [],
    onSave = null
  } = params

  try{

    /* =========================
    RESOLVE FORM TABLE (QUAN TRỌNG NHẤT)
    ========================= */
    const formTable =
      schema[table]?.formTable || table

    table = formTable

    /* =========================
    OPEN PANEL
    ========================= */
    openSidebarPanel("Đang tải...")

    const panel = getPanel()

    if(!panel){
      throw new Error("Không tìm thấy #sidebar-panel")
    }

    /* =========================
    LOAD HTML
    ========================= */
    const html = await loadHtml(
      "modules/form/form.html"
    )

    panel.innerHTML = html

    /* =========================
    INIT FORM
    ========================= */
    await init({
      table,
      id,
      bulk,
      ids
    })
    window.__sidebarOnSave =
      onSave

    /* =========================
    BIND CANCEL
    ========================= */
    $id("btn-cancel")
      ?.addEventListener("click", closeSidebarPanel)

  }catch(err){

    const panel = getPanel()

    if(panel){
      panel.innerHTML = `
        <div style="padding:16px;color:#c00">
          Không mở được form
        </div>
      `
    }

  }

}