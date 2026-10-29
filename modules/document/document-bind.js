
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
GET XML MODE
========================================================= */

function getXmlMode(state){

  const docType =
    String(
      state?.docType ||
      state?.header?.type ||
      state?.schema?.type ||
      ""
    ).toUpperCase()

  if(
    state?.xmlPreview === true ||
    docType === "XML_PREVIEW"
  ){

    return "preview"

  }

  if(
    state?.xmlIn === true ||
    docType === "XML_IN"
  ){

    return "incoming"

  }

  return null

}


/* =========================================================
PRESERVE XML ORIGINAL AMOUNT
========================================================= */

function preserveXmlAmount(
  row,
  xmlMode
){

  if(
    !row ||
    !xmlMode
  ){

    return

  }

  /*
  Lưu Thành tiền XML gốc.

  Chỉ khởi tạo một lần.
  Những lần sửa SL tiếp theo không ghi đè.
  */

  if(
    row._xmlThanhtien === undefined ||
    row._xmlThanhtien === null
  ){

    row._xmlThanhtien =
      Number(row.thanhtien) || 0

  }

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
  XML ORIGINAL AMOUNT

  Khởi tạo trước khi người dùng sửa input.
  ===================================================== */

  const xmlMode =
    getXmlMode(state)

  preserveXmlAmount(
    row,
    xmlMode
  )


  /* =====================================================
  INIT INPUT VALUE
  ===================================================== */

  setFieldValue(
    input,
    field,
    row,
    state
  )


  /* =====================================================
  COMPUTED
  ===================================================== */

  if(
    field.computed &&
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

      /* =====================================
      XML PREVIEW PRODUCT CODE
      ===================================== */

      if(
        state?.xmlPreview === true &&
        key === "product_code"
      ){

        return

      }


      /* =====================================
      GET INPUT VALUE
      ===================================== */

      const value =
        getFieldValue(
          input,
          field
        )

      row[key] =
        value


      /* =====================================
      LOOKUP / SELECT MAPPING
      ===================================== */

      if(
        (
          field.type === "lookup" ||
          field.type === "select"
        ) &&
        field.mapping &&
        field.source
      ){

        const rows =
          await loadRef(
            field.source.table
          )

        const found =
          rows.find(
            r =>
              String(
                r[field.source.value]
              ) ===
              String(value)
          )

        if(found){

          Object.entries(
            field.mapping
          ).forEach(
            ([targetKey,sourceKey])=>{

              const mappedValue =
                found[sourceKey]

              row[targetKey] =
                mappedValue ?? ""

            }
          )

        }

      }


      /* =====================================
      LOOKUP TEXT
      ===================================== */

      if(
        field.type === "lookup"
      ){

        row[key + "_text"] =
          input.value || ""

      }


      /* =====================================
      PRODUCT CHANGED
      ===================================== */

      if(
        key === "id_product"
      ){

        row.id_unit = ""

        row.unit_name =
          row.dvtGoc || ""

        row.ratio = 1

      }


      /* =====================================
      UNIT CHANGED
      ===================================== */

      if(
        key === "id_unit"
      ){

        if(!row.id_unit){

          row.unit_name =
            row.dvtGoc ||
            row.unit_name ||
            ""

          row.ratio = 1

        }else{

          await syncRowRatio(
            input,
            row
          )

        }

      }


      /* =====================================
      PRESERVE XML ORIGINAL AMOUNT

      Bảo đảm giá trị gốc tồn tại trước compute.
      ===================================== */

      preserveXmlAmount(
        row,
        xmlMode
      )


      /* =====================================
      COMPUTE ROW

      XML_PREVIEW:
      - Thành tiền giữ nguyên theo XML
      - SL thay đổi -> Đơn giá thay đổi

      XML_IN:
      - Thành tiền giữ nguyên theo XML
      - SL thay đổi -> Đơn giá thay đổi
      - Giữ nguyên giá vốn đã lưu
      ===================================== */

      computeTableRow(
        state.schema,
        row,
        key,
        {
          xmlPreview:
            xmlMode === "preview",

          xmlIn:
            xmlMode === "incoming"
        }
      )


      /* =====================================
      PRESERVE ROOT UNIT
      ===================================== */

      preserveRootUnit(
        row
      )


      /* =====================================
      SYNC ROW UI
      ===================================== */

      await syncInputs({
        schema: state.schema,
        target: row,
        scope: getRowScope(
          row,
          state
        )
      })


      /* =====================================
      COMPUTE HEADER
      ===================================== */

      computeHeader(
        state.schema,
        state
      )


      /* =====================================
      SYNC HEADER UI
      ===================================== */

      await syncInputs({
        schema: state.schema,
        target: state.header,
        scope: "header"
      })


      /* =====================================
      UPDATE SUMMARY
      ===================================== */

      updateSummaryBar(
        state.root
      )

    }
  )

}
