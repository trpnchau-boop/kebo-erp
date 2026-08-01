export async function shareImageFiles(
  files
){

  if(!navigator.share){

    return {
      status: "unsupported"
    }

  }

  try{

    if(

      navigator.canShare

      &&

      !navigator.canShare({files})

    ){

      return {
        status: "unsupported"
      }

    }

    const totalSize =
      files.reduce(
        (s,f)=>s+f.size,
        0
      )

    console.log({

      count: files.length,

      totalMB:
        (
          totalSize/
          1024/
          1024
        ).toFixed(2)

    })

    await navigator.share({

      title: "Catalog",

      files

    })

    return {

      status: "success",

      count: files.length

    }

  }catch(err){

    console.error(err)

    console.log(
      err.name,
      err.message
    )

    if(
      err.name === "AbortError"
    ){

      return {
        status: "cancel"
      }

    }

    if(
      err.name === "NotAllowedError"
    ){

      return {
        status: "error"
      }

    }

    return {

      status: "error"

    }

  }

}