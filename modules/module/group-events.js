import {
  showUngroupedTables,
  showGroupTables
} from "./module-filter.js"

export function bindGroupCRUD(root){

  const btnAdd = root.querySelector("#btn-add")

  if(!btnAdd){
    console.warn("❌ Không có btn-add")
    return
  }

  btnAdd.onclick = async () => {

    const panel = document.getElementById("sidebar-panel")

    if(!panel){
      console.warn("❌ Không có sidebar-panel")
      return
    }

    try{

      // cleanup panel cũ
      if(panel._cleanup){
        panel._cleanup()
      }

      // load html
      const res = await fetch("/modules/settings/settings.html")

      if(!res.ok){
        throw new Error("Không load được settings.html")
      }

      const html = await res.text()

      panel.innerHTML = html

      // load js
      const mod = await import("/modules/settings/settings.js")

      await mod.init({
        table: "module_groups"
      }, panel)

    }catch(err){

      console.error("❌ Mở module_groups lỗi:", err)
    }
  }
}

export function bindGroupToggle(root){

  root.querySelectorAll(".group-title").forEach(title => {

    title.onclick = () => {

      const parent = title.closest(".group-item")

      if(!parent) return

      const children = parent.querySelector(".group-children")

      if(!children || !children.children.length){
        return
      }

      const arrow = title.querySelector(".arrow")

      const isOpen =
        children.style.display === "block"

      // đóng hết
      root.querySelectorAll(".group-children")
        .forEach(el => {
          el.style.display = "none"
        })

      root.querySelectorAll(".arrow")
        .forEach(el => {
          el.textContent = "▸"
        })

      // toggle
      if(!isOpen){

        children.style.display = "block"

        if(arrow){
          arrow.textContent = "▾"
        }
      }
    }
  })
}
export function bindGroupFilter(root){

  root.querySelectorAll(".child-item")
    .forEach(el => {

      el.onclick = (e) => {

  e.stopPropagation()

  const table = el.dataset.table
  const module = el.dataset.module

  root.dataset.groupMode = "1"

  root.querySelectorAll(".child-item")
    .forEach(x => {
      x.classList.remove("active")
    })

  el.classList.add("active")

  showGroupTables(module, table)
}
    })

  // cleanup cũ
  if(root._outsideHandler){
    document.removeEventListener(
      "click",
      root._outsideHandler
    )
  }

  // handler mới
  root._outsideHandler = (e) => {

  if(root.dataset.groupMode !== "1"){
    return
  }

  if(e.target.closest("#sidebar-panel")){
    return
  }

  root.dataset.groupMode = ""

  showUngroupedTables()

  root.querySelectorAll(".child-item")
    .forEach(x => {
      x.classList.remove("active")
    })
}

  document.addEventListener(
    "click",
    root._outsideHandler
  )
}