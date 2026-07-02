

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

  createTab(
    id,
    title,
    page,
    params,
    state
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

async function refreshTab(tab){

tab.host.innerHTML = ""  

const {loadPage} =
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

if(!data.tabs?.length) return

for(const t of data.tabs){

createTab(
t.id,
t.title,
t.page,
t.params,
t.state
)

}

if(
data.activeTabId &&
tabs[data.activeTabId]
){
await activateTab(
data.activeTabId
)
}
else if(order.length){
await activateTab(order[0])
}

}catch(err){

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
×
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
state:t.state
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