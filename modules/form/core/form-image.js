// modules/form/core/form-image.js

export function bindImageField(field){

  const pasteBox =
    field.querySelector(".image-paste")

  const input =
    field.querySelector(".image-input")

  const preview =
    field.querySelector(".image-preview")

  const removeBtn =
    field.querySelector(".image-remove")  

  if(!pasteBox || !input || !preview){
    return
  }

  removeBtn?.addEventListener("click",()=>{

    field._imageFile = null

    input.value = ""

    preview.removeAttribute("src")

    preview.style.display = "none"

    pasteBox.style.visibility = ""

    pasteBox.innerHTML = ""

  })

  /* =========================
  chọn ảnh
  ========================= */

  input.addEventListener("change",()=>{

    const file = input.files?.[0]

    if(!file) return

    field._imageFile = file

    showPreview(file)

  })

  /* =========================
  Ctrl + V
  ========================= */

  pasteBox.addEventListener("paste",e=>{

    const items =
      e.clipboardData?.items || []

    for(const item of items){

      if(!item.type.startsWith("image/")){
        continue
      }

      const file =
        item.getAsFile()

      if(!file){
        continue
      }

      e.preventDefault()

      showPreview(file)

      // để bước sau xử lý save
      field.dataset.imageSource = "paste"
      field._imageFile = file

      break
    }

  })

  /* =========================
  preview
  ========================= */

  function showPreview(file){

    preview.src =
      URL.createObjectURL(file)

    preview.style.display = "block"
    pasteBox.style.visibility = "hidden"

    pasteBox.innerHTML = ""

  }

}