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

    area

    &&

    item.show?.[area] === false

  ){

    return false

  }


  if(

    item.hideInDocTypes?.includes(
      docType
    )

  ){

    return false

  }

  return true

}