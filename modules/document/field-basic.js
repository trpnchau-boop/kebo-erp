import {
  getKhMoneyList
}
from "../kh-money/kh-money-api.js"

import {loadRef}
from "/js/relation-cache.js"

import {
  loadUnitOptions
}
from "./document-unit.js"

import {
  createDocumentSelect
}
from "./document-select.js"

import {
  createDatepicker
}
from "/js/ui/init-datepicker.js"
/* =========================================================
CREATE BASIC FIELD
========================================================= */

export function createBasicField(
  field,
  row = {}
){

  let input

  /* =====================================================
  SELECT
  ===================================================== */

if(field.type === "select"){

const useNativeSelect =

  row?.[
    field.key + "_options"
  ]?.length

  input = useNativeSelect

    ? document.createElement(
        "select"
      )

    : createDocumentSelect()

    /* =================================================
    EMPTY OPTION
    ================================================= */

if(useNativeSelect){

  const empty =
    document.createElement(
      "option"
    )

  empty.value = ""

  empty.textContent = ""

  input.appendChild(
    empty
  )

}

    /* =================================================
    UNIT SELECT
    ================================================= */

    if(
      field.key === "id_unit"
    ){

      loadUnitOptions(row)
      .then(options=>{

        const selectOptions = [
          {
            value: "",
            label: row?.dvtGoc || "ĐVT gốc",
            ratio: 1,
            isRoot: true
          },
          ...options.map(opt=>({
            value: opt.value,
            label: opt.label,
            ratio: opt.ratio || 1,
            isRoot: Boolean(opt.isRoot)
          }))
        ]

        if(input.setOptions){

          input.setOptions(
            selectOptions
          )

        }else{

          selectOptions.forEach(opt=>{

            const el =
              document.createElement(
                "option"
              )

            el.value =
              opt.value

            el.textContent =
              opt.label

            el.dataset.ratio =
              opt.ratio

            el.dataset.root =
              opt.isRoot
                ? "1"
                : "0"

            input.appendChild(
              el
            )

          })

        }

        input.value =
          row?.[field.key] ?? ""

      })

    }

    /* =================================================
    TABLE SOURCE
    ================================================= */

else if(
  field.source?.table
){

  loadRef(
    field.source.table
  )

  .then(rows=>{

    const options =

      rows.map(data=>({

        value:

          data[
            field.source.value
          ]

          ??

          "",

        label:

          data[
            field.source.label
          ]

          ??

          data[
            field.source.value
          ]

      }))

    if(input.setOptions){

      input.setOptions(
        options
      )

    }else{

      options.forEach(opt=>{

        const el =
          document.createElement(
            "option"
          )

        el.value =
          opt.value

        el.textContent =
          opt.label

        input.appendChild(
          el
        )

      })

    }

    input.value =

      row?.[field.key]

      ??

      ""

  })

}

    /* =================================================
DYNAMIC OPTIONS
================================================= */

else if(

  row?.[
    field.key + "_options"
  ]?.length

){

  const options =

    row[
      field.key + "_options"
    ]

    .map(opt=>({

      value:
        opt.value,

      label:

        opt.label

        ??

        opt.value

    }))

  if(input.setOptions){

    input.setOptions(
      options
    )

  }else{

    options.forEach(opt=>{

      const el =
        document.createElement(
          "option"
        )

      el.value =
        opt.value

      el.textContent =
        opt.label

      input.appendChild(
        el
      )

    })

  }

  input.value =

    row?.[field.key]

    ??

    ""

}

    /* =================================================
    STATIC OPTIONS
    ================================================= */

else{

  const options =

    (field.options || [])

    .map(opt=>{

      if(
        typeof opt === "object"
      ){

        return {

          value:
            opt.value,

          label:
            opt.label
            ??
            opt.value

        }

      }

      return {

        value: opt,

        label: opt

      }

    })

  if(useNativeSelect){

    options.forEach(opt=>{

      const el =
        document.createElement(
          "option"
        )

      el.value =
        opt.value

      el.textContent =
        opt.label

      input.appendChild(
        el
      )

    })

  }else{

    input.setOptions(
      options
    )

  }

  input.value =

    row?.[field.key]

    ??

    ""

}
return input
  }

  /* =====================================================
  CHECKBOX
  ===================================================== */

  else if(
    field.type === "checkbox"
  ){

    input =
      document.createElement(
        "input"
      )

    input.type =
      "checkbox"

    input.checked = Boolean(

      row[field.key]

      ??

      field.default

    )

    return input

  }

  /* =====================================================
  DEFAULT INPUT
  ===================================================== */

  else{

    input =
      document.createElement(
        "input"
      )

    input.type =

      field.type === "date"

      ? "text"

      :

      field.type === "number"

      ||

      field.type === "money"

      ? "number"

      :

      "text"

  }

  /* =====================================================
  INPUT VALUE
  ===================================================== */

  if(
    field.type !== "select"
  ){

    input.value =

      row[field.key]

      ??

      field.default

      ??

      ""

  }

  /* =====================================================
  PLACEHOLDER
  ===================================================== */

  input.placeholder =

    field.placeholder

    ||

    ""

  /* =====================================================
  READONLY
  ===================================================== */

  if(

    field.readonly

    ||

    field.computed

  ){

    input.readOnly = true

  }

  if(field.type === "date"){
  createDatepicker(input)
}

  /* =====================================================
  DATA KEY
  ===================================================== */

  input.dataset.key =
    field.key

  return input

}