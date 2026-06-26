import {pushItemRow}
from "./document-table.js"

import {renderField}
from "./document-render-field.js"

import {computeTableRow}
from "./document-compute.js"

import {syncInputs}
from "./document-sync-inputs.js"

import {isVisible}
from "./document-visible.js"

import {
  setRowInput,
  getRowInputs
}
from "./document-input-map.js"

import {getDocType}
from "./document-get-doc-type.js"

import {
  createProduct
}
from "./actions/create-product.js"

function focusDraftProduct(root, tries = 0){

  const wrap =
    root.querySelector("#document-input")

  if(!wrap){
    if(tries < 20){
      requestAnimationFrame(()=>{
        focusDraftProduct(root, tries + 1)
      })
    }
    return
  }

  const input =
    wrap.querySelector("input[data-key='id_product']")

  if(!input){
    if(tries < 20){
      requestAnimationFrame(()=>{
        focusDraftProduct(root, tries + 1)
      })
    }
    return
  }

  /* chỉ focus khi suggest-wrapper đã dựng xong */
  const ready =
    input.closest(".suggest-wrapper")

  if(!ready){
    if(tries < 20){
      requestAnimationFrame(()=>{
        focusDraftProduct(root, tries + 1)
      })
    }
    return
  }

  input.focus()
  input.select?.()
}
/* =========================================================
INPUT BAR
========================================================= */

export function renderInputBar(
  root,
  schema,
  state
){

  const wrap =
    root.querySelector("#document-input")

  if(!wrap) return

  wrap.innerHTML = ""

  /* =====================================================
  DRAFT ROW
  ===================================================== */

  const row =
    state.draftRow ||= {}

  /* =====================================================
  COLUMNS
  ===================================================== */

  const docType =
    getDocType(schema, state)

  const cols =
    schema.table.columns
      .filter(col =>
        isVisible(
          col,
          "input",
          docType
        )
      )

  /* =====================================================
  RENDER INPUT
  ===================================================== */

  cols.forEach(field=>{

    const box =
      document.createElement("div")

    box.className =
      "doc-input-field"

    if(field.width){
      box.style.width =
        field.width + "px"
    }

    /* ===============================================
    LABEL
    =============================================== */

    const label =
      document.createElement("div")

    label.className =
      "doc-input-label"

    label.textContent =
      field.label || ""

    /* ===============================================
    INPUT
    =============================================== */

    const input =
      renderField({
        field,
        row,
        state
      })

    setRowInput(
      row,
      field.key,
      input
    )

    box.appendChild(label)
    box.appendChild(input)
    wrap.appendChild(box)

  })

  /* =====================================================
  ADD BUTTON
  ===================================================== */

  const btn =
    document.createElement("button")

  btn.className =
    "doc-add-btn"

  btn.id = "add-line"  

  btn.textContent =
    "+"

  btn.addEventListener(
    "click",
    async ()=>{

      const productInput =
        getRowInputs(row)?.id_product

      const keyword =
        productInput?.value?.trim()

      if(
        !row.id_product
        &&
        keyword
      ){
        await createProduct({
          input: productInput
        })
        return
      }

      /* ===============================================
      COMPUTE BEFORE PUSH
      =============================================== */

      computeTableRow(
        state.schema,
        row
      )

      /* ===============================================
      PUSH ROW
      =============================================== */

      await pushItemRow(
        root,
        {
          ...row
        },
        state
      )

      /* ===============================================
      RESET DRAFT
      ================================================= */

      state.draftRow = {}

      /* ===============================================
      RE-RENDER INPUT BAR
      =============================================== */

      renderInputBar(
        root,
        schema,
        state
      )

      queueMicrotask(()=>{
        requestAnimationFrame(()=>{
          focusDraftProduct(root)
        })
      })

    }
  )

  wrap.appendChild(btn)

  /* =====================================================
  INIT COMPUTE
  ===================================================== */

  computeTableRow(
    state.schema,
    row
  )

  /* =====================================================
  INIT SYNC DRAFT
  ===================================================== */

  syncInputs({
    schema: state.schema,
    target: row,
    scope: "draft"
  })

  /* =====================================================
  FORCE RE-SYNC AFTER RENDER
  - để custom select ĐVT lấy đúng dvtGoc/id_unit
  - đặc biệt sau khi row bị mutate bởi bindField(mapping)
  ===================================================== */

  queueMicrotask(()=>{

    syncInputs({
      schema: state.schema,
      target: state.draftRow,
      scope: "draft"
    })

  })

}