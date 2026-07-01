export async function shareImageFiles(
  files
){

  if(!navigator.share){

    alert(
      "Thiết bị không hỗ trợ chia sẻ"
    )

    return

  }

  if(
    navigator.canShare &&
    navigator.canShare({ files })
  ){

    await navigator.share({

      title:"Catalog",

      files

    })

    return

  }

  alert(
    "Thiết bị không hỗ trợ chia sẻ"
  )

}