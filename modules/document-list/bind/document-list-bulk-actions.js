import { BULK_ACTION_MAP }
from "../actions/bulk/bulk-action-map.js"

export function bindBulkActions(ctx){

  const {
    root
  } = ctx

  root.addEventListener(
    "click",
    e=>{

      const btn =
        e.target.closest(
          "[data-bulk-action]"
        )

      if(!btn) return

      const ids =
        ctx.selection.getIds()

      if(!ids.length){

        alert("Chưa chọn chứng từ")

        return

      }

      const action =
        btn.dataset.bulkAction

      BULK_ACTION_MAP[
        action
      ]?.({

        ...ctx,

        ids

      })

    }
  )

}