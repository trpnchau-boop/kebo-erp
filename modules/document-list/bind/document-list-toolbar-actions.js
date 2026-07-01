// modules/document-list/document-list-toolbar-actions.js

import {
  openTab
} from "/js/tabs.js"

import {
  BULK_ACTION_MAP
} from "../actions/bulk/bulk-action-map.js"


/* =========================================================
RENDER
========================================================= */

export function renderToolbarActions(
  container,
  schema
){
  if(!container) return

  const primary =
    schema.primaryAction

  const actions =
    schema.actions || []

  container.innerHTML = `
    <div class="bar">
      ${
        primary
        ? `
          <button
            class="btn-add"
            data-primary-action="${primary.key}"
            type="button"
          >
            ${primary.label}
          </button>
        `
        : ""
      }

      ${
        actions.length
        ? `
          <div class="dropdown-menu action-menu">
            <button
              class="dropdown-trigger action-trigger"
              type="button"
            >
              <img
                src="/icons/menu-dots.svg"
                alt=""
              >
            </button>

            <div class="dropdown-panel action-dropdown">
              ${actions.map(action=>`
                <button
                  class="dropdown-item action-item"
                  data-action="${action.key}"
                  type="button"
                >
                  ${action.label}
                </button>
              `).join("")}
            </div>
          </div>
        `
        : ""
      }
    </div>
  `
}

/* =========================================================
BIND
========================================================= */

export function bindToolbarActions(ctx){

  const { container } = ctx

  if(!container) return

  // bind theo từng tab list, không bind global
  if(container._toolbarBound) return
  container._toolbarBound = true

  container.addEventListener(
    "click",
    async e => {

      /* ---------------------
      PRIMARY
      --------------------- */

      const primaryBtn =
        e.target.closest(
          "[data-primary-action]"
        )

      if(primaryBtn){
        await handlePrimaryAction(ctx)
        return
      }

      /* ---------------------
      BULK ACTION
      --------------------- */

      const actionItem =
        e.target.closest(
          ".action-item"
        )

      if(actionItem){

        handleBulkAction({
          ...ctx,
          action:
            actionItem.dataset.action
        })

        actionItem
          .closest(".action-menu")
          ?.classList.remove("open")

        return
      }

      /* ---------------------
      FILTER
      --------------------- */

      const filterItem =
        e.target.closest(
          "[data-status]"
        )

      if(filterItem){

        ctx.status =
          filterItem.dataset.status

        ctx.reload()

        filterItem
          .closest(".filter-menu")
          ?.classList.remove("open")

        return
      }

    }
  )

}

/* =========================================================
PRIMARY
========================================================= */

async function handlePrimaryAction(ctx){

  const {
    schema,
    type
  } = ctx

  const route =
    schema?.primaryAction?.route

  if(!route){

    console.warn(
      "Primary route not found"
    )

    return
  }

  // ví dụ type = "SALE" hoặc "SALE,EXPORT"
  const docType =
    (type || "SALE")
    .split(",")[0]
    .trim()

  // route kiểu "document"
  const page =
    route.split("/")[0] || "document"

  // mỗi loại 1 tab "new"
  const tabId =
    `document-${docType}-new`

  await openTab(
    tabId,
    `CT ${docType}`,
    page,
    {
      type: docType
    }
  )

}

/* =========================================================
BULK
========================================================= */

function handleBulkAction(ctx){

  ctx.ids =
    ctx.selection.getIds()

  const fn =
    BULK_ACTION_MAP[
      ctx.action
    ]

  if(!fn){

    console.warn(
      "Bulk action not found:",
      ctx.action
    )

    return

  }

  fn(ctx)

}