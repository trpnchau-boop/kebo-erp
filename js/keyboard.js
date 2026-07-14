import {
  getRowInput
}
from "/modules/document/document-input-map.js"

let draftNoteReturnKey = ""

function root(){

  const panel = document.getElementById("sidebar-panel")
  if(panel && panel.offsetParent !== null){
    return panel
  }

  const active =
    document.querySelector(".tab-host.active")

  const visible =
    document.querySelector(".tab-host:not([style*='display:none'])")

  return active || visible || document
}

function getFieldKey(el){

  if(!el) return ""

  return (
    el.id
    ||
    el.dataset?.key
    ||
    el.closest?.("[data-key]")?.dataset?.key
    ||
    ""
  )
}

function getSuggestState(current){

  const wrapper =
    current.closest?.(".suggest-wrapper")

  const items = wrapper
    ? [...wrapper.querySelectorAll(".suggest-box .suggest-item")]
    : []

  return {
    wrapper,
    items,
    hasSuggest: items.length > 0
  }
}

export function initKeyboard(){

  document.addEventListener("keydown", e => {

    /* =====================================================
       F2 -> focus sản phẩm draft
    ===================================================== */
    if(e.key === "F2"){
      e.preventDefault()
      e.stopPropagation()

      focusTo("id_product")
      return
    }

    /* =====================================================
       F3 -> focus ghi chú draft
    ===================================================== */
    if(e.key === "F3"){
      e.preventDefault()
      e.stopPropagation()

      const current =
        document.activeElement

      const key =
        getFieldKey(current)

      if(
        key &&
        key !== "note"
      ){
        draftNoteReturnKey = key
      }

      focusDraftNote()
      return
    }

    const el = document.activeElement
    if(!el) return

    if(e.key === "ArrowDown"){

      if(moveVertical(el,1)){

        e.preventDefault()
        e.stopPropagation()

      }

      return
    }

    if(e.key === "ArrowUp"){

      if(moveVertical(el,-1)){

        e.preventDefault()
        e.stopPropagation()

      }

      return
    }

    /* =====================================================
       DOC SELECT KEYBOARD
    ===================================================== */
    const docSelect =
      el.closest?.(".doc-select")

    if(docSelect){
      if(handleDocSelectKey(e, docSelect, el)){
        return
      }
    }

    if(e.key !== "Enter") return

    const tag = el.tagName

    /* =====================================================
       BUTTON
    ===================================================== */
    if(tag === "BUTTON"){
      e.preventDefault()
      el.click()
      return
    }

    if(
      tag !== "INPUT" &&
      tag !== "SELECT" &&
      tag !== "TEXTAREA"
    ){
      return
    }

    /* =====================================================
       Nếu đang có suggest -> Enter chọn item
    ===================================================== */
    const {wrapper, hasSuggest} =
      getSuggestState(el)

    if(hasSuggest){

      const active =
        wrapper.querySelector(".suggest-item.active")

      const first =
        wrapper.querySelector(".suggest-item")

      ;(active || first)?.click()

      e.preventDefault()
      return
    }

    /* =====================================================
       FLOW CHÍNH
    ===================================================== */
    if(moveDocFlow(el)){
      e.preventDefault()
      e.stopPropagation()
      return
    }

    /* =====================================================
       FALLBACK
    ===================================================== */
    e.preventDefault()
    moveNext(el)

  }, true)
}

/* =====================================================
   DOC SELECT KEYBOARD
===================================================== */

function handleDocSelectKey(e, docSelect, current){

  const trigger =
    docSelect.querySelector(".doc-select-trigger")

  if(current !== trigger){
    return false
  }

  const panel =
    docSelect.querySelector(".doc-select-panel")

  const items = [
    ...panel.querySelectorAll(".doc-select-item")
  ]

  if(!items.length){
    return false
  }

  const isOpen =
    docSelect.classList.contains("open")

  /* ENTER */
  if(e.key === "Enter"){

    e.preventDefault()
    e.stopPropagation()

    if(!isOpen){
      openDocSelect(docSelect)
      ensureDocSelectActive(docSelect)
      return true
    }

    const active =
      panel.querySelector(".doc-select-item.active")
      ||
      panel.querySelector(".doc-select-item.selected")
      ||
      items[0]

    active?.click()
    moveDocFlow(trigger)
    return true
  }

  /* ARROWDOWN */
  if(e.key === "ArrowDown"){

    e.preventDefault()
    e.stopPropagation()

    if(!isOpen){
      openDocSelect(docSelect)
      ensureDocSelectActive(docSelect)
      return true
    }

    moveDocSelectActive(docSelect, 1)
    return true
  }

  /* ARROWUP */
  if(e.key === "ArrowUp"){

    e.preventDefault()
    e.stopPropagation()

    if(!isOpen){
      openDocSelect(docSelect)
      ensureDocSelectActive(docSelect)
      return true
    }

    moveDocSelectActive(docSelect, -1)
    return true
  }

  /* ESC */
  if(e.key === "Escape" && isOpen){
    e.preventDefault()
    e.stopPropagation()
    closeDocSelect(docSelect)
    return true
  }

  return false
}

function openDocSelect(docSelect){

  const opened =
    root().querySelectorAll(".doc-select.open")

  opened.forEach(x => {
    if(x !== docSelect){
      x.classList.remove("open")
    }
  })

  docSelect.classList.add("open")
}

function closeDocSelect(docSelect){
  docSelect.classList.remove("open")
}

function ensureDocSelectActive(docSelect){

  const panel =
    docSelect.querySelector(".doc-select-panel")

  const items = [
    ...panel.querySelectorAll(".doc-select-item")
  ]

  if(!items.length) return

  let active =
    panel.querySelector(".doc-select-item.active")

  if(active) return

  active =
    panel.querySelector(".doc-select-item.selected")
    || items[0]

  setDocSelectActive(docSelect, active)
}

function moveDocSelectActive(docSelect, step){

  const panel =
    docSelect.querySelector(".doc-select-panel")

  const items = [
    ...panel.querySelectorAll(".doc-select-item")
  ]

  if(!items.length) return

  let index =
    items.findIndex(x =>
      x.classList.contains("active")
    )

  if(index === -1){
    index =
      items.findIndex(x =>
        x.classList.contains("selected")
      )
  }

  if(index === -1){
    index = 0
  }else{
    index += step
  }

  if(index < 0){
    index = items.length - 1
  }

  if(index >= items.length){
    index = 0
  }

  setDocSelectActive(docSelect, items[index])
}

function setDocSelectActive(docSelect, item){

  if(!item) return

  const panel =
    docSelect.querySelector(".doc-select-panel")

  panel.querySelectorAll(".doc-select-item")
    .forEach(x => x.classList.remove("active"))

  item.classList.add("active")
  item.scrollIntoView({block:"nearest"})
}

/* =====================================================
   FLOW
===================================================== */

function moveDocFlow(current){

  const map = [
    "id_customer",
    "id_employee",
    "note",
    "id_product",
    "qty",
    "id_unit",
    "dongia",
    "thanhtien"
  ]

  const fieldHost =
    current.closest?.("[data-key]")

  const id =
    current.id
    ||
    current.dataset.key
    ||
    fieldHost?.dataset.key
    ||
    ""

  /* =====================================================
     CUSTOMER
     - có suggest -> Enter ngoài sẽ chọn item
     - có id -> sang employee
     - có text nhưng chưa có id -> mở form thêm KH
  ===================================================== */
  if(id === "id_customer"){

    const {hasSuggest} =
      getSuggestState(current)

    if(hasSuggest){
      return false
    }

    const value =
      current.value?.trim?.() || ""

    const hasId =
      current.dataset.value

    if(hasId){
      focusTo("id_employee")
      return true
    }

    if(value){
      clickLookupAction("createCustomer")
      return true
    }

    return false
  }

  /* =====================================================
     EMPLOYEE
     - có suggest -> Enter ngoài sẽ chọn item
     - có id -> sang note
     - có text nhưng chưa có id -> mở form thêm NV
  ===================================================== */
  if(id === "id_employee"){

    const {hasSuggest} =
      getSuggestState(current)

    if(hasSuggest){
      return false
    }

    const value =
      current.value?.trim?.() || ""

    const hasId =
      current.dataset.value

    if(hasId){
      focusTo("note")
      return true
    }

    if(value){
      clickLookupAction("createEmployee")
      return true
    }

    return false
  }

  /* =====================================================
     NOTE
  ===================================================== */
  if(id === "note"){

    const inDraft =
      !!current.closest("#document-input")

    if(inDraft){

      if(
        draftNoteReturnKey &&
        draftNoteReturnKey !== "note"
      ){
        const returnKey =
          draftNoteReturnKey

        draftNoteReturnKey = ""

        focusTo(returnKey)
        return true
      }

      focusTo("id_product")
      return true
    }
  }

  /* =====================================================
     PRODUCT
     - có suggest -> Enter ngoài sẽ chọn item
     - có id -> sang qty
     - có text nhưng chưa có id -> mở form thêm SP
  ===================================================== */
if(id === "id_product"){

  const {hasSuggest} =
    getSuggestState(current)

  if(hasSuggest){
    return false
  }

  const value =
    current.value?.trim?.() || ""

  const hasId =
    current.dataset.value

  /* đã chọn sản phẩm -> sang SL */
  if(hasId){
    focusTo("qty")
    return true
  }

  /* chưa có id nhưng có text -> bấm add-line
     renderInputBar sẽ tự quyết:
     - nếu là SP mới => createProduct()
     - nếu đã hợp lệ => thêm dòng
  */
  if(value){
    root().querySelector("#add-line")?.click()
    return true
  }

  return false
}

  const index =
    map.indexOf(id)

  if(index === -1){
    return false
  }

  /* qty -> mở luôn menu ĐVT */
  if(id === "qty"){
    if(openFieldSelect("id_unit")){
      return true
    }
  }

  /* thanhtien -> thêm dòng */
  if(id === "thanhtien"){
    draftNoteReturnKey = ""
    root().querySelector("#add-line")?.click()
    return true
  }

  const nextId =
    map[index + 1]

  if(!nextId){
    return false
  }

  focusTo(nextId)
  return true
}

/* =====================================================
   FALLBACK TAB ORDER
===================================================== */

function moveNext(current){

  const list = [...root().querySelectorAll(
    'input:not([type="hidden"]), select, textarea, button, .doc-select'
  )]
  .filter(x => {
    const s = getComputedStyle(x)
    return s.display !== "none" &&
           s.visibility !== "hidden" &&
           !x.disabled
  })
  .map(x => {
    if(x.classList?.contains("doc-select")){
      return x.querySelector(".doc-select-trigger") || x
    }
    return x
  })

  const index = list.indexOf(current)
  if(index === -1) return

  const next = list[index + 1]
  if(!next) return

  next.focus()
  next.select?.()
}

/* =====================================================
   HELPERS
===================================================== */

export function focusTo(id){

  let el =
    root().querySelector(`#${id}`)
    ||
    root().querySelector(`[data-key="${id}"]`)

  if(!el) return

  if(el.classList?.contains("doc-select")){
    const trigger =
      el.querySelector(".doc-select-trigger")

    if(trigger){
      trigger.focus()
      return
    }
  }

  const docSelect =
    el.closest?.(".doc-select")

  if(docSelect){
    const trigger =
      docSelect.querySelector(".doc-select-trigger")

    if(trigger){
      trigger.focus()
      return
    }
  }

  el.focus()

  if(
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA"
  ){
    el.select?.()
  }
}

function clickLookupAction(eventName){

  const r = root()

  const btn =
    r.querySelector(
      `.doc-lookup-add-btn[data-event="${eventName}"]`
    )
    ||
    document.querySelector(
      `.doc-lookup-add-btn[data-event="${eventName}"]`
    )

  if(!btn){
    return false
  }

  btn.click()
  return true
}

function openFieldSelect(id){

  let el =
    root().querySelector(`#${id}`)
    ||
    root().querySelector(`[data-key="${id}"]`)

  if(!el) return false

  const docSelect =
    el.classList?.contains("doc-select")
      ? el
      : el.closest?.(".doc-select")

  if(!docSelect) return false

  const trigger =
    docSelect.querySelector(".doc-select-trigger")

  if(trigger){
    trigger.focus()
  }

  openDocSelect(docSelect)
  ensureDocSelectActive(docSelect)

  return true
}

function focusDraftNote(){

  const wrap =
    root().querySelector("#document-input")

  if(!wrap) return

  const el =
    wrap.querySelector("#note")
    ||
    wrap.querySelector('[data-key="note"]')

  if(!el) return

  if(el.classList?.contains("doc-select")){
    const trigger =
      el.querySelector(".doc-select-trigger")

    trigger?.focus()
    return
  }

  const docSelect =
    el.closest?.(".doc-select")

  if(docSelect){
    docSelect
      .querySelector(".doc-select-trigger")
      ?.focus()
    return
  }

  el.focus()
  el.select?.()
}

function moveVertical(
  current,
  step
){

  const row =
    current._row

  if(!row){
    return false
  }

  const state =
    root()._docState

  if(!state){
    return false
  }

  const field =
    current.dataset.key

  const index =
    state.items.indexOf(row)

  if(index === -1){
    return false
  }

  const nextRow =
    state.items[index + step]

  if(!nextRow){
    return false
  }

  const input =
    getRowInput(
      nextRow,
      field
    )

  if(!input){
    return false
  }

  input.focus()
  input.select?.()

  return true
}