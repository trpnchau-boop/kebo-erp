// catalog/image-cache.js

const imageCache = new Map()
const PRELOAD_CONCURRENT = 5
let preloadPromise = null

/* =========================
KEY
========================= */

function getCacheKey(product){

  return `${

    product.id

  }-${

    product.updated_at ||

    product.image_url

  }`

}

/* =========================
LOAD BLOB
========================= */

export async function getImageBlob(
  product
){

  if(
    !product?.image_url
  ){

    return null

  }

  const key =
    getCacheKey(product)

  let promise =
    imageCache.get(key)

  if(!promise){

    promise = fetch(
      product.image_url
    )
    .then(response=>{

      if(!response.ok){

        throw new Error(
          `HTTP ${response.status}`
        )

      }

      return response.blob()

    })
    .catch(err=>{

      // lỗi thì bỏ cache
      imageCache.delete(key)

      throw err

    })

    imageCache.set(
      key,
      promise
    )

  }

  return await promise

}

/* =========================
LOAD FILE
========================= */

export async function getImageFile(
  product
){

  const blob =
    await getImageBlob(
      product
    )

  if(!blob){

    return null

  }

  const ext =

    blob.type.split("/")[1]

    ||

    "jpg"

  return new File(

    [blob],

    `${

      getFileName(product)

    }.${

      ext

    }`,

    {

      type: blob.type

    }

  )

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

  .replace(

    /\s+/g,

    " "

  )

  .trim()

}

/* =========================
CACHE
========================= */

export function hasImage(
  product
){

  return imageCache.has(
    getCacheKey(product)
  )

}

export function clearImageCache(){

  imageCache.clear()

}

export function getImageCacheSize(){

  return imageCache.size

}

export async function preloadImage(product){

  if(
    hasImage(product)
  ){
    return
  }

  try{

    await getImageBlob(product)

  }catch{}

}

export async function preloadImages(products){

  if(preloadPromise){

    return preloadPromise

  }

  preloadPromise = (async()=>{

    let index = 0

    async function worker(){

      while(index < products.length){

        const current = index++

        await preloadImage(products[current])

      }

    }

    await Promise.all(

      Array.from(

        {

          length: Math.min(
            PRELOAD_CONCURRENT,
            products.length
          )

        },

        worker

      )

    )

  })()

  try{

    await preloadPromise

  }finally{

    preloadPromise = null

  }

}

export async function waitPreload(){

  if(preloadPromise){

    await preloadPromise

  }

}