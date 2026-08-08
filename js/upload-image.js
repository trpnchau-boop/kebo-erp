import { db } from "/js/supabase.js"


// =====================================================
// CREATE THUMBNAIL
// =====================================================

async function createThumbnail(file){

  const bitmap =
    await createImageBitmap(file)


  const MAX_SIZE = 500

  let width =
    bitmap.width

  let height =
    bitmap.height


  if(width > height){

    if(width > MAX_SIZE){

      height =
        Math.round(
          height *
          MAX_SIZE /
          width
        )

      width = MAX_SIZE

    }

  }else{

    if(height > MAX_SIZE){

      width =
        Math.round(
          width *
          MAX_SIZE /
          height
        )

      height = MAX_SIZE

    }

  }


  const canvas =
    document.createElement("canvas")

  canvas.width = width
  canvas.height = height


  const ctx =
    canvas.getContext("2d")

  ctx.drawImage(
    bitmap,
    0,
    0,
    width,
    height
  )


  bitmap.close()


  const blob =
    await new Promise(
      (resolve,reject)=>{

        canvas.toBlob(
          result => {

            if(result){
              resolve(result)
            }else{
              reject(
                new Error(
                  "Không tạo được thumbnail"
                )
              )
            }

          },
          "image/webp",
          0.75
        )

      }
    )


  return blob

}


// =====================================================
// UPLOAD IMAGE
// =====================================================

export async function uploadImage(
  file,
  bucket = "product-images"
){

  try{

    if(!file){

      throw new Error(
        "Không có file được chọn"
      )

    }


    // =================================================
    // FILE NAME
    // =================================================

    const ext =

      file.name.includes(".")
        ? file.name
            .split(".")
            .pop()
            .toLowerCase()
        : "jpg"


    const baseName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2,8)}`


    const originalPath =
      `original/${baseName}.${ext}`

    const thumbPath =
      `thumb/${baseName}.webp`


    // =================================================
    // UPLOAD ORIGINAL
    // =================================================

    const {
      error: originalError
    } =

      await db.storage
        .from(bucket)
        .upload(
          originalPath,
          file,
          {
            contentType:
              file.type || "image/jpeg",

            upsert:false
          }
        )


    if(originalError){

      throw originalError

    }


    // =================================================
    // CREATE THUMBNAIL
    // =================================================

    const thumbnail =
      await createThumbnail(file)


    // =================================================
    // UPLOAD THUMBNAIL
    // =================================================

    const {
      error: thumbError
    } =

      await db.storage
        .from(bucket)
        .upload(
          thumbPath,
          thumbnail,
          {
            contentType:
              "image/webp",

            upsert:false
          }
        )


    if(thumbError){

      throw thumbError

    }


    // =================================================
    // PUBLIC URL - ORIGINAL
    // =================================================

    const {
      data: originalPublic
    } =

      db.storage
        .from(bucket)
        .getPublicUrl(
          originalPath
        )


    // =================================================
    // PUBLIC URL - THUMBNAIL
    // =================================================

    const {
      data: thumbPublic
    } =

      db.storage
        .from(bucket)
        .getPublicUrl(
          thumbPath
        )


    // =================================================
    // RETURN
    // =================================================

    return {

      image_url:
        originalPublic.publicUrl,

      image_thumb_url:
        thumbPublic.publicUrl

    }


  }catch(err){

    throw err

  }

}