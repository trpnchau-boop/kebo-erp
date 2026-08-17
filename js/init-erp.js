import { preloadRelations } from "/js/relation-cache.js"
import { initKeyboard } from "./keyboard.js"

import {
  restoreTabs,
  openTab
} from "./tabs.js"

import {
  initNotifications
} from "/js/notification/notification-ui.js"

import {
  loadPermissions
} from "./core/permission.js"

import {
  syncMenuPermissions,
  applyMenuPermissions
} from "./core/sync-menu-permissions.js"

export async function initERP(session){

  window.currentUser =
    session.user

  await syncMenuPermissions()

  await loadPermissions()

  applyMenuPermissions()

  initKeyboard()

  await preloadRelations()

  initNotifications()

  await new Promise(r => setTimeout(r,0))

  await restoreTabs()

  if(document.querySelector("#tabs-bar .tab")){
    return
  }

  openTab(
    "dashboard_main",
    "Dashboard",
    "dashboard",
    {}
  )

}