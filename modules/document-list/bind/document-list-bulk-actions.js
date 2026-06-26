import {BULK_ACTION_MAP} from "../actions/bulk/bulk-action-map.js"
import {getSelectedIds} from "./document-list-selection.js"

export function bindBulkActions(ctx){

  const {
    root,
    tbody
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
        getSelectedIds(
          tbody
        )

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