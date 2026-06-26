// modules/document/actions/print-document.js

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

export async function printDocument({

  document,
  items = []

}){

  if(!document){

    alert("Document missing")
    return
  }

  /* =====================================================
  DOCUMENT TYPE
  ====================================================== */

  const type =
    String(
      document.document_type ||
      document.type ||
      "SALE"
    ).toUpperCase()


  /* =====================================================
  LOAD TEMPLATE
  ====================================================== */

  const templates =
    await getAll(
      "print_templates",
      {
        type_code:type
      }
    )

  const template =
    templates?.[0]

  if(!template){

    alert(
      `Template not found: ${type}`
    )

    return
  }

  /* =====================================================
  COMPANY
  ====================================================== */

  const companies =
    await getAll("set_company")

  const company =
    companies?.[0] || {}

  /* =====================================================
  PRINT DOCUMENT
  ====================================================== */

  const printDocument = {

    ...document,

    company
  }

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

  /* =====================================================
  HTML
  ====================================================== */

  const html =
    getPrintHtml({

      template:printTemplate,

      document:printDocument,

      items
    })

  /* =====================================================
  PRINT
  ====================================================== */

  openPrintWindow(html)
}