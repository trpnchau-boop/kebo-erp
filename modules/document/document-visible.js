export function isVisible(
  item,
  area,
  docType
){

  if(
    item.visible === false
  ){
    return false
  }

  if(
    area &&
    item.show?.[area] === false
  ){
    return false
  }

  /* =====================================
  CHỈ HIỆN Ở MỘT SỐ LOẠI CHỨNG TỪ
  ===================================== */

  if(
    item.showInDocTypes &&
    !item.showInDocTypes.includes(docType)
  ){
    return false
  }

  /* =====================================
  ẨN Ở MỘT SỐ LOẠI CHỨNG TỪ
  ===================================== */

  if(
    item.hideInDocTypes?.includes(docType)
  ){
    return false
  }

  return true

}