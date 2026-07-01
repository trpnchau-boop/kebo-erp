import { getAll, deleteRow, updateRow } from "../../js/crud.js"
import { schema } from "/js/schema/index.js"
import { getText } from "/js/relation-cache.js"
import { openFormSidebar } from "../form/open-sidebar-form.js"
import { openBarcodePopup } from "./list-barcode.js"
import { exportExcel } from "./list-excel.js"
import {
  openTab,
  replaceTab
}
from "../../js/tabs.js"
import {formatMoney} from "../../js/core/format.js"
import {
  createTableSelection
}
from "/js/core/table-selection.js"

/* =========================
INIT
========================= */

export async function init(params, root){

  const table =

    params.table ||

    params.type ||

    ""

  if(!table){

    root.innerHTML =

      `<div style="padding:16px">
        Thiếu tên bảng
      </div>`

    return

  }

  const state = {

    root,
    table,

    rows:[],
    filtered:[],

    fields:

      schema[table]?.fields || {},

    listFields:[],

    thead:
      root.querySelector("#thead"),

    tbody:
      root.querySelector("#tbody"),

    visibleRows:100,
    step:100,

    sortField:"",
    sortDir:1,

    selection:null

  }

  if(
    !state.thead ||
    !state.tbody
  ){
    return
  }

  state.listFields =

    Object.keys(state.fields)

      .filter(

        key =>

          !state.fields[key].hidden &&

          state.fields[key].showInList

      )

  setupTitle(state)

  setupButtons(state)

  buildHeader(state)

  const totalEl =
    root.querySelector(
      "#list-total"
    )

  const selectedEl =
    root.querySelector(
      "#list-selected"
    )

  state.selection =

    createTableSelection({

      thead:state.thead,

      tbody:state.tbody,

      checkAllSelector:
        "#check-all",

      rowSelector:
        ".row-check",

      onChange({

        count,
        total

      }){

        if(totalEl){

          totalEl.textContent =
            total

        }

        if(selectedEl){

          selectedEl.textContent =
            count

        }

      }

    })

  bindEvents(state)

  await load(state)

}

/* =========================
TITLE
========================= */

function setupTitle(state) {

  const el =
    state.root.querySelector("#title")

  if (!el) return

  el.textContent =
    schema[state.table]?.label ||
    state.table
}

/* =========================
BUTTONS
========================= */

function setupButtons(state) {

  if (
  schema[state.table]?.bulkEdit === false ||
  schema[state.table]?.canEdit === false
  ) {
    state.root
      .querySelector("#btn-edit-many")
      ?.remove()
  }
}

/* =========================
EVENTS
========================= */

function bindEvents(state){

if(state.abort){
  state.abort.abort()
}

state.abort = new AbortController()

state.abort.signal.addEventListener("abort", () => {
  if(window.reloadCurrentList){
    delete window.reloadCurrentList
  }
})

state.abort.signal.addEventListener("abort", () => {
  if(window.afterSidebarSave){
    delete window.afterSidebarSave
  }
})

const opt = {
 signal: state.abort.signal
}

  /* tbody click */
  state.tbody.addEventListener(
    "click",
    e => handleBodyClick(e, state)
  )

  /* checkbox change */
  state.tbody.addEventListener(
    "change",
    e => handleBodyChange(e, state)
  )

  /* add */
  state.root
    .querySelector("#btn-add")
    ?.addEventListener("click", e => {

      stop(e)

    if(state.table === "print_templates"){

      const currentTab =
        document.querySelector(
          ".tab.active"
        )

      if(!currentTab){
        return
      }

      const tabId =
        currentTab.dataset.tab

      replaceTab(

        tabId,

        "Template Builder",

        "print",
 
        {
          type:"new"
        }
      )

       return
    }

      const formTable =
        schema[state.table]?.formTable ||
        state.table

      openFormSidebar({
        table: formTable,
        id: null   ,

        onSave: data =>
          updateRowAfterSave(
            state,
            data
          )  
      })

    })

  /* bulk edit */
  state.root
    .querySelector("#btn-edit-many")
    ?.addEventListener("click", e => {

      stop(e)
      bulkEdit(state)

    })

  /* bulk delete */
  state.root
    .querySelector("#btn-del")
    ?.addEventListener("click", e => {

      stop(e)
      bulkDelete(state)

    })

  /* export */
  state.root
    .querySelector("#btn-export")
    ?.addEventListener("click", e => {

      stop(e)
      exportExcel(state.table)

    })

  /* import */
  state.root
    .querySelector("#btn-import")
    ?.addEventListener("click", e => {

      stop(e)

      openTab(
        `import-${state.table}`,
        "Import",
        "import-map",
        { type: state.table }
      )

    })

  /* search */
  state.root
    .querySelector("#search")
    ?.addEventListener("input", e => {

      handleSearch(
        e.target.value,
        state
      )

    })

  /* scroll lazy load */
  const scroller =
    state.root.closest(".tab-host")

  scroller?.addEventListener(
    "scroll",
    () => handleScroll(state),
    opt
  )
}

/* =========================
HEADER
========================= */

function buildHeader(state) {

  let html = `
    <tr>
      <th style="width:32px">
        <input
          type="checkbox"
          id="check-all">
      </th>
  `

  for (const k of state.listFields) {

    html += `
      <th
        class="sortable"
        data-sort="${k}">
        ${state.fields[k].label || k}
      </th>
    `
  }

  html += `
      <th style="width:90px"></th>
    </tr>
  `

  state.thead.innerHTML = html

  /* sort */
  state.thead.addEventListener(
    "click",
    e => {

      const th =
        e.target.closest("[data-sort]")

      if (!th) return

      const field =
        th.dataset.sort

      if (state.sortField === field) {
        state.sortDir *= -1
      } else {
        state.sortField = field
        state.sortDir = 1
      }

      render(state)
    }
  )

}

/* =========================
LOAD
========================= */

async function load(state) {

  state.rows =
    await getAll(state.table)

  state.filtered =
    [...state.rows]

  await render(state)
}

/* =========================
RENDER
========================= */

async function render(state) {

  let data =
    [...state.filtered]

  /* sort */
  if (state.sortField) {

    data.sort((a, b) => {

      const x =
        a[state.sortField]

      const y =
        b[state.sortField]

      if (x > y)
        return state.sortDir

      if (x < y)
        return -state.sortDir

      return 0
    })
  }

  const pageRows =
    data.slice(
      0,
      state.visibleRows
    )

  let html = ""

  for (const row of pageRows) {
    html +=
      await buildRow(row, state)
  }

  state.tbody.innerHTML = html

  state.selection.sync()
}

/* =========================
ROW
========================= */

async function buildRow(row, state) {

  const checked =
    state.selection.has(
      String(row.id)
    )
      ? "checked"
      : ""

  let html = `
    <tr>
      <td>
        <input
          type="checkbox"
          class="row-check"
          value="${row.id}"
          ${checked}>
      </td>
  `

  for (const k of state.listFields) {

    const value =
      await formatValue(
        row[k],
        state.fields[k],
        row,
        k
      )

    if (
      state.table === "data_employee" &&
      k === "code"
    ) {

      html += `
        <td data-field="${k}">
          <a 
          class="barcode-link"
          href="#/payroll/employee/${row.id}">
            ${value}
          </a>
        </td>
      `

    } else if (
      state.table === "data_product" &&
      k === "code"
    ) {

      html += `
        <td data-field="${k}">
          <a
            href="#"
            class="barcode-link"
            data-barcode="${row.id}">
            ${value}
          </a>
        </td>
      `

    } else {

      html += `
      <td data-field="${k}">
        ${value}
      </td>
      `
    }
  }

  const canEdit = schema[state.table]?.canEdit !== false

  html += `
  <td class="row-actions">

    ${
      canEdit
        ? `<button
            type="button"
            class="edit icon-btn"
            data-id="${row.id}">
            ✎
          </button>`
        : ""
    }

    <button
      type="button"
      class="del icon-btn danger"
      data-id="${row.id}">
      ×
    </button>

  </td>
    </tr>
  `

  return html
}

/* =========================
FORMAT
========================= */

async function formatValue(
  v,
  f={},
  row={},
  field=""
){

  if (v == null &&
      f.type !== "checkbox"
    ){ return ""}

  if (f.type === "image") {

    return v
      ? `
        <img
          src="${v}"
          class="product-thumb"
          data-image="${v}"
          style="
            width:50px;
            height:50px;
            object-fit:cover;
            border-radius:8px;
            border:1px solid #e5e7eb;
            cursor:pointer;
          "
        >
      `
      : ""
  }

  if (f.format === "money") {
    return formatMoney(v)
  }

  if (f.type === "checkbox") {
    return `
      <label class="switch">
        <input
          type="checkbox"
          class="list-switch"
          data-id="${row.id}"
          data-field="${field}"
          ${v ? "checked" : ""}
        >
        <span></span>
      </label>
    `
  }

  if (f.ref) {
    return await getText(
      f.ref,
      f.value || "id",
      f.text || "name",
      v
    )
  }

  return v
}

/* =========================
BODY CLICK
========================= */

function handleBodyClick(e, state) {

  const thumb =
    e.target.closest(
      ".product-thumb"
    )

  if(thumb){

    stop(e)

    openImagePreview(
      thumb.dataset.image
    )

    return
  }

  if (e.target.closest(".row-check"))
    return

  const canEdit = schema[state.table]?.canEdit !== false

  const edit =
    e.target.closest(".edit")

  if (edit && canEdit) {

    stop(e)

/* =========================
PRINT TEMPLATE
========================= */

if(state.table === "print_templates"){

  const currentTab =
    document.querySelector(
      ".tab.active"
    )

  if(!currentTab){
    return
  }

  const tabId =
    currentTab.dataset.tab

  replaceTab(

    tabId,

    "Template Builder",

    "print",

    {
      type: edit.dataset.id,
      table: edit.dataset.id
    }
  )

  return
}

  /* =========================
  NORMAL FORM
  ========================= */  

    const formTable =
      schema[state.table]?.formTable ||
      state.table

    openFormSidebar({
      table: formTable,   
      id: edit.dataset.id,
      
      onSave: data =>
        updateRowAfterSave(
          state,
          data
        )
    })

    return
  }

  const del =
    e.target.closest(".del")

  if (del) {

    stop(e)

    removeOne(
      del.dataset.id,
      state
    )

    return
  }

  const barcode =
    e.target.closest(".barcode-link")

  if (barcode) {

    stop(e)

    openBarcodePopup(
      barcode.dataset.barcode
    )
  }
}

/* =========================
BODY CHANGE
========================= */

async function handleBodyChange(e, state) {

  const sw =
    e.target.closest(
      ".list-switch"
    )

  if(sw){

  const data = {

    [sw.dataset.field]:
      sw.checked

  }

  if(

    state.table === "data_product"

    &&

    sw.dataset.field === "catalog_priority"

  ){

    data.catalog_priority_until =

      sw.checked

        ?

        new Date(

          Date.now()

          +

          30 * 24 * 60 * 60 * 1000

        ).toISOString()

        :

        null

  }

  await updateRow(

    state.table,

    sw.dataset.id,

    data

  )

  const row =
    state.rows.find(
      r =>
        String(r.id)
        ===
        sw.dataset.id
    )

  if(row){

    row[
      sw.dataset.field
    ] = sw.checked

  }

    return

  }
}

/* =========================
SEARCH
========================= */

function handleSearch(q, state) {

  q =
    q.trim().toLowerCase()

  state.filtered =
    state.rows.filter(r =>
      state.listFields.some(k =>
        String(r[k] || "")
          .toLowerCase()
          .includes(q)
      )
    )

  state.searchText = q.trim().toLowerCase()
  state.visibleRows = 100

  render(state)
}

/* =========================
BULK EDIT
========================= */

function bulkEdit(state) {

  const ids =
    state.selection.getIds()

  if (!ids.length) {
    alert("Chưa chọn dòng")
    return
  }

  const formTable =
  schema[state.table]?.formTable ||
  state.table

  openFormSidebar({
    table: formTable,
    ids,
    bulk: true
  })
}

/* =========================
BULK DELETE
========================= */

async function bulkDelete(state) {

  const ids =
    state.selection.getIds()

  if (!ids.length) {
    alert("Chưa chọn dòng")
    return
  }

  if (!confirm(
    "Xóa các dòng đã chọn?"
  )) return

  await Promise.all(
    ids.map(id =>
      deleteRow(
        state.table,
        id
      )
    )
  )

  state.selection.clear()

  await load(state)
}

/* =========================
DELETE ONE
========================= */

async function removeOne(id, state) {

  if (!confirm(
    "Xóa dòng này?"
  )) return

  if(schema[state.table]?.onDelete){
    await schema[state.table].onDelete(id)
  }else{
    await deleteRow(state.table, id)
  }
  state.selection.remove(id)
  await load(state)
}

/* =========================
SCROLL
========================= */

function handleScroll(state){

  if(state.root.offsetParent===null){
    return
  }

  if(
    state.visibleRows>=
    state.filtered.length
  ){
    return
  }

  const scroller =
    state.root.closest(".tab-host")

  if(!scroller){
    return
  }

  const bottom =
    scroller.scrollTop +
    scroller.clientHeight

  const height =
    scroller.scrollHeight

  if(bottom > height - 200){

    state.visibleRows = Math.min(
      state.visibleRows + state.step,
      state.filtered.length
    )

    render(state)
  }
}


function stop(e) {

  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
}

function updateRowAfterSave(
  state,
  { id, row }
){

  const idx =
    state.rows.findIndex(
      r => String(r.id) === String(id)
    )

  if(idx >= 0){

    state.rows[idx] = {
      ...state.rows[idx],
      ...row
    }

  }else{

    state.rows.unshift({
      id,
      ...row
    })

  }

  if(state.searchText){

    state.filtered =
      state.rows.filter(r =>
        state.listFields.some(k =>
          String(r[k] || "")
            .toLowerCase()
            .includes(
              state.searchText
            )
        )
      )

  }else{

    state.filtered =
      [...state.rows]

  }

  render(state)
}

function openImagePreview(src){

  const old =
    document.getElementById(
      "image-preview-modal"
    )

  if(old){
    old.remove()
  }

  const div =
    document.createElement("div")

  div.id =
    "image-preview-modal"

  div.innerHTML = `
    <div
      style="
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.75);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:99999;
      "
    >

      <img
        src="${src}"
        style="
          max-width:90vw;
          max-height:90vh;
          border-radius:12px;
          background:white;
        "
      >

    </div>
  `

  div.onclick = ()=>{
    div.remove()
  }

  document.body.appendChild(div)

}