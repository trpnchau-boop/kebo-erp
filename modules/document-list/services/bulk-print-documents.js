import {
  DOCUMENT_TYPES
}
from "/modules/document/document-types.js"

import {
  loadPrintData
}
from "/modules/document/print/load-print-data.js"

import {
  getPrintContent
}
from "/modules/document/print/get-print-content.js"

import {
  openPrintWindow
}
from "/modules/document/print/print-window.js"

import {
  getAll
}
from "/js/crud.js"

export async function printDocument(ctx){

  const ids =
    ctx.ids || []

  if(!ids.length){

    alert("Chưa chọn chứng từ")

    return

  }

  const schema =

    DOCUMENT_TYPES[
      ctx.type
    ]

  if(!schema){

    alert(
      "Không tìm thấy schema"
    )

    return

  }

  /* =====================================
  TEMPLATE
  ===================================== */

  const templates =
    await getAll(
      "print_templates",
      {
        type_code:ctx.type
      }
    )

  const template =
    templates?.[0]

  if(!template){

    alert(
      `Template not found: ${ctx.type}`
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

  /* =====================================
  PAGES
  ===================================== */

  let pages = ""

  for(const id of ids){

    const {

      document,

      items

    } = await loadPrintData({

      id,
      schema,
      company

    })

    const content =
      getPrintContent({

        template,

        document,

        items

      })

    pages += `

      <div
        class="print-page"
      >

        ${content}

      </div>

    `

  }

  const html = `

    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8">

      <title>
        In chứng từ
      </title>

      <link
        rel="stylesheet"
        href="/modules/document/print/print.css"
      >

    </head>

    <body>

      ${pages}

    </body>

    </html>

  `

  openPrintWindow(
    html
  )

}