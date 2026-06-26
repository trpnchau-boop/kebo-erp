//document-form.js//

import {renderField}
from "./document-render-field.js"

import {isVisible}
from "./document-visible.js"

import {
  setRowInput
}
from "./document-input-map.js"

import {getDocType}
from "./document-get-doc-type.js"

import {
  getVisibleActions
}
from "./document-get-actions.js"

import {
  updateSummaryBar
}
from "./document-summary-bar.js"

/* =========================================================
DOCUMENT FORM
========================================================= */

export function renderDocumentForm(
  root,
  schema,
  row = {},
  state
){

  const wrap =
    root.querySelector(
      "#document-form"
    )

  if(!wrap) return

  wrap.innerHTML = ""

  root
    .querySelectorAll(
      ".doc-header > .payment-summary"
    )
    .forEach(el => el.remove())

  row._inputs ||= {}

  /* =====================================================
  DOC TYPE
  ===================================================== */

  const docType =
    getDocType(schema, state)

  /* =====================================================
  FIELDS
  ===================================================== */

  schema.form.fields

    .filter(field =>

      isVisible(
        field,
        "form",
        docType
      )

    )

    .forEach(field=>{

      /* =================================================
      FIELD WRAP
      ================================================= */

      const div =
        document.createElement("div")

      div.className =
        "doc-field"

      /* =========================
      WIDTH
      ========================= */

      if(field.width){

        div.style.setProperty(
          "--field-width",
          field.width + "px"
        )

      }

      /* =========================
      SPAN
      ========================= */

      if(field.span){

        div.style.gridColumn =
          `span ${field.span}`

      }

      /* =========================
      INLINE ACTIONS
      ========================= */

      if(field.inlineActions){

        div.classList.add(
          "doc-field-inline"
        )

      }

      /* =================================================
      GROUP FIELD
      ================================================= */

      if(field.type === "group"){

        div.classList.add(
          "doc-field-group"
        )

        if(field.class){

          div.classList.add(
            field.class
          )

        }

        const groupWrap =
          document.createElement("div")

        groupWrap.className =
          "doc-group-wrap"

        ;(field.fields || [])

          .filter(childField =>

            isVisible(
              childField,
              "form",
              docType
            )

          )

          .forEach(childField=>{

            const childWrap =
              document.createElement(
                "div"
              )

            childWrap.className =
              "doc-group-item"

            const input =
              renderField({

                field:childField,
                row,
                state

              })

            setRowInput(
              row,
              childField.key,
              input
            )

            if(childField.type === "checkbox"){

              const text =
                document.createElement(
                  "span"
                )

              text.textContent =
                childField.label || ""

              childWrap.append(
                input,
                text
              )

            }else{

              const label =
                document.createElement("label")

              label.className =
                "doc-field-label"

              label.textContent =
                childField.label || ""

              childWrap.append(
                label,
                input
              )

            }

            groupWrap.appendChild(
              childWrap
            )

          })

        div.appendChild(
          groupWrap
        )

        /* =========================================
        INLINE DOCUMENT ACTIONS
        ========================================= */

        if(field.inlineActions){

          const actionsWrap =
            document.createElement("div")

          actionsWrap.className =
            "doc-inline-actions"

          getVisibleActions(schema)

            .forEach(action=>{

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

              actionsWrap.appendChild(
                btn
              )

            })

          div.appendChild(
            actionsWrap
          )

        }

        if(field.class === "payment-summary"){

          const header =
            root.querySelector(
              ".doc-header"
            )

          header?.appendChild(div)

        }else{

          wrap.appendChild(div)

        }

        return

      }

      /* =================================================
      LABEL
      ================================================= */

      const label =
        document.createElement("label")

      label.className =
        "doc-field-label"

      label.textContent =
        field.label || ""

      /* =================================================
      INPUT ROW
      ================================================= */

      const rowWrap =
        document.createElement("div")

      rowWrap.className =
        "doc-form-input-row"

      /* =================================================
      INPUT
      ================================================= */

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

      rowWrap.appendChild(input)

      /* =================================================
      LOOKUP ACTION BUTTON
      ================================================= */

      if(field.action){

        const btn =
          document.createElement(
            "button"
          )

        btn.type = "button"

        btn.className =
          "doc-lookup-add-btn"

        btn.textContent =
          field.action.icon || "+"

        btn.dataset.event =
          field.action.event

        btn._input = input

        rowWrap.appendChild(btn)

      }

      /* =================================================
      APPEND
      ================================================= */

      div.append(
        label,
        rowWrap
      )

      wrap.appendChild(div)

    })

}

/* =========================================================
COMPUTED
========================================================= */

export function updateComputedForm(
  root,
  schema,
  state
){

  const fields =
    schema.form.fields.flatMap(
      field =>
        field.type === "group"
          ? field.fields || []
          : [field]
    )

  fields.forEach(field=>{

    if(!field.computed){
      return
    }

    let value = 0

    /* =================================================
    SUM THANHTIEN
    ================================================= */

    if(
      field.formula ===
      "sum(thanhtien)"
    ){

      value =
        state.items.reduce(

          (a,b)=>

            a +

            Number(
              b.thanhtien || 0
            ),

          0

        )

    }

    /* =================================================
    SUM TIENVON
    ================================================= */

    if(
      field.formula ===
      "sum(tienvon)"
    ){

      value =
        state.items.reduce(

          (a,b)=>

            a +

            Number(
              b.tienvon || 0
            ),

          0

        )

    }

    /* =================================================
    FINAL TOTAL
    ================================================= */

    if(
      field.formula ===
      "tongtien - chietkhau + thue"
    ){

      value =

        Number(
          state.header.tongtien || 0
        )

        -

        Number(
          state.header.chietkhau || 0
        )

        +

        Number(
          state.header.thue || 0
        )

    }

    /* =================================================
    SAVE
    ================================================= */

    state.header[
      field.key
    ] = value

    /* =================================================
    INPUT
    ================================================= */

    root
      .querySelectorAll(
        `[data-key="${field.key}"]`
      )
      .forEach(input => {
        input.value = formatMoney(value)
      })

  })
  
}

/* =========================================================
MONEY
========================================================= */

function formatMoney(v){

  return Number(v || 0)
    .toLocaleString("vi-VN")

}