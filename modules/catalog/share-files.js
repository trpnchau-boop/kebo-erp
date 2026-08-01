export async function shareImageFiles(
  files
){

  if(!navigator.share){

    alert(
      "Thiết bị không hỗ trợ chia sẻ."
    )

    return false

  }

  try{

    if(

      navigator.canShare

      &&

      !navigator.canShare({files})

    ){

      return false

    }


await navigator.share({

  title:"Catalog",

  files

})

    return true

  }catch(err){

    // User bấm Hủy
    if(
      err.name === "AbortError"
    ){

      return false

    }

    console.error(err)

    alert(
      "Không thể chia sẻ."
    )

    return false

  }

}