import {
  getRowInputs
}
from "./document-input-map.js"

import {loadRef}
from "/js/relation-cache.js"

import {refreshUnitSelect}
from "./document-unit.js"

import {formatMoney}
from "/js/core/format.js"

/* =========================================================
SYNC INPUTS
========================================================= */

export async function syncInputs({
  schema,
  target,
  scope = "row"
}){

  const inputs =
    getRowInputs(target)

  if(!inputs){
    return
  }

  const formFields =
    flattenFields(
      schema.form?.fields || []
    )

  const tableFields =
    schema.table?.columns || []

  for(
    const [key,input]
    of Object.entries(inputs)
  ){

    /* =========================================
    FIELD
    ========================================= */

    const field =
      scope === "header"
        ? formFields.find(f => f.key === key)
        : tableFields.find(f => f.key === key)

    if(!field){
      continue
    }

    /* =========================================
    UNIT SELECT OPTIONS
    ========================================= */

    if(
      (
        scope === "row"
        ||
        scope === "draft"
      )
      &&
      key === "id_unit"
      &&
      (
        input.tagName === "SELECT"
        ||
        typeof input.setOptions === "function"
      )
    ){
      await refreshUnitSelect(
        input,
        target,
        scope === "draft"
          ? "input"
          : "table"
      )
    }

    /* =========================================
    RAW VALUE
    ========================================= */

    const rawValue =
      target[key]

    const textValue =
      target[key + "_text"]

    const hasRaw =
      rawValue !== undefined
      &&
      rawValue !== null
      &&
      rawValue !== ""

    const value =
      hasRaw
        ? (textValue ?? rawValue)
        : ""

    /* =========================================
    ACTIVE / OPEN CUSTOM SELECT
    ========================================= */

    const isCustomSelect =
      typeof input.setOptions === "function"

    const isSelectOpen =
      isCustomSelect
      &&
      input.classList?.contains("open")

    const isActive =
      document.activeElement === input
      ||
      input.contains?.(
        document.activeElement
      )
      ||
      isSelectOpen

    /* =========================================
    CHECKBOX
    ========================================= */

    if(
      input.type === "checkbox"
    ){
      input.checked =
        Boolean(rawValue)
      continue
    }

    /* =========================================
    LOOKUP EMPTY
    ========================================= */

    if(
      field.type === "lookup"
      &&
      !hasRaw
    ){
      if(!isActive){
        input.value = ""
        input.dataset.value = ""
      }
      continue
    }

    /* =========================================
    LOOKUP
    ========================================= */

    if(
      field.type === "lookup"
      &&
      field.source
      &&
      hasRaw
    ){
      const rows =
        await loadRef(
          field.source.table
        )

      const found =
        rows.find(r =>
          String(
            r[field.source.value]
          )
          ===
          String(rawValue)
        )

      if(found){

        const text =
          buildDisplayName(
            field.source.display,
            found
          )

        if(!isActive){
          input.dataset.value =
            rawValue

          input.value =
            text
        }

        target[key + "_text"] =
          text

        continue
      }
    }

    /* =========================================
    SELECT
    ========================================= */

    if(
      field.type === "select"
    ){

      if(!isActive){

        /* =====================================
        UNIT SELECT
        ===================================== */

        if(key === "id_unit"){

          /* -----------------------------------
          DRAFT / INPUT BAR
          - id_unit rỗng vẫn phải hiện unit_name
            hoặc dvtGoc
          ----------------------------------- */
          if(scope === "draft"){

            const draftValue =
              rawValue
              || target.id_unit
              || ""

            const draftLabel =
              target.unit_name
              || target.dvt
              || target.id_unit_text
              || target.dvtGoc
              || ""

            if(isCustomSelect){

              input.value =
                draftValue

              if(
                typeof input.setDisplayText
                === "function"
              ){
                if(draftValue){
                  input.setDisplayText(null)
                }else{
                  input.setDisplayText(
                    draftLabel
                  )
                }
              }

            }else{
              input.value =
                draftValue
            }

            applyPriceWarning(
              key,
              input,
              target
            )

            continue
          }

          /* -----------------------------------
          TABLE ROW
          - id_unit rỗng => cột Đvt phải rỗng
          ----------------------------------- */
          if(!rawValue){

            input.value = ""

            if(
              isCustomSelect
              &&
              typeof input.setDisplayText
                === "function"
            ){
              input.setDisplayText("")
            }

          }else{

            input.value =
              rawValue ?? ""

            if(
              isCustomSelect
              &&
              typeof input.setDisplayText
                === "function"
            ){
              input.setDisplayText(null)
            }

          }

          applyPriceWarning(
            key,
            input,
            target
          )

          continue
        }

        /* =====================================
        NORMAL SELECT
        ===================================== */

        input.value =
          rawValue ?? ""
      }

      applyPriceWarning(
        key,
        input,
        target
      )

      continue
    }

    /* =========================================
    MONEY
    ========================================= */

    if(
      field.type === "money"
    ){
      if(!isActive){
        input.value =
          formatMoney(
            Number(rawValue || 0)
          )
      }

      applyPriceWarning(
        key,
        input,
        target
      )

      continue
    }

    /* =========================================
    DEFAULT
    ========================================= */

    if(!isActive){
      input.value = value
    }

    applyPriceWarning(
      key,
      input,
      target
    )
  }
}

/* =========================================================
FLATTEN FIELDS
========================================================= */

function flattenFields(
  fields = []
){
  const result = []

  for(const field of fields){

    if(
      field.type === "group"
      &&
      Array.isArray(field.fields)
    ){
      result.push(
        ...flattenFields(
          field.fields
        )
      )
      continue
    }

    result.push(field)
  }

  return result
}

/* =========================================================
PRICE WARNING
========================================================= */

function applyPriceWarning(
  key,
  input,
  target
){

  if(
    key !== "dongia"
  ){
    return
  }

  const dongia =
    Number(
      target.dongia || 0
    )

  const giavon =
    Number(
      target.dongiavon || 0
    )

  if(
    dongia < giavon
  ){

    input.style.color =
      "#dc2626"

    input.style.borderColor =
      "#dc2626"

    input.style.fontWeight =
      "600"

  }else{

    input.style.color = ""
    input.style.background = ""
    input.style.borderColor = ""
    input.style.fontWeight = ""

  }
}

/* =========================================================
DISPLAY NAME
========================================================= */

function buildDisplayName(
  display = [],
  data = {}
){

  return display
    .map(key => data[key])
    .filter(Boolean)
    .join(" - ")
}