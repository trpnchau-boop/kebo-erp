import { getAll } from "/js/crud.js"

import {
  showUngroupedTables,
  showAllTables,
  showGroupTables
} from "./module-filter.js"

import {
  renderTable
} from "./module-render.js"

import {
  bindFilter,
  bindSave,
} from "./module-events.js"

import {
  bindDropdownMenus
} from "/js/components/dropdown-menu.js"

import {
  bindDropdownSelect
} from "/js/components/dropdown-select.js"

import {
  bindGroupToggle,
  bindGroupCRUD,
  bindGroupFilter
} from "./group-events.js"

import { renderGroupOnly } from "./group-render.js"

import { openSidebarPanel } from "/js/sidebar-panel.js"

export async function init(params, root){

  async function load(){

    const groups = await getAll("module_groups")
    const tables = await getAll("table_modules")

    // render main
    renderTable(root, tables, groups)
    showUngroupedTables()

    bindFilter(root)
    bindSave(root)
    bindDropdownMenus()
    bindDropdownSelect()

    bindOpenGroup(root, groups, tables)
  }

  await load()

  // realtime sync
  const reload = () => load()

  window.addEventListener(
    "module_groups_changed",
    reload
  )

  window.addEventListener(
    "table_modules_changed",
    reload
  )

  // cleanup
  root._cleanup = () => {

    window.removeEventListener(
      "module_groups_changed",
      reload
    )

    window.removeEventListener(
      "table_modules_changed",
      reload
    )
  }
}

function bindOpenGroup(root, groups, tables){

  const btnAll = root.querySelector("#btn-show-all")

  if(btnAll){

    btnAll.onclick = () => {

    showAllTables()
  }
}

  const btn = root.querySelector("#btn-edit-group")

  if(!btn){
    console.warn("❌ Không có btn-edit-group")
    return
  }

  btn.onclick = async () => {

    openSidebarPanel("Nhóm modules")

    const panel = document.getElementById("sidebar-panel")

    if(!panel){
      console.warn("❌ Không có sidebar-panel")
      return
    }

    try{

      const res = await fetch("/modules/module/group.html")

      if(!res.ok){
        throw new Error("Không load được group.html")
      }

      const html = await res.text()

      if(panel._cleanup){
        panel._cleanup()
      }
      
      panel.innerHTML = html

      // render tree
      renderGroupOnly(panel, groups, tables)

      // events
      bindGroupToggle(panel)
      bindGroupFilter(panel)
      bindGroupCRUD(panel)

      // live reload panel
      const reloadPanel = async () => {

      const newGroups = await getAll("module_groups")
      const newTables = await getAll("table_modules")

      const opened = [...panel.querySelectorAll(
        ".group-title .arrow"
      )]
      .map((el,i)=>({
        index:i,
        open:el.textContent==="▾"
      }))

      renderGroupOnly(panel, newGroups, newTables)

      bindGroupToggle(panel)
      bindGroupFilter(panel)
      bindGroupCRUD(panel)

      opened.forEach(x=>{

        if(!x.open) return

        const item =
          panel.querySelectorAll(".group-item")[x.index]

        if(!item) return

        item.querySelector(".group-children")
          .style.display="block"

        item.querySelector(".arrow")
          .textContent="▾"
      })
    }
      window.addEventListener(
        "module_groups_changed",
        reloadPanel
      )

      window.addEventListener(
        "table_modules_changed",
        reloadPanel
      )

      panel._cleanup = () => {

        if(panel._outsideHandler){
          document.removeEventListener(
            "click",
            panel._outsideHandler
          )
        }

        window.removeEventListener(
          "module_groups_changed",
          reloadPanel
        )

        window.removeEventListener(
          "table_modules_changed",
          reloadPanel
        )
      }

    }catch(err){

      console.error("❌ load group lỗi:", err)
    }
  }
}
