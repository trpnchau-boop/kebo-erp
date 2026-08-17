import { db } from "../supabase.js"
import { can } from "./permission.js"

/* =========================
BUILD CODE
========================= */

function buildPermissionCode(el){

  const page =
    el.dataset.page || ""

  const type =
    el.dataset.type || ""

  const table =
    el.dataset.table || ""

  return [
    "menu",
    page,
    type,
    table,
    "view"
  ]
    .filter(Boolean)
    .join(".")
}


/* =========================
SYNC MENU → PERMISSIONS
========================= */

export async function syncMenuPermissions(){

  const sidebarMenu =
    document.getElementById(
      "sidebar-menu"
    )

  if(!sidebarMenu){
    return
  }

  const links =
    [
      ...sidebarMenu.querySelectorAll(
        "a[data-page]"
      )
    ]

  const items = []

  for(const link of links){

    /* =========================
    CATALOG = LUÔN ĐƯỢC PHÉP
    ========================= */

    if(
      link.dataset.page === "catalog"
    ){
      continue
    }

    const code =
      buildPermissionCode(link)

    if(!code){
      continue
    }

    const name =
      "vw_" +
      link.textContent
        .trim()
        .replace(/\s+/g, " ")

    items.push({
      code,
      name
    })

  }

  if(!items.length){
    return
  }


  /* =========================
  UNIQUE
  ========================= */

  const uniqueItems =
    [
      ...new Map(
        items.map(
          item => [
            item.code,
            item
          ]
        )
      ).values()
    ]


  const codes =
    uniqueItems.map(
      item => item.code
    )


  /* =========================
  READ EXISTING
  ========================= */

  const {
    data,
    error
  } = await db
    .from("permissions")
    .select("id,code,name")
    .in("code", codes)

  if(error){

    console.error(
      "Lỗi đọc permissions:",
      error
    )

    return
  }


  const existing =
    new Map(
      (data || []).map(
        item => [
          item.code,
          item
        ]
      )
    )


  /* =========================
  INSERT MISSING
  ========================= */

  const missing =
    uniqueItems.filter(
      item =>
        !existing.has(
          item.code
        )
    )


  if(missing.length){

    const {
      error: insertError
    } = await db
      .from("permissions")
      .insert(missing)

    if(insertError){

      console.error(
        "Lỗi tạo menu permissions:",
        insertError
      )

      return
    }

  }


  /* =========================
  UPDATE NAME
  ========================= */

  for(const item of uniqueItems){

    const old =
      existing.get(
        item.code
      )

    if(!old){
      continue
    }

    if(old.name === item.name){
      continue
    }

    const {
      error: updateError
    } = await db
      .from("permissions")
      .update({
        name: item.name
      })
      .eq(
        "id",
        old.id
      )

    if(updateError){

      console.error(
        "Lỗi cập nhật tên permission:",
        item.code,
        updateError
      )

    }

  }

}
/* =========================
APPLY MENU PERMISSIONS
========================= */

export function applyMenuPermissions(){

  const sidebarMenu =
    document.getElementById(
      "sidebar-menu"
    )

  if(!sidebarMenu){
    return
  }


  /* =========================
  MENU LINKS
  ========================= */

  const links =
    [
      ...sidebarMenu.querySelectorAll(
        "a[data-page]"
      )
    ]


  for(const link of links){

    /* =========================
    CATALOG = LUÔN HIỆN
    ========================= */

    if(
      link.dataset.page === "catalog"
    ){

      link.style.display = ""

      continue
    }


    const code =
      buildPermissionCode(link)


    const allowed =
      can(code)


    link.style.display =
      allowed
        ? ""
        : "none"

  }


  /* =========================
  MENU GROUPS
  ========================= */

  const groups =
    [
      ...sidebarMenu.querySelectorAll(
        ".menu-group"
      )
    ]


  for(const group of groups){

    const submenu =
      group.querySelector(
        ".submenu"
      )

    if(!submenu){
      continue
    }


    const visibleLinks =
      [
        ...submenu.querySelectorAll(
          "a[data-page]"
        )
      ].some(
        link =>
          link.style.display !== "none"
      )


    group.style.display =
      visibleLinks
        ? ""
        : "none"

  }

}