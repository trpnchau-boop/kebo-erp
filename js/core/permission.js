import { db } from "../supabase.js"

const permissionSet = new Set()

let loaded = false

/* =========================
LOAD
========================= */

export async function loadPermissions(force=false){

  if(loaded && !force){
    return
  }

  permissionSet.clear()

  // ===== CURRENT USER =====

  const user =
  window.currentUser

  if(!user){
    loaded = true
    return
  }

  // ===== USER ROLE =====

  const {
    data: userRole
  } = await db
  .from("user_roles")
  .select("role_id")
  .eq("user_id", user.id)
  .maybeSingle()

  if(!userRole){
    loaded = true
    return
  }

  // ===== ROLE PERMISSIONS =====

  const {
    data: rolePermissions
  } = await db
  .from("role_permissions")
  .select("permission_code")
  .eq("role_id", userRole.role_id)

  if(rolePermissions){

    for(const item of rolePermissions){

      permissionSet.add(
        item.permission_code
      )

    }

  }

  // ===== USER EXTRA =====

  const {
    data:userPermissions
  } = await db
  .from("user_permission_extra")
  .select("permission_code")
  .eq("user_id",user.id)

  if(userPermissions){

    for(const item of userPermissions){

      permissionSet.add(
        item.permission_code
      )

    }

  }

  loaded = true

}

/* =========================
CHECK
========================= */

export function can(code){

  if(!code){
    return true
  }

  return permissionSet.has(code)

}

/* =========================
DEBUG
========================= */

export function getPermissions(){

  return [...permissionSet]

}

/* =========================
RESET
========================= */

export function clearPermissions(){

  permissionSet.clear()

  loaded = false

}

export function cannot(code){

    return !can(code)

}