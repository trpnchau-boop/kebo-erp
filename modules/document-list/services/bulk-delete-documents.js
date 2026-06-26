import {
  deleteRow
}
from "/js/crud.js"

export async function bulkDeleteDocuments(ctx){

  if(!ctx.ids?.length)
    return

  const ok = confirm(
    `Xóa ${ctx.ids.length} chứng từ?`
  )

  if(!ok) return

  await Promise.all(

    ctx.ids.map(id=>

      deleteRow(
        ctx.table,
        id
      )

    )

  )

  await ctx.reload()

}