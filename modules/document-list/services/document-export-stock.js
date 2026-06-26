export async function exportStockDocument(ctx){

  const row =
    ctx.row

  if(
    row?.status ===
    "posted"
  ){

    alert(
      "Chứng từ đã ghi sổ"
    )

    return
  }

  const id =
    ctx.ids?.[0]

  if(!id) return

  location.hash = `
    /document/form
    ?type=EXPORT
    &id=${id}
  `.replace(/\s+/g,"")

}