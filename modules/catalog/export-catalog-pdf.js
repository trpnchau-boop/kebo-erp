import { renderCatalogImage }
from "./catalog-card.js"

export async function exportCatalogPdf(
  products
){

  const { jsPDF } =
    window.jspdf

  const pdf =
    new jsPDF(
      "l",
      "mm",
      "a5"
    )

  let firstPage = true

  for(const product of products){

    const canvas =
      await buildPage(
        product
      )

    const img =
      canvas.toDataURL(
        "image/jpeg",
        0.95
      )

    if(!firstPage){

      pdf.addPage()

    }

    firstPage = false

    pdf.addImage(
      img,
      "JPEG",
      0,
      0,
      210,
      148
    )

  }

  pdf.save(
    "catalog.pdf"
  )

}

/* =========================
BUILD PAGE
========================= */

async function buildPage(
  product
){

  const box =
    document.createElement(
      "div"
    )

  box.style.cssText = `
    width:1680px;
    height:1188px;

    background:white;

    display:flex;
    align-items:center;
    justify-content:center;

    padding:40px;
    box-sizing:border-box;

    position:fixed;
    left:-99999px;
    top:0;
  `

  box.innerHTML =
    renderCard(
      product
    )

  document.body.appendChild(
    box
  )

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

  box.remove()

  return canvas

}

/* =========================
CARD
========================= */

function renderCard(p){

  const imageUrl =
    p.image_url ||
    "/images/no-image.png"

  return `

    <div
      style="
        width:1400px;

        background:white;

        border:1px solid #ddd;
        border-radius:24px;

        overflow:hidden;
      "
    >

      ${renderCatalogImage(imageUrl)}

      <div
        style="
          padding:30px;
        "
      >

        <div
          style="
            font-size:40px;
            font-weight:700;
            line-height:1.3;
          "
        >
          ${p.name || ""}
        </div>

        <div
          style="
            margin-top:16px;

            color:#007aff;

            font-size:42px;
            font-weight:700;
          "
        >
          ${Number(
            p.dongia1 || 0
          ).toLocaleString()} đ
        </div>

      </div>

    </div>

  `

}

/* =========================
WAIT IMAGES
========================= */

function waitImages(
  el
){

  const imgs =
    [...el.querySelectorAll("img")]

  return Promise.all(

    imgs.map(img=>{

      if(
        img.complete &&
        img.naturalWidth > 0
      ){
        return Promise.resolve()
      }

      return new Promise(r=>{

        img.onload = r
        img.onerror = r

      })

    })

  )

}