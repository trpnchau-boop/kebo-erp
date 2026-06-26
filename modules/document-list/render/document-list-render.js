// modules/document-list/document-list-render.js

import {
  documentFields
}
from "../schema/document-fields.js"

import { renderCell } from "./render-cell.js"
/* =========================================================
HEAD
========================================================= */

export function renderHead(
  thead,
  schema
){

  thead.innerHTML = `

    <tr>

      <!-- checkbox -->

      <th class="w-check">

        <input
          type="checkbox"
          id="check-all"
        >

      </th>

      <!-- fields -->

      ${

        schema.list

        .map(key=>{

          const field =
            documentFields[key]

          return `

            <th

              class="
                ${field?.align || ""}
              "

              style="
                width:${field?.width || "auto"}
              "
            >

              ${field?.label || key}

            </th>

          `

        })

        .join("")

      }

      <!-- row actions -->

      ${
        schema?.rowActions?.length
        ? `
        <th class="w-actions">
          
        </th>
        `
        : ""
      }

    </tr>

  `

}

/* =========================================================
ROWS
========================================================= */

export function renderRows(
  tbody,
  rows,
  schema
){

  /* =========================
  EMPTY
  ========================= */

  if(!rows?.length){

    tbody.innerHTML = `

      <tr class="empty-row">

        <td
          colspan="
            ${schema.list.length + 2}
          "
        >

          Không có dữ liệu

        </td>

      </tr>

    `

    return

  }

  /* =========================
  ROWS
  ========================= */

  tbody.innerHTML =

    rows.map(row=>`

      <tr
        data-id="${row.id}"

        class="
          ${
            row.status === "posted"
            ? "row-posted"
            : ""
          }
        "
      >

        <!-- checkbox -->

        <td class="row-check"
            data-label="Chọn" 
        >

          <input
            type="checkbox"

            class="row-checkbox"

            value="${row.id}"
          >

        </td>

        <!-- fields -->

        ${

          schema.list

          .map(key=>{

            const field =
              documentFields[key]

            return renderCell({

              row,
              key,
              field

            })  

          })

          .join("")

        }

        <!-- actions -->

      ${
        schema?.rowActions?.length

        ? `
          <td class="row-actions"
              data-label="Thao tác" >

          ${renderRowActions(
            row,
            schema
          )}

        </td>
        `
        : ""
        }

      </tr>

    `)

    .join("")

}

/* =========================================================
ROW ACTIONS
========================================================= */

function renderRowActions(
  row,
  schema
){

  const isPosted =
    row.status === "posted"

  const isPaid =

    Number(row.tongthanhtoan || 0)
    ===
    Number(row.tien_tt || 0)

  if(!schema?.rowActions)
    return ""

  return schema.rowActions

    .map(action=>{

      const cls =

        action.key === "remove"
          ? "row-btn icon-btn danger"

        : action.key === "print"
          ? "row-btn icon-btn print"

        : action.key === "payment"
          ? `
            row-btn
            ${
              isPaid
                ? "payment-green"
                : ""
            }
          `   
        : action.key === "post"
          ? `
            row-btn
            ${
              isPosted
                ? "post-orange"
                : ""
             }
          `
        : "row-btn"

      const isIcon =

        action.key === "remove" ||
        action.key === "print"  

      return `

        <button
          type="button"

          class="${cls}"

          data-row-action="${action.key}"

          data-id="${row.id}"
        >

          ${isIcon ? "" : action.label}

        </button>

      `

    })

    .join("")

}


export function renderBulkActions(
  container,
  schema
){

  if(!schema?.bulkActions)
    return

  container.innerHTML +=

    schema.bulkActions

    .map(action=>`

      <button
        class="bulk-btn"

        data-bulk-action="
          ${action.key}
        "
      >

        ${action.label}

      </button>

    `)

    .join("")

}