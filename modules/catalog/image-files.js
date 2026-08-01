import {

  showProgress,

  updateProgress,

  hideProgress

}
from "/js/components/progress-overlay.js"

const CONCURRENT = 5

const imageCache =
  new Map()

export async function getImageFiles(
  products
){

  showProgress("Đang tải ảnh...")

  const files =
    new Array(products.length)

  let completed = 0
  let index = 0

  try{

    async function worker(){

      while(index < products.length){

        const current = index++

        files[current] =
          await loadImageFile(
            products[current]
          )

        completed++

        updateProgress(

          completed,

          products.length

        )

      }

    }

    const workers = []

    const count = Math.min(

      CONCURRENT,

      products.length

    )

    for(
      let i = 0;
      i < count;
      i++
    ){

      workers.push(
        worker()
      )

    }

    await Promise.all(
      workers
    )

    return files.filter(Boolean)

  }finally{

    hideProgress()

  }

}

/* =========================
LOAD IMAGE
========================= */

async function loadImageFile(
  product
){

  if(
    !product?.image_url
  ){

    return null

  }

  try{

  const cacheKey =

    `${product.id}-${product.updated_at || product.image_url}`

  let blob =
    imageCache.get(
      cacheKey
    )

  if(!blob){

    const response =
      await fetch(
        product.image_url
      )

    if(!response.ok){

      return null

    }

    blob =
      await response.blob()

    imageCache.set(

      cacheKey,

      blob

    )

  }

    const ext =

      blob.type.split("/")[1]

      ||

      "jpg"

    return new File(

      [blob],

      `${getFileName(product)}.${ext}`,

      {

        type: blob.type

      }

    )

  }catch(err){

    console.warn(

      "Không tải được ảnh:",

      product.image_url,

      err

    )

    return null

  }

}

/* =========================
FILE NAME
========================= */

function getFileName(
  product
){

  return (

    product.name ||

    product.code ||

    product.id ||

    "product"

  )

  .replace(

    /[<>:"/\\|?*\x00-\x1F]+/g,

    "-"

  )

  .replace(/\s+/g," ")

  .trim()

}

/* =========================
CACHE
========================= */

export function clearImageCache(){

  imageCache.clear()

}