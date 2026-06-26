import {
  shareImageFiles
}
from "./share-catalog.js"

export async function exportCatalogJpg(
  products,
  share = false
){

  const files = []

  for(const product of products){

    const file =
      await buildProductImage(
        product
      )

    if(share){

      files.push(file)

    }else{

      downloadFile(file)

    }

  }

  if(
    share &&
    files.length
  ){

    await shareImageFiles(
      files
    )

  }

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

    <img
      src="${imageUrl}"
      crossorigin="anonymous"
      style="
        width:100%;
        height:auto;
        display:block;
      "
    >

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
          product.dongia1 || 0
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

/* =========================
DOWNLOAD
========================= */

function downloadFile(
  file
){

  const url =
    URL.createObjectURL(
      file
    )

  const link =
    document.createElement(
      "a"
    )

  link.href = url

  link.download =
    file.name

  link.click()

  setTimeout(
    ()=>URL.revokeObjectURL(
      url
    ),
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