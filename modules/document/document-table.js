//document-table.js//

import {computeTableRow}
from "./document-compute.js"

import {renderField}
from "./document-render-field.js"

import {isVisible}
from "./document-visible.js"

import {
  setRowInput
}
from "./document-input-map.js"

import {computeHeader}
from "./document-compute-header.js"

import {syncInputs}
from "./document-sync-inputs.js"

import {getDocType}
from "./document-get-doc-type.js"

/* =========================================================
TABLE
========================================================= */

export async function renderDocumentTable(
  root,
  schema,
  state
){

  renderHead(root, schema, state)

  await renderBody(
    root,
    schema,
    state
  )

}

/* =========================================================
HEAD
========================================================= */

function renderHead(root, schema, state){

  const thead =
    root.querySelector(
      "#document-thead"
    )

  thead.innerHTML = ""

  const tr =
    document.createElement("tr")

  const sys =
    schema.table.system || {}

  const canSplit =
    schema.capabilities?.split

  /* =====================================================
  CHECKBOX
  ===================================================== */

  if(sys.checkbox && canSplit){

    const th =
      document.createElement("th")

    th.className =
      "doc-th-checkbox"

    th.innerHTML = `
      <input type="checkbox">
    `

    tr.appendChild(th)

  }

  /* =====================================================
  STT
  ===================================================== */

  if(sys.stt){

    const th =
      document.createElement("th")

    th.className =
      "doc-th-stt"

    th.textContent = "STT"

    tr.appendChild(th)

  }

  /* =====================================================
  COLUMNS
  ===================================================== */

  const docType =
    getDocType(schema, state)

  schema.table.columns

    .filter(col =>

      isVisible(
        col,
        "table",
        docType
      )

    )

    .forEach(col=>{

      const th =
        document.createElement("th")

      th.textContent =
        col.label || ""

      if(col.width){
        th.style.minWidth =
          col.width + "px"
      }

      if(col.maxWidth){
        th.style.maxWidth =
          col.maxWidth + "px"
      }

      tr.appendChild(th)

    })

  /* =====================================================
  DELETE
  ===================================================== */

  if(sys.delete){

    const th =
      document.createElement("th")

    th.textContent = ""

    tr.appendChild(th)

  }

  thead.appendChild(tr)

}

function getTableScrollWrap(root){

  return (
    root.querySelector(".document-table-wrap")
    ||
    root.querySelector(".doc-table-wrap")
    ||
    root.querySelector(".table-wrap")
    ||
    root.querySelector("#document-table")
    ||
    root
  )
}

function scrollToLastRow(root){

  const wrap =
    root.querySelector(".doc-table-wrap")

  const body =
    root.querySelector("#document-body")

  if(!wrap || !body){
    return
  }

  const rows =
    body.querySelectorAll("tr")

  const lastRow =
    rows[rows.length - 1]

  if(!lastRow){
    return
  }

  wrap.scrollTop = wrap.scrollHeight

  lastRow.scrollIntoView({
    block: "nearest",
    behavior: "smooth"
  })
}

/* =========================================================
PUSH ROW
========================================================= */
export async function pushItemRow(
  root,
  row,
  state
){

  state.items.push(row)

  computeTableRow(
    state.schema,
    row
  )

  computeHeader(
    state.schema,
    state
  )

  await syncInputs({
    schema: state.schema,
    target: state.header,
    scope: "header"
  })

  await renderBody(
    root,
    state.schema,
    state
  )

  requestAnimationFrame(() => {
    scrollToLastRow(root)
  })
}

/* =========================================================
BODY
========================================================= */

async function renderBody(
  root,
  schema,
  state
){

  const body =
    root.querySelector(
      "#document-body"
    )

  body.innerHTML = ""

  const sys =
    schema.table.system || {}

  const canSplit =
    schema.capabilities?.split

  const docType =
    getDocType(schema, state)

  for(
    const [index,row]
    of state.items.entries()
  ){

    const tr =
      document.createElement("tr")

    tr.className = `doc-row doc-row-${docType.toLowerCase()}`  

    /* =================================================
    CHECKBOX
    ================================================= */

    if(sys.checkbox && canSplit){

      const td =
        document.createElement("td")

      td.className =
        "doc-td-checkbox"

      const checkbox =
        document.createElement("input")

      checkbox.type =
        "checkbox"

      checkbox.checked =
        !!row.checked

      checkbox.addEventListener(
        "change",
        ()=>{
          row.checked =
            checkbox.checked
        }
      )

      td.appendChild(checkbox)
      tr.appendChild(td)

    }

    /* =================================================
    STT
    ================================================= */

    if(sys.stt){

      const td =
        document.createElement("td")

      td.className =
        "doc-td-stt"

      td.textContent =
        index + 1

      tr.appendChild(td)

    }

    /* =================================================
    COLUMNS
    ================================================= */

    schema.table.columns

      .filter(col =>

        isVisible(
          col,
          "table",
          docType
        )

      )

      .forEach(col=>{

        const td =
          document.createElement("td")

        const input =
          renderField({
            field: col,
            row,
            state
          })

        setRowInput(
          row,
          col.key,
          input
        )

        td.appendChild(input)
        tr.appendChild(td)

      })

    /* =================================================
    DELETE
    ================================================= */

    if(sys.delete){

      const td =
        document.createElement("td")

      const btn =
        document.createElement("button")

      btn.className =
        "doc-delete-btn"

      btn.textContent =
        "✕"

      btn.onclick = async ()=>{

        state.items.splice(
          index,
          1
        )

        await renderBody(
          root,
          schema,
          state
        )

        computeHeader(
          state.schema,
          state
        )

        await syncInputs({
          schema: state.schema,
          target: state.header,
          scope: "header"
        })

      }

      td.appendChild(btn)
      tr.appendChild(td)

    }

    body.appendChild(tr)

    await syncInputs({
      schema: state.schema,
      target: row,
      scope: "row"
    })

  }

}