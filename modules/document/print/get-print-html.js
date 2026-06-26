// modules/document/print/get-print-html.js

import {
  getPrintContent
}
from "./get-print-content.js"

export function getPrintHtml({

  template,
  document,
  items = []

}){

  const content =

    getPrintContent({
  
      template,
      document,
      items

    })

  return `

    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8">

      <title>Print</title>

      <link
        rel="stylesheet"
        href="/modules/document/print/print.css"
      >

    </head>

    <body>

      <div class="print-page">

        ${content}

      </div>

    </body>

    </html>
  `
}