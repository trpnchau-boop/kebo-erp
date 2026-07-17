// modules/document/actions/show-sale-preview.js

import {
  loadDocuments
}
from "../../document-list/document-list-load.js"

import {
  printDocument
}
from "../../document-list/services/bulk-print-documents.js"

import {
  editDocument
}
from "../../document-list/services/document-edit.js"

/* =========================================================
STATE
========================================================= */

let activePopup = null
let hideTimer = null

/* =========================================================
SHOW SALE PREVIEW
========================================================= */

export async function showSalePreview(
  event
){

  const button =
    event.button

  if(!button){
    return
  }

  /* =======================================================
  REMOVE OLD
  ======================================================= */

  if(activePopup){

    activePopup.remove()

    activePopup = null

  }

  /* =======================================================
  POPUP
  ======================================================= */

  const popup =
    document.createElement(
      "div"
    )

  activePopup = popup

  popup.id =
    "sale-preview-popup"

  popup.className =
    "sale-preview-popup"

  popup.innerHTML = `

    <div
      class="
        sale-preview-table-wrap
      "
    >

      <table
        class="
          doc-table
          compact
          sale-preview-table
        "
      >

        <thead
          id="sale-preview-head"
        >
        </thead>

        <tbody
          id="sale-preview-body"
        >
        </tbody>

      </table>

    </div>

  `

  document.body.append(
    popup
  )

  /* =======================================================
  POSITION
  ======================================================= */

  const rect =
    button.getBoundingClientRect()

    popup.style.left =
      `${rect.left}px`
 
  /* =======================================================
  HIDE
  ======================================================= */

  function cancelHide(){

    clearTimeout(
      hideTimer
    )

  }

  function scheduleHide(){

    clearTimeout(
      hideTimer
    )

    hideTimer =
      setTimeout(()=>{

        popup.remove()

        if(
          activePopup === popup
        ){

          activePopup = null

        }

      },120)

  }

  /* =======================================================
  HOVER
  ======================================================= */

  button.addEventListener(
    "mouseenter",
    cancelHide
  )

  button.addEventListener(
    "mouseleave",
    scheduleHide
  )

  popup.addEventListener(
    "mouseenter",
    cancelHide
  )

  popup.addEventListener(
    "mouseleave",
    scheduleHide
  )

  /* =======================================================
  LOAD
  ======================================================= */

  const rows =
    await loadDocuments({

      schema:{

        list:[

          "code",
          "id_customer",
          "tongthanhtoan"

        ]

      },

      types:["SALE"]

    })

  /* =======================================================
  HEAD
  ======================================================= */

  popup.querySelector(
    "#sale-preview-head"
  ).innerHTML = `

    <tr>

      <th
        class="
          sale-col-code
        "
      >
        Số CT
      </th>

      <th>
        Tên KH
      </th>

      <th
        class="
          sale-col-money
        "
      >
        Thanh toán
      </th>

      <th
        class="
          sale-col-action
        "
      >
      </th>

    </tr>

  `

  /* =======================================================
  BODY
  ======================================================= */

  const tbody =
    popup.querySelector(
      "#sale-preview-body"
    )

  tbody.innerHTML = ""

  /* =======================================================
  EMPTY
  ======================================================= */

  if(!rows?.length){

    tbody.innerHTML = `

      <tr>

        <td
          colspan="4"
          class="
            sale-preview-empty
          "
        >

          Không có dữ liệu

        </td>

      </tr>

    `

    return

  }

  /* =======================================================
  RENDER ROWS
  ======================================================= */

  for(
    const row of rows.slice(0,20)
  ){

    const tr =
      document.createElement(
        "tr"
      )

    tr.innerHTML = `

      <td>

        <a
          href="#"
          class="sale-preview-open"
          data-id="${row.id}"
          data-code="${row.code || ""}"
        >

          ${row.code || ""}

        </a>

      </td>

      <td>

        ${row.id_customer_text || ""}

      </td>

      <td
        class="
          sale-preview-money
        "
      >

        ${Number(
          row.tongthanhtoan || 0
        ).toLocaleString()}

      </td>

      <td>

        <button
          class="icon-btn print button-print-sale"
          data-id="${row.id}"
          title="In"
        ></button>

      </td>

    `

    tbody.append(
      tr
    )

  }

  /* =======================================================
  EVENTS
  ======================================================= */

  tbody.onclick =
    async e=>{

      /* ===================================================
      OPEN
      =================================================== */

      const openLink =
        e.target.closest(
          ".sale-preview-open"
        )

      if(openLink){

        e.preventDefault()

        popup.remove()

        activePopup = null

        const id =
          Number(
            openLink.dataset.id
          )

        await editDocument({

          ids:[id],

          type:"SALE",

          row:{

            code:
              openLink.dataset.code

          }

        })

        return

      }

      /* ===================================================
      PRINT
      =================================================== */

      const printButton =
        e.target.closest(
          ".button-print-sale"
        )

      if(!printButton){
        return
      }

      const id =
        Number(
          printButton.dataset.id
        )

      await printDocument({

        ids:[id],

        type:"SALE"

      })

    }

}