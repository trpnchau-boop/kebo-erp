import { db } from "/js/supabase.js"

export async function uploadImage(
  file,
  bucket = "product-images"
){

  try{

    alert("1. uploadImage()")

    if(!file){
      alert("Không có file")
      throw new Error("Không có file được chọn")
    }

    alert("Tên: " + file.name)
    alert("Type: " + file.type)
    alert("Size: " + file.size)

    const ext =
      file.name.includes(".")
        ? file.name.split(".").pop().toLowerCase()
        : "jpg"

    const path =
      `${Date.now()}.${ext}`

    alert("Path: " + path)

    const { data, error } =
      await db.storage
        .from(bucket)
        .upload(path, file, {
          contentType: file.type,
          upsert: false
        })

    alert("Upload xong")

    if(error){

      alert("ERROR:")
      alert(error.message)

      throw error
    }

    const { data: publicData } =
      db.storage
        .from(bucket)
        .getPublicUrl(path)

    alert("SUCCESS")

    return publicData.publicUrl

  }catch(err){

    alert("CATCH")

    alert(
      err.message ||
      JSON.stringify(err)
    )

    throw err

  }

}