//notification-store.js

const STORAGE_KEY = "kebo_notifications"

/* =========================
LOAD
========================= */

export function loadNotifications(){

  try{

    return JSON.parse(

      localStorage.getItem(
        STORAGE_KEY
      ) || "[]"

    )

  }

  catch{

    return []

  }

}

/* =========================
SAVE
========================= */

export function saveNotifications(list=[]){

  localStorage.setItem(

    STORAGE_KEY,

    JSON.stringify(list)

  )

}

/* =========================
GET
========================= */

export function getNotifications(){

  return loadNotifications()

}

/* =========================
ADD
========================= */

export function addNotification(data={}){

  const list =

    loadNotifications()

  const item = {

    id:
      crypto.randomUUID(),

    createdAt:
      Date.now(),

    status:
      "new",

    ...data

  }

  list.unshift(item)

  saveNotifications(list)

  return item

}

/* =========================
UPDATE
========================= */

export function updateNotification(
  id,
  values={}
){

  const list =

    loadNotifications()

  const index =

    list.findIndex(

      x=>String(x.id)===String(id)

    )

  if(index<0){

    return null

  }

  list[index]={

    ...list[index],

    ...values

  }

  saveNotifications(list)

  return list[index]

}

/* =========================
REMOVE
========================= */

export function removeNotification(id){

  const list =

    loadNotifications()

      .filter(

        x=>String(x.id)!==String(id)

      )

  saveNotifications(list)

}

/* =========================
CLEAR
========================= */

export function clearNotifications(){

  saveNotifications([])

}