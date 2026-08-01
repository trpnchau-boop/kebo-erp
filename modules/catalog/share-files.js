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

const totalSize =
  files.reduce(
    (s,f)=>s+f.size,
    0
  )

console.log({

  count:files.length,

  totalMB:
    (
      totalSize/
      1024/
      1024
    ).toFixed(2)

})
await navigator.share({

  title:"Catalog",

  files

})

    return true

}catch(err){

  console.error(err)

  console.log(
    err.name,
    err.message
  )

  alert(
    `${err.name}\n${err.message}`
  )

  return false

}

}