import {
  shareImageFiles
}
from "./share-catalog.js"
import{

    showProgress,

    updateProgress,

    hideProgress

}
from "/js/components/progress-overlay.js"

import { renderCatalogImage }
from "./catalog-card.js"

export async function exportCatalogJpg(
  products,
  share = false
){

const isIOS =

  /iPad|iPhone|iPod/.test(
    navigator.userAgent
  )

  ||

  (
    navigator.platform === "MacIntel"

    &&

    navigator.maxTouchPoints > 1
  )  

  // ===== DOWNLOAD =====

if(!share){

    // ===== IOS =====

    if(isIOS){

        // 1 ảnh -> Share để lưu vào Photos

        if(products.length === 1){

            const file =
                await buildProductImage(products[0])

            await shareImageFiles([file])

            return

        }

        // nhiều ảnh -> ZIP

        await downloadZip(products)

        return

    }

    // Android / PC
    
const files =
  await buildProductImages(
    products
  )

for(const file of files){

  downloadFile(file)

}

    return

}
// ===== SHARE =====

const files =
  await buildProductImages(
    products
  )

await shareImageFiles(
  files
)

}

/* =========================
BUILD IMAGE FILE
========================= */

async function buildProductImage(
  product
){

  const imageUrl =

    product.image_url ||
    "/images/no-image.png"

  const box =
    document.createElement(
      "div"
    )

  box.style.cssText = `
    width:800px;
    background:#fff;

    overflow:hidden;

    position:fixed;
    left:-99999px;
    top:0;
  `

  box.innerHTML = `

    ${renderCatalogImage(imageUrl)}

    <div
      style="
        padding:24px;
      "
    >

      <div
        style="
          font-size:24px;
          font-weight:500;
          line-height:1.3;
        "
      >
        ${product.name || ""}
      </div>

      <div
        style="
          margin-top:12px;

          color:#007aff;

          font-size:28px;
          font-weight:600;
        "
      >
        ${Number(
          product.dongia3 || 0
        ).toLocaleString("vi-VN")}
        VNĐ
      </div>

    </div>

  `

  document.body.appendChild(
    box
  )

  try{

    await waitImages(box)

    const canvas =
      await html2canvas(
        box,
        {
          scale:2,
          useCORS:true,
          backgroundColor:"#ffffff"
        }
      )

    const blob =
      await new Promise(resolve=>

        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.95
        )

      )
    if(!blob){  
      throw new Error(
        "Không tạo được ảnh"
      )  
    }  

    const fileName =

      (
        product.name ||
        product.id ||
        "product"
      )
      .replaceAll("/", "-")
      .replaceAll("\\", "-")

    return new File(

      [blob],

      `${fileName}.jpg`,

      {
        type:"image/jpeg"
      }

    )

  }finally{

    box.remove()

  }

}

async function buildProductImages(
  products
){

  showProgress(
    "Đang tạo ảnh..."
  )

  try{

    const files = []

    for(
      let i = 0;
      i < products.length;
      i++
    ){

      files.push(

        await buildProductImage(
          products[i]
        )

      )

      updateProgress(
        i + 1,
        products.length
      )

    }

    return files

  }finally{

    hideProgress()

  }

}
/* =========================
DOWNLOAD
========================= */

function downloadFile(file){

  const url =
    URL.createObjectURL(file)

  const link =
    document.createElement("a")

  link.href = url
  link.download = file.name

  document.body.appendChild(link)

  link.click()

  link.remove()

  setTimeout(
    ()=>URL.revokeObjectURL(url),
    1000
  )

}

/* =========================
WAIT IMAGES
========================= */

async function waitImages(
  container
){

  const images =
    container.querySelectorAll(
      "img"
    )

  await Promise.all(

    [...images].map(img=>{

      if(
        img.complete &&
        img.naturalWidth > 0
      ){

        return Promise.resolve()

      }

      return new Promise(resolve=>{

        img.onload =
          ()=>resolve()

        img.onerror =
          ()=>resolve()

      })

    })

  )

}

async function downloadZip(
  products
){

  const zip =
    new JSZip()

  const files =
    await buildProductImages(
      products
    )

  for(const file of files){

    zip.file(
      file.name,
      file
    )

  }

  const blob =
    await zip.generateAsync({

      type:"blob",

      compression:"DEFLATE",

      compressionOptions:{
        level:6
      }

    })

  downloadBlob(
    blob,
    "catalog.zip"
  )

}

function downloadBlob(
  blob,
  fileName
){

  const url =
    URL.createObjectURL(blob)

  const a =
    document.createElement("a")

  a.href = url
  a.download = fileName

  document.body.appendChild(a)

  a.click()

  a.remove()

  setTimeout(
    ()=>URL.revokeObjectURL(url),
    1000
  )

}