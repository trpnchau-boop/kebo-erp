import { db }
from "/js/supabase.js"

export async function uploadImage(
  file,
  bucket="product-images"
){

  const ext =
    file.name.split(".").pop()

  const path =
    `${Date.now()}.${ext}`

  const { error } =
    await db.storage
      .from(bucket)
      .upload(
        path,
        file
      )

  if(error)
    throw error

  const { data } =
    db.storage
      .from(bucket)
      .getPublicUrl(path)

  return data.publicUrl

}