import { db } from "/js/supabase.js"

export async function uploadImage(
  file,
  bucket = "product-images"
){

  try{

    if(!file){
      throw new Error("Không có file được chọn")
    }

    const ext =
      file.name.includes(".")
        ? file.name.split(".").pop().toLowerCase()
        : "jpg"

    const path =
      `${Date.now()}.${ext}`

    const { data, error } =
      await db.storage
        .from(bucket)
        .upload(path, file, {
          contentType: file.type,
          upsert: false
        })

    if(error){

      throw error
    }

    const { data: publicData } =
      db.storage
        .from(bucket)
        .getPublicUrl(path)

    return publicData.publicUrl

  }catch(err){

    throw err

  }

}