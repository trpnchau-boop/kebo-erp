const SNAP_DISTANCE = 8

export function findSnap({

  nextPageX,
  nextPageY,

  nextCenterX,
  nextCenterY,

  selectedIds,
  allBlocks

}){

  let snapDeltaX = 0
  let snapDeltaY = 0

  let guideX = null
  let guideY = null

  allBlocks.forEach(other=>{

    if(
      selectedIds.includes(
        other.id
      )
    ){
      return
    }

    const otherCenterX =
      other.pageX +
      other.width / 2

    const otherCenterY =
      other.pageY +
      other.height / 2

    if(

      Math.abs(
        nextPageX -
        other.pageX
      ) < SNAP_DISTANCE

    ){

      snapDeltaX =
        other.pageX -
        nextPageX

      guideX =
        other.pageX
    }

    if(

      Math.abs(
        nextPageY -
        other.pageY
      ) < SNAP_DISTANCE

    ){

      snapDeltaY =
        other.pageY -
        nextPageY

      guideY =
        other.pageY
    }

    if(

      Math.abs(
        nextCenterX -
        otherCenterX
      ) < SNAP_DISTANCE

    ){

      snapDeltaX =
        otherCenterX -
        nextCenterX

      guideX =
        otherCenterX
    }

    if(

      Math.abs(
        nextCenterY -
        otherCenterY
      ) < SNAP_DISTANCE

    ){

      snapDeltaY =
        otherCenterY -
        nextCenterY

      guideY =
        otherCenterY
    }

  })

  return {

    snapDeltaX,
    snapDeltaY,

    guideX,
    guideY
  }
}