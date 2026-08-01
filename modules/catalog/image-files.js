import {

  showProgress,

  updateProgress,

  hideProgress

}
from "/js/components/progress-overlay.js"

import {

  getImageFile,

  clearImageCache

}
from "./image-cache.js"

const CONCURRENT = 5

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

        try{

          files[current] =
            await getImageFile(
              products[current]
            )

        }catch(err){

          console.warn(

            "Không tải được ảnh:",

            products[current]?.image_url,

            err

          )

        }

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

export {

  clearImageCache

}