import {
  getImageFiles
}
from "./image-files.js"

import {
  shareImageFiles
}
from "./share-files.js"

let exporting = false

/* =========================
EXPORT
========================= */

export async function exportImages(
  products,
  share = false
){

  if(exporting){
    return
  }

  exporting = true

  try{

    const files =
      await getImageFiles(
        products
      )

    if(!files.length){

      alert("Không có ảnh")

      return

    }

    if(share){

      const result =
        await shareImageFiles(
          files
        )

      switch(result.status){

        case "success":

          alert(
            `Đã chia sẻ ${result.count} ảnh.`
          )

          return

        case "cancel":

          return

        case "unsupported":

          if(files.length === 1){

            downloadFile(
              files[0]
            )

          }else{

            await downloadZip(
              files
            )

          }

          return

        case "error":

          alert(
            "Không thể chia sẻ."
          )

          return

      }

    }

    if(files.length === 1){

      downloadFile(
        files[0]
      )

      return

    }

    await downloadZip(
      files
    )

  }finally{

    exporting = false

  }

}

/* =========================
DOWNLOAD FILE
========================= */

function downloadFile(
  file
){

  const url =
    URL.createObjectURL(file)

  const a =
    document.createElement("a")

  a.href = url
  a.download = file.name

  document.body.appendChild(a)

  a.click()

  a.remove()

  setTimeout(

    ()=>URL.revokeObjectURL(url),

    1000

  )

}

/* =========================
DOWNLOAD ZIP
========================= */

async function downloadZip(
  files
){

  const zip =
    new JSZip()

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

/* =========================
DOWNLOAD BLOB
========================= */

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