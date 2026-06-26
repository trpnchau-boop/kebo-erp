// services/document-edit.js

import {
  openTab
}
from "../../../js/tabs.js"

export async function editDocument(
  ctx
){

  /* =========================
  ROW
  ========================= */

  const row =
    ctx.row

  /* =========================
  POSTED
  ========================= */

  if(
    row?.status ===
    "posted"
  ){

    alert(
      "Chứng từ đã ghi sổ"
    )

    return

  }

  /* =========================
  ID
  ========================= */

  const id =
    ctx.ids?.[0]

  if(!id){

    console.warn(
      "Missing id"
    )

    return

  }

  /* =========================
  TAB
  ========================= */

  const tabId =

    `document-${ctx.type}-${id}`

  const title =

    row?.code ||

    `${ctx.type}-${id}`


  /* =========================
  OPEN TAB
  ========================= */

  await openTab(

    tabId,

    title,

    "document",

    {
      type:ctx.type,
      id
    }

  )

}