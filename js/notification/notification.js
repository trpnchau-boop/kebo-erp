//notification.js

import {

  getNotifications,

  addNotification,

  updateNotification,

  removeNotification,

  clearNotifications

}

from "./notification-store.js"

import {

  renderNotifications

}

from "./notification-ui.js"

/* =========================
GET
========================= */

export function getList(){

  return getNotifications()

}

/* =========================
NOTIFY
========================= */

export function notify(data={}){

  const item =

    addNotification({

      title:"",

      subtitle:"",

      type:"SYSTEM",

      action:null,

      payload:{},

      ...data

    })

  renderNotifications()

  return item

}

/* =========================
STATUS
========================= */

export function setStatus(
  id,
  status
){

  const item =

    updateNotification(

      id,

      {status}

    )

  renderNotifications()

  return item

}

/* =========================
MARK
========================= */

export function markRead(id){

  return setStatus(

    id,

    "read"

  )

}

export function markProcessing(id){

  return setStatus(

    id,

    "processing"

  )

}

export function markDone(id){

  return setStatus(

    id,

    "done"

  )

}

export function markCancelled(id){

  return setStatus(

    id,

    "cancelled"

  )

}

/* =========================
REMOVE
========================= */

export function remove(id){

  removeNotification(id)

  renderNotifications()

}

/* =========================
CLEAR
========================= */

export function clear(){

  clearNotifications()

  renderNotifications()

}

/* =========================
COUNT
========================= */

export function getUnreadCount(){

  return getNotifications()

    .filter(x=>

      x.status==="new"

    )

    .length

}