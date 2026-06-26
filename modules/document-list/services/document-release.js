export async function openReleasePage(ctx){

  const ids =
    ctx.ids || []

  localStorage.setItem(
    "release_ids",
    JSON.stringify(ids)
  )

  window.open(
    "/modules/document-list/services/release/release.html",
    "_blank"
  )

}