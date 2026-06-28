import { can } from "./permission.js"

export function canField(field, action){

  const permission = field.permission?.[action]

  if(!permission){
    return true
  }

  return can(permission)

}