export async function shareImageFiles(
  files
){

  if(

    navigator.canShare

    &&

    navigator.canShare({
      files
    })

  ){

    await navigator.share({

      title:"Catalog",

      files

    })

    return

  }

  alert(
    "Thiết bị không hỗ trợ Share"
  )

}