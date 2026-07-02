// js/router.js

const htmlCache = new Map()
const moduleCache = new Map()

/* =========================
LOAD PAGE
========================= */

export async function loadPage(
  page,
  params = {},
  target = null
){

  if(!target){
    return
  }

  const root = target

  const token =
    crypto.randomUUID()

  root._loadToken = token

  try{

    /* =========================
    ROUTE
    ========================= */
    const route =
      normalizeRoute(
        page,
        params
      )

    /* =========================
    URL
    ========================= */

    const hash =
      buildHash(route)

    history.replaceState(
      null,
      "",
      hash
    )

    /* =========================
    HTML
    ========================= */

    const html =
      await getHtml(route.page)

    if(
      root._loadToken !== token
    ){
      return
    }

    root.innerHTML = html

    root.dataset.route =
      route.page

    /* =========================
    MODULE
    ========================= */

    const mod =
      await getModule(route)

    if(
      root._loadToken !== token
    ){
      return
    }

    /* =========================
    INIT
    ========================= */

    if(mod?.init){

      await mod.init(
        route,
        root
      )

    }

  }catch(err){

    if(
      root._loadToken !== token
    ){
      return
    }

    root.innerHTML = `
      <div style="
        padding:20px;
      ">
        Không tải được module:
        ${page}
      </div>
    `

    console.error(err)

  }

}

/* =========================
NORMALIZE ROUTE
========================= */

function normalizeRoute(
  page,
  params = {}
){

  const parts =
    page.split("/")

  return {

    page:
      parts[0] || "",

    type:
      parts[1]
      ||
      params.type
      ||
      params.table
      ||
      "",

    table:
      params.table
      ||
      parts[1]
      ||
      "",

    ref:
      toNumOrNull(
        parts[2]
        || params.ref
      ),

    id:
      toNumOrNull(
        parts[3]
        || params.id
      ),

    action:
      parts[4]
      ||
      params.action
      ||
      "",

    ids:
      params.ids || "",

    state:
      params.state || null

  }

}

/* =========================
BUILD HASH
========================= */

function buildHash(route){

  const arr = [
    route.page
  ]

  if(route.type){
    arr.push(route.type)
  }

  if(route.ref !== null){
    arr.push(route.ref)
  }

  if(route.id !== null){
    arr.push(route.id)
  }

  if(route.action){
    arr.push(route.action)
  }

  if(route.ids){
    arr.push(route.ids)
  }

  return "#/" + arr.join("/")

}

/* =========================
TO NUMBER
========================= */

function toNumOrNull(v){

  if(
    v === null
    ||
    v === undefined
    ||
    v === ""
  ){
    return null
  }

  const n =
    Number(v)

  return Number.isNaN(n)
    ? v
    : n

}

/* =========================
GET HTML
========================= */

async function getHtml(page){

  if(
    htmlCache.has(page)
  ){
    return htmlCache.get(page)
  }

  const paths = [

    `../modules/${page}/${page}.html`,

    `../modules/document/${page}/${page}.html`

  ]

  for(const path of paths){

    const res =
      await fetch(path)

    if(res.ok){

      const html =
        await res.text()

      htmlCache.set(
        page,
        html
      )

      return html

    }

  }

  throw new Error(
    "HTML not found: " + page
  )

}

/* =========================
GET MODULE
========================= */

async function getModule(route){

  const key =
    moduleKey(route)

  if(
    moduleCache.has(key)
  ){
    return moduleCache.get(key)
  }

  const paths = []

  /* =========================
  SPECIAL
  ========================= */

  if(
    route.page === "list"
    &&
    route.type === "document_items"
  ){

    paths.push(
      "../modules/list/list-doc-items.js"
    )

  }else{

    paths.push(
      `../modules/${route.page}/${route.page}.js`
    )

  }

  /* =========================
  FALLBACK
  ========================= */

  paths.push(
    `../modules/document/${route.page}/${route.page}.js`
  )

  for(const path of paths){

    try{

      const mod =
        await import(path)

      moduleCache.set(
        key,
        mod
      )

      return mod

    }catch(err){

    }

  }

  moduleCache.set(
    key,
    null
  )

  return null

}

/* =========================
MODULE KEY
========================= */

function moduleKey(route){

  if(
    route.page === "list"
    &&
    route.type === "document_items"
  ){
    return "list-doc-items"
  }

  return route.page

}