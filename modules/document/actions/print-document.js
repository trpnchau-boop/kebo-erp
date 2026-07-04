import {
  getAll
}
from "/js/crud.js"

import {
  getPrintHtml
}
from "/modules/document/print/get-print-html.js"

import {
  openPrintWindow
}
from "/modules/document/print/print-window.js"

import {
  reflowSections
}
from "/modules/print/layout/reflow-sections.js"

import {
  DOCUMENT_TYPES
}
from "/modules/document/document-types.js"

import {
  loadPrintData
}
from "/modules/document/print/load-print-data.js"

export async function printDocument({

  id,
  type

}){

  if(!id){

    alert("Document missing")

    return

  }

  const typeCode =
    String(
      type || "SALE"
    ).toUpperCase()

  /* =====================================
  TEMPLATE
  ===================================== */

  const templates =
    await getAll(
      "print_templates",
      {
        type_code:typeCode}
    )

  const template =
    templates?.[0]

  if(!template){

    alert(
      `Template not found: ${typeCode}`
    )

    return

  }

  /* =====================================
  COMPANY
  ===================================== */

  const companies =
    await getAll(
      "set_company"
    )

  const company =
    companies?.[0] || {}

  const schema =
    DOCUMENT_TYPES[typeCode]

  if(!schema){

    alert(
      `Schema not found: ${typeCode}`
    )

  return

  }

  const {

    document,

    items

  } = await loadPrintData({

    id,

    schema,

    company,

    template

  })

  const printTemplate =
    structuredClone(
      template
    )

  reflowSections(

    printTemplate
      .template_json
      .sections,

    items.length

  )

  const html =
    getPrintHtml({

      template:printTemplate,

      document,

      items

    })

  openPrintWindow(
    html
  )

}