import {
  openSidebarPanel
}
from "/js/sidebar-panel.js"

import {
  printStore
}
from "/modules/print/core/store.js"

import {
  renderPropertyPanel,
  bindPropertyPanel
}
from "/modules/print/panel/property-panel.js"

export function openPropertySidebar(){

  openSidebarPanel()

  const panel =
    document.getElementById(
      "sidebar-panel"
    )

  if(!panel){
    return
  }

  panel.innerHTML =
    renderPropertyPanel(
      printStore.getState()
    )

  bindPropertyPanel(panel)

}