export function openSidebarPanel(html=""){

const sidebar = document.getElementById("sidebar")
const panel   = document.getElementById("sidebar-panel")

if(!sidebar || !panel) return

panel.innerHTML = html

sidebar.classList.add("panel-mode")

if(window.innerWidth <= 768){
  sidebar.classList.add("mobile-open")
}

}

export function closeSidebarPanel(){

const sidebar = document.getElementById("sidebar")
const panel   = document.getElementById("sidebar-panel")

if(!sidebar || !panel) return

sidebar.classList.remove("panel-mode")

if(window.innerWidth <= 768){
  sidebar.classList.remove("mobile-open")
}

panel.innerHTML = ""

}

// sidebar-panel.js

export async function openSidebarPage({

  url = "",
  onLoad = null

}){

  openSidebarPanel("Đang tải...")

  const panel =
    document.getElementById(
      "sidebar-panel"
    )

  if(!panel) return

  try{

    const res =
      await fetch(url)

    const html =
      await res.text()

    panel.innerHTML = `
       <div class="sidebar-page">
         ${html}
        </div>
    `

    const root =
    panel.querySelector(".sidebar-page")

    if(onLoad){
      await onLoad(root)
    }  

  }catch(err){

    console.error(err)

    panel.innerHTML = `
      <div style="
        padding:16px;
        color:red;
      ">
        Không tải được panel
      </div>
    `
  }

}