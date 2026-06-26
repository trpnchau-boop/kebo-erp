//document-bind.js//

import {computeTableRow}
from "./document-compute.js"

import {computeHeader}
from "./document-compute-header.js"

import {syncInputs}
from "./document-sync-inputs.js"

import {
  setFieldValue,
  getFieldValue
}
from "./document-field-value.js"

import {
  syncRowRatio
}
from "./document-unit.js"

import {loadRef}
from "/js/relation-cache.js"

import {
  updateSummaryBar
}
from "./document-summary-bar.js"

/* =========================================================
PRESERVE ROOT UNIT
- nếu đang dùng ĐVT gốc (id_unit = "")
- luôn giữ unit_name = dvtGoc để input bar không mất label
========================================================= */

function preserveRootUnit(row){

  if(!row){
    return
  }

  if(!row.id_unit){

    if(!row.unit_name){
      row.unit_name =
        row.dvtGoc || ""
    }

    if(
      row.ratio === undefined
      ||
      row.ratio === null
      ||
      row.ratio === ""
      ||
      Number.isNaN(Number(row.ratio))
    ){
      row.ratio = 1
    }

  }

}

/* =========================================================
GET SYNC SCOPE
========================================================= */

function getRowScope(
  row,
  state
){

  return row === state.draftRow
    ? "draft"
    : "row"

}

/* =========================================================
BIND FIELD
========================================================= */

export function bindField(
  input,
  field,
  row,
  state
){

  const key =
    field.key

  /* =====================================================
  INIT VALUE
  ===================================================== */

  row[key] =
    row[key]
    ??
    field.default
    ??
    ""

  /* =====================================================
  INIT INPUT VALUE
  ===================================================== */

  setFieldValue(
    input,
    field,
    row
  )

  /* =====================================================
  COMPUTED
  ===================================================== */

  if(
    field.computed
    &&
    field.readonly !== false
  ){
    input.readOnly = true
  }

  /* =====================================================
  AVOID DUPLICATE BIND
  ===================================================== */

  if(
    input.dataset.bound === "1"
  ){
    return
  }

  input.dataset.bound = "1"

  /* =====================================================
  INPUT EVENT
  ===================================================== */

  input.addEventListener(
    "input",
    async ()=>{

      const value =
        getFieldValue(
          input,
          field
        )

      row[key] = value

      /* =================================================
      LOOKUP / SELECT MAPPING
      ================================================= */

      if(
        (
          field.type === "lookup"
          ||
          field.type === "select"
        )
        &&
        field.mapping
        &&
        field.source
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
            String(value)
          )

        if(found){

          Object.entries(field.mapping)
            .forEach(([targetKey,sourceKey])=>{

              const mappedValue =
                found[sourceKey]

              row[targetKey] =
                mappedValue ?? ""

            })

        }

      }

      /* =================================================
      LOOKUP TEXT
      ================================================= */

      if(
        field.type === "lookup"
      ){
        row[key + "_text"] =
          input.value || ""
      }

      /* =================================================
      PRODUCT CHANGED
      - luôn reset về ĐVT gốc
      - id_unit = "" để table hiển thị rỗng ở cột Đvt
      - unit_name vẫn giữ dvtGoc để input bar còn label
      ================================================= */

      if(
        key === "id_product"
      ){

        row.id_unit = ""
        row.unit_name =
          row.dvtGoc || ""
        row.ratio = 1

      }

      /* =================================================
      UNIT CHANGED
      ================================================= */

      if(
        key === "id_unit"
      ){

        if(!row.id_unit){

          /* đang dùng ĐVT gốc */
          row.unit_name =
            row.dvtGoc
            || row.unit_name
            || ""

        }

        syncRowRatio(
          input,
          row
        )

      }

      /* =================================================
      COMPUTE ROW
      ================================================= */

      computeTableRow(
        state.schema,
        row,
        key
      )

      /* =================================================
      PRESERVE ROOT UNIT
      - rất quan trọng:
      - sau compute/sync, nếu id_unit = ""
        thì vẫn phải giữ unit_name = dvtGoc
      ================================================= */

      preserveRootUnit(row)

      /* =================================================
      SYNC ROW UI
      ================================================= */

      await syncInputs({
        schema: state.schema,
        target: row,
        scope: getRowScope(
          row,
          state
        )
      })

      /* =================================================
      COMPUTE HEADER
      ================================================= */

      computeHeader(
        state.schema,
        state
      )

      /* =================================================
      SYNC HEADER UI
      ================================================= */

      await syncInputs({
        schema: state.schema,
        target: state.header,
        scope: "header"
      })

      updateSummaryBar(
        state.root
      )
    }
  )

}