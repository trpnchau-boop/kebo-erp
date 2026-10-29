
export function isVisible(
  item,
  area,
  docType,
  schema
){

  if(
    item.visible === false
  ){
    return false
  }

  /* =====================================
  CẤU HÌNH RIÊNG THEO LOẠI CHỨNG TỪ
  ===================================== */

  const columnConfig =
    area === "table"
      ? schema?.table?.columns?.[item.key]
      : null

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

  /* =====================================
  ƯU TIÊN CẤU HÌNH RIÊNG
  ===================================== */

  if(
    typeof columnConfig?.visible === "boolean"
  ){

    return columnConfig.visible

  }

  /* =====================================
  KIỂM TRA HIỂN THỊ MẶC ĐỊNH
  ===================================== */

  if(
    area &&
    item.show?.[area] === false
  ){
    return false
  }

  return true

}
