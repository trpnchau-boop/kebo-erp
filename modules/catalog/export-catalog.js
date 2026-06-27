import {
  shareImageFiles
}
from "./share-catalog.js"

import {
  buildGridImage,
  buildPdfFile
}
from "./export-catalog-share.js"

export async function exportCatalogJpg(
  products,
  share = false
){

  // ===== DOWNLOAD =====

  if(!share){

    for(const product of products){

      const file =
        await buildProductImage(product)

      downloadFile(file)

    }

    return

  }

  // ===== SHARE 1 =====

  if(products.length === 1){

    const file =
      await buildProductImage(products[0])

    await shareImageFiles([file])

    return

  }

  // ===== SHARE GRID =====

  if(products.length < 7){

    const file =
      await buildGridImage(products)

    await shareImageFiles([file])

    return

  }

  // ===== SHARE PDF =====

  const pdf =
    await buildPdfFile(products)

  await shareImageFiles([pdf])

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