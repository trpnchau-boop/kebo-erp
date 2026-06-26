//modules/document/document-render-actions.js//

import {
  getVisibleActions
}
from "./document-get-actions.js"

/* =========================================================
RENDER ACTIONS
========================================================= */

export function renderActions(
  root,
  schema
){

  const actions =
    getVisibleActions(schema)

  /* =====================================================
  WRAP
  ===================================================== */

  const wrap =
    root.querySelector(
      "#document-actions"
    )

  if(!wrap){
    return
  }

  /* =========================================
  INLINE ACTIONS
  ========================================= */

  const hasInlineActions =

    (schema.form?.fields || [])

      .some(
        field => field.inlineActions
      )

  if(hasInlineActions){

    wrap.style.display = "none"
    return

  }

  wrap.style.display = ""

  /* =====================================================
  RESET
  ===================================================== */

  wrap.innerHTML = ""

  /* =====================================================
  RENDER
  ===================================================== */

  actions.forEach(action=>{

    const btn =
      document.createElement(
        "button"
      )

    btn.type = "button"

    btn.className =

      [
        "doc-action-btn",
        action.class || ""
      ]

      .join(" ")

      .trim()

    btn.textContent =
      action.label || ""

    if(action.event){
      btn.dataset.event =
        action.event
    }

    if(action.key){
      btn.dataset.key =
        action.key
    }

    if(action.disabled){
      btn.disabled = true
    }

    wrap.appendChild(btn)

  })

}