import { can } from "./core/permission.js"
import {
  getPermissionCode
} from "./router.js"

const tabs = {}
let order = []
let activeTabId = null

/* =========================
OPEN TAB
========================= */

export async function openTab(
  id,
  title,
  page,
  params = {},
  state = null
){

  if(tabs[id]){
    await activateTab(id)
    return
  }


  /* =========================
  KẾ THỪA QUYỀN TỪ TAB CHA
  ========================= */

  let nextState = {}

  if(
    state?.permissionCode
  ){

    nextState.permissionCode =
      state.permissionCode

  }

  const parent =
    tabs[activeTabId]

  if(
    parent &&
    !nextState.permissionCode
  ){

    /*

      Nếu cha đã là con của một permission khác
      thì tiếp tục giữ permission gốc.

    */

    if(
      parent.state?.permissionCode
    ){

      nextState.permissionCode =
        parent.state.permissionCode

    }else{

      /*
        Cha là tab gốc.
        Lấy permission trực tiếp của cha.
      */

      nextState.permissionCode =
        getPermissionCode(
          parent.page,
          parent.params
        )

    }

  }


  createTab(
    id,
    title,
    page,
    params,
    nextState
  )

  await activateTab(id)

  saveTabs()
}

/* =========================
ACTIVATE
========================= */

export async function activateTab(id){

const tab = tabs[id]
if(!tab) return
if(
  activeTabId === id &&
  tab.loaded
){
  return
}

document
.querySelectorAll(".tab")
.forEach(x => x.classList.remove("active"))

document
.querySelectorAll(".tab-host")
.forEach(x => {
  x.style.display = "none"
  x.classList.remove("active")
})

tab.el.classList.add("active")
tab.host.style.display = ""
tab.host.classList.add("active")

activeTabId = id

history.replaceState(
 null,
 "",
 buildHash(tab.page, tab.params)
)

if(!tab.loaded){
 await refreshTab(tab)
}

saveTabs()
}

/* =========================
REFRESH TAB
========================= */

export async function refreshActiveTab() {

  const tab = tabs[activeTabId]

  if (!tab) return

  tab.loaded = false
  tab.host.scrollTop = 0

  await refreshTab(tab)

}

async function refreshTab(tab){

  tab.host.innerHTML = ""

  const { loadPage } =
    await import("./router.js")

  await loadPage(
    tab.page,
    {
      ...tab.params,
      state: tab.state
    },
    tab.host
  )

  tab.loaded = true

}


/* =========================
CLOSE
========================= */

export async function closeTab(id){

  const tab = tabs[id]
  if(!tab){
    return
  }

/* =========================
RESTORE PREV
========================= */

if(
  tab.page === "print"
  &&
  tab.prevPage
){

  tab.page =
    tab.prevPage

  tab.params =
    tab.prevParams

  tab.title =
    tab.prevTitle

  tab.loaded =
    false

  const titleEl =
    tab.el.querySelector(
      ".tab-title"
    )

  if(titleEl){

    titleEl.textContent =
      tab.title
  }

  await activateTab(id)

  return
}  

tab.host.innerHTML = ""

tab.el.remove()
tab.host.remove()

delete tabs[id]

order =
order.filter(x => x !== id)

if(activeTabId === id){

activeTabId = null

const last =
order[order.length - 1]

if(last){
await activateTab(last)
}else{
  if(tab.page === "print"){
    openTab(
      "list_print_templates",
      "Mẫu in",
      "list",
      {
        table:"print_templates"
      }  
    ) 
    return 
  }  

location.hash = "#/dashboard"
}

}

saveTabs()

}

function canRestoreTab(
  page,
  params = {},
  state = null
){

  /* =========================
  CATALOG
  ========================= */

  if(page === "catalog"){
    return true
  }


  /* =========================
  PERMISSION TRỰC TIẾP
  ========================= */

  const code =
    getPermissionCode(
      page,
      params
    )


  if(can(code)){
    return true
  }


  /* =========================
  PERMISSION KẾ THỪA
  ========================= */

  const inheritedPermission =
    state?.permissionCode


  if(
    inheritedPermission &&
    can(inheritedPermission)
  ){
    return true
  }


  return false
}

/* =========================
RESTORE
========================= */

export async function restoreTabs(){

  const raw =
    localStorage.getItem("kebo_tabs")

  if(!raw) return


  try{

    const data =
      JSON.parse(raw)

    if(!data.tabs?.length){
      return
    }


    /* =========================
    RESTORE CÓ KIỂM TRA QUYỀN
    ========================= */

    for(const t of data.tabs){

      if(
        !canRestoreTab(
          t.page,
          t.params,
          t.state
        )
      ){

        continue

      }


      createTab(
        t.id,
        t.title,
        t.page,
        t.params,
        t.state
      )

    }


    /* =========================
    ACTIVE TAB
    ========================= */

    if(
      data.activeTabId &&
      tabs[data.activeTabId]
    ){

      await activateTab(
        data.activeTabId
      )

    }
    else if(order.length){

      await activateTab(
        order[0]
      )

    }


    /* =========================
    SAVE LẠI
    XÓA CÁC TAB ĐÃ MẤT QUYỀN
    ========================= */

    saveTabs()


  }catch(err){

    console.error(
      "Lỗi restore tabs:",
      err
    )

    localStorage.removeItem(
      "kebo_tabs"
    )

  }

}

/* =========================
CREATE ONLY
========================= */

function createTab(
id,
title,
page,
params = {},
savedState = null
){

if(tabs[id]) return

const bar =
document.getElementById(
"tabs-bar"
)

const content =
document.getElementById(
"content"
)

/* tab button */

const el =
document.createElement("div")

el.className = "tab"
el.dataset.tab = id

el.innerHTML = `
<span class="tab-close">
✕
</span>
<span class="tab-title">
${title}
</span>
`

bar.appendChild(el)

/* host */

const host =
document.createElement("div")

host.className = "tab-host"
host.dataset.page = page
host.dataset.tab = id
host.style.display = "none"

content.appendChild(host)

/* store */

tabs[id] = {
id,
title,
page,
params,
el,
host,
loaded:false,
state:
savedState 
}

order.push(id)

/* events */

el.addEventListener("click", e => {

if(e.target.closest(".tab-close")) return

if(activeTabId === id) return

activateTab(id)

})

el
.querySelector(".tab-close")
.addEventListener(
"click",
e=>{
e.stopPropagation()
closeTab(id)
}
)

}

/* =========================
SAVE
========================= */

function saveTabs(){

order =
order.filter(id => tabs[id])

localStorage.setItem(
"kebo_tabs",
JSON.stringify({
version:2,
order,
activeTabId,
tabs: order.map(id=>{

const t = tabs[id]

return {
  id:t.id,
  title:t.title,
  page:t.page,
  params:t.params,
  state:
    t.state?.permissionCode
      ? {
          permissionCode:
            t.state.permissionCode
        }
      : null
}

})
})
)

}

/* =========================
HASH
========================= */

function buildHash(page, p = {}){

  const arr = [page]

  if (p.type) {
    arr.push(p.type)
  }

  if (p.ref != null) {
    arr.push(p.ref)
  }

  if (p.id != null) {
    arr.push(p.id)
  }

  if (p.action) {
    arr.push(p.action)
  }

  if (p.ids) {
    arr.push(p.ids)
  }

  return "#/" + arr.join("/")
}

export async function replaceTab(

  id,

  title,

  page,

  params = {}

){

  const tab =
    tabs[id]

  if(!tab){
    return
  }

  /* =========================
  BACK STATE
  ========================= */

  tab.prevPage =
    tab.page

  tab.prevParams =
    tab.params

  tab.prevTitle =
    tab.title

  /* =========================
  UPDATE
  ========================= */

  tab.title =
    title

  tab.page =
    page

  tab.params =
    params

  tab.loaded =
    false

  /* =========================
  UI
  ========================= */

  const titleEl =
    tab.el.querySelector(
      ".tab-title"
    )

  if(titleEl){

    titleEl.textContent =
      title
  }

  /* =========================
  RELOAD
  ========================= */

  await activateTab(id)

  saveTabs()
}