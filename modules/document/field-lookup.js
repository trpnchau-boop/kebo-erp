import {
  createSuggestBox,
  renderSuggest,
  clearSuggest
}
from "../../js/suggest.js"

import {computeTableRow}
from "./document-compute.js"

import {computeHeader}
from "./document-compute-header.js"

import {syncInputs}
from "./document-sync-inputs.js"

import {
  resolveProductPrice,
  getKhMoneyList
}
from "../kh-money/kh-money-api.js"

import {loadRef}
from "/js/relation-cache.js"

import {
  getLastCustomerPrice
}
from "../kh-money/kh-money-history.js"

import {
  getRowInputs
}
from "./document-input-map.js"

import {
  updateSummaryBar
}
from "./document-summary-bar.js"

/* =========================================================
DISPLAY NAME
========================================================= */

function buildDisplayName(
  display = [],
  data = {}
){

  return display

    .map(key =>
      data[key]
    )

    .filter(Boolean)

    .join(" - ")

}

function normalizeSearch(text){

  return String(text || "")

    .normalize("NFD")

    .replace(/[\u0300-\u036f]/g,"")

    .replace(/đ/g,"d")
    .replace(/Đ/g,"D")

    .toLowerCase()

    .replace(/\s+/g," ")

    .trim()

}

function matchSearch({

  data,

  keyword,

  fields = []

}){

  const tokens =

    normalizeSearch(keyword)

      .split(" ")

      .filter(Boolean)

  if(!tokens.length){

    return true

  }

  return fields.some(key=>{

    const text =

      normalizeSearch(

        data[key]

      )

    return tokens.every(token=>

      text.includes(token)

    )

  })

}

function applyMapping({
  mapping = {},
  source = {},
  target = {}
}){

  Object.entries(mapping)

    .forEach(([key,value])=>{

      if(
        typeof value ===
        "function"
      ){

        target[key] =
          value(source)

        return

      }

      target[key] =
        source[value]

    })

}

/* =========================================================
LOOKUP FIELD
========================================================= */

export function createLookupField(
  field,
  row = {},
  state
){

  const input =
    document.createElement(
      "input"
    )

  input.type = "text"

  input.dataset.field =
    field.key

  input.placeholder =
    field.placeholder || ""

  /* =====================================================
  INIT VALUE
  ===================================================== */

  input.dataset.value =
    row[field.key] || ""

  input.value =
    row[field.key + "_text"]
    ||
    ""

  /* =====================================================
  SUGGEST BOX
  ===================================================== */

  let box = null

queueMicrotask(()=>{
  requestAnimationFrame(()=>{
    box = createSuggestBox(input)
  })
})

  /* =====================================================
  INPUT
  ===================================================== */

  input.addEventListener(
    "input",

    async ()=>{

      input.dataset.value = ""
      row[field.key] = ""
      row[field.key + "_text"] = ""

      const keyword =
        String(input.value || "")
          .trim()

      /* =================================================
      EMPTY
      ================================================= */

    if(!keyword){

      if(box){
        clearSuggest(box)
      }

      input.dataset.value = ""

      row[field.key] = ""
      row[field.key + "_text"] = ""

      if(field.mapping){
        Object.keys(field.mapping)
          .forEach(targetKey=>{
            row[targetKey] = ""
          })
      }

      computeTableRow(
        state.schema,
        row,
        field.key
      )

      computeHeader(
        state.schema,
        state
      )

await syncInputs({
  schema: state.schema,
  target: row,
  scope:
    row === state.draftRow
      ? "draft"
      : "row"
})

      await syncInputs({
        schema: state.schema,
        target: state.header,
        scope: "header"
      })

      updateSummaryBar(state.root)

      return
     }

      const rows =
        await loadRef(
          field.source.table
        )

      const filtered =

        rows.filter(data =>

          matchSearch({
            data,
            keyword,
            fields:
              field.source.search
          })

        )

      /* =================================================
      BUILD LIST
      ================================================= */

      const list =

        filtered.map(data=>({

          label:
            buildDisplayName(
              field.source.display,
              data
            ),

          data

        }))

      /* =================================================
      EMPTY LIST
      ================================================= */

      if(!list.length){

        if(box){
          clearSuggest(box)
        }

        return

      }

      /* =================================================
      WAIT BOX
      ================================================= */

      if(!box){
        return
      }

      /* =================================================
      RENDER
      ================================================= */

      renderSuggest(

        box,

        list,

        async item=>{

          const data =
            item.data || {}

          const displayName =
            item.label || ""

          /* =============================================
          INPUT UI
          ============================================= */

          input.dataset.value =
            data[field.source.value]
            || ""

          input.value =
            displayName

          if(box){
            clearSuggest(box)
          }

          /* =============================================
          STATE
          ============================================= */

          row[field.key] =
            data[
              field.source.value
            ]
            ||
            ""

          row[field.key + "_text"] =
            displayName

          /* =============================================
          LOOKUP MAPPING
          ============================================= */

          applyMapping({
            mapping:
              field.mapping,
            source:data,
            target:row
          })

          row.product_code =
            `${Number(data.giavon || 0).toLocaleString()} - ${data.code}`
          /* =============================================
          PRODUCT CHANGED
          - nếu lookup hiện tại là id_product
          - luôn reset đơn vị về ĐVT gốc của sản phẩm mới
          - id_unit = "" để table vẫn coi là đang dùng ĐVT gốc
          ============================================= */

          if(field.key === "id_product"){
            
            row.id_unit = ""
            row.unit_name =
              row.dvtGoc || ""
            row.ratio = 1
          }
          /* =============================================
          AUTO PRICE
          ============================================= */

          if(field.autoPrice){

            const dongiaField =

              state.schema
                .table
                .columns

                .find(col=>

                  col.key ===
                  "dongia"

                )

            const options = []

            /* =========================================
            PRICE SOURCES
            ========================================= */

            if(
              dongiaField
              ?.priceSources
            ){

              for(
                const source
                of dongiaField.priceSources
              ){

                /* =====================================
                HISTORY
                ===================================== */

                if(
                  source.type ===
                  "history"
                ){

                  const value =

                    await getLastCustomerPrice({

                      customerId:
                        state.header
                        ?.id_customer,

                      productId:
                        data.id

                    })

                  if(value){

                    options.push({

                      type:"history",

                      label:"Giá cũ",

                      value:
                        Number(
                          value || 0
                        )

                    })

                  }

                }

                /* =====================================
                POLICY
                ===================================== */

                if(
                  source.type ===
                  "policy"
                ){

                  const value =

                    await resolveProductPrice({

                      customerType:
                        state.header
                        ?.customer_type,

                      product:data

                    })

                  options.push({

                    type:"policy",

                    label:
                      "Giá loại KH",

                    value:
                      Number(
                        value || 0
                      )

                  })

                }

                /* =====================================
                FALLBACK
                ===================================== */

                if(
                  source.type ===
                  "fallback"
                ){

                  const khList =
                    await getKhMoneyList()

                  const customerType =

                    state.header
                    ?.customer_type

                  const found =

                    khList.find(item=>

                      String(
                        item.khachhang
                      )

                      ===

                      String(
                        customerType
                      )

                    )

                  const fallbackField =
                    found?.fallback

                  if(
                    fallbackField
                  ){

                    const value =

                      Number(

                        data?.[
                          fallbackField
                        ]

                        || 0

                      )

                    options.push({

                      type:"fallback",

                      label:"Fallback",

                      value

                    })

                  }

                }

              }

            }

            /* =========================================
            SAVE OPTIONS
            ========================================= */

            row.dongia_options =

              options.map(item=>({

                label:
                  `${item.label} • ${
                    Number(
                      item.value || 0
                    ).toLocaleString()
                  }`,

                value:
                  Number(
                    item.value || 0
                  )

              }))

            /* =========================================
            DEFAULT PRICE
            ========================================= */

            row.dongia =

              Number(
                options?.[0]
                ?.value
                || 0
              )

            /* =========================================
            SYNC UI
            ========================================= */

            computeTableRow(
              state.schema,
              row,
              field.key
            )

            await syncInputs({
              schema: state.schema,
              target: row,
              scope:
                row === state.draftRow
                ? "draft"
                : "row"
            })

            /* =========================================
            PRICE SUGGEST
            ========================================= */

            const dongiaInput =

              getRowInputs(row)
                ?.dongia

            if(
              dongiaInput
              &&
              row.dongia_options?.length
            ){

              const suggestBox =
                createSuggestBox(
                  dongiaInput
                )

              renderSuggest(

                suggestBox,

                row.dongia_options.map(opt=>({

                  label:
                    opt.label,

                  value:
                    opt.value

                })),

                async picked=>{

                  row.dongia =

                    Number(
                      picked.value || 0
                    )

                  dongiaInput.value =
                    picked.value

                  computeTableRow(
                    state.schema,
                    row,
                    field.key
                  )

                  await syncInputs({
                    schema: state.schema,
                    target: row,
                    scope:
                      row === state.draftRow
                        ? "draft"
                        : "row"
                  })

                  clearSuggest(
                    suggestBox
                  )

                },
                {
                  autoSelectFirst:false
                }

              )

            }

          }

          /* =============================================
          COMPUTE
          ============================================= */

          computeTableRow(
            state.schema,
            row,
            field.key
          )

          computeHeader(
            state.schema,
            state
          )

          /* =============================================
          SYNC UI
          ============================================= */
          await syncInputs({
            schema: state.schema,
            target: row,
            scope:
              row === state.draftRow
                ? "draft"
                : "row"
          })

          await syncInputs({
            schema:
              state.schema,
            target:
              state.header,
            scope:"header"
          })

          updateSummaryBar(state.root)

        }

      )

    }

  )

  return input

}