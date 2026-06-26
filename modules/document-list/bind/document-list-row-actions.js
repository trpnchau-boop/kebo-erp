// bind/document-list-row-actions.js

import {
  ROW_ACTION_MAP
}
from "../actions/row/row-action-map.js"

import {
  editDocument
}
from "../services/document-edit.js"

export function bindRowActions(ctx){

  const {tbody} = ctx

  if(!tbody) return

  if(tbody.__rowActionsBound)
    return
  
  tbody.__rowActionsBound = true

  tbody.addEventListener(
    "click",
    e=>{

      /* =====================
      CODE LINK
      ===================== */

      const link =
        e.target.closest(
          ".barcode-link"
        )

      if(link){

        e.preventDefault()

        const row =

          ctx.rows?.find(
            r=>
              Number(r.id)
              ===
              Number(
                link.dataset.editId
              )
          )

        editDocument({

          ...ctx,

          row,

          ids:[
            Number(
              link.dataset.editId
            )
          ]

        })

        return

      }

      /* =====================
      ROW ACTION
      ===================== */

      const btn =
        e.target.closest(
          "[data-row-action]"
        )

      if(!btn) return

      const action =
        btn.dataset.rowAction
        ?.trim()

      const fn =
        ROW_ACTION_MAP[action]

      if(!fn){

        console.warn(
          "Row action not found:",
          action
        )

        return

      }

      const row =
      
        ctx.rows?.find(
          r=>
            Number(r.id)
            ===
            Number(btn.dataset.id)
        )

      fn({

        ...ctx,

        row,

        ids:[
          Number(
            btn.dataset.id
          )
        ]

      })

    }
  )

}