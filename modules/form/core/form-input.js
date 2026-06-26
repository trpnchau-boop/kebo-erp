import {getAll} from "../../../js/crud.js"
import {
  renderDropdownSelect
} from "/js/components/dropdown-select.js"

export async function buildInput(key, f){

  const attrs = [
    `data-field="${key}"`,
    f.format ? `data-format="${f.format}"` : "",
    f.readonly ? "readonly" : "",
  ].filter(Boolean).join(" ")

  /* =========================
  CHECKBOX
  ========================= */
  if(f.type === "checkbox"){
    return `<input type="checkbox" ${attrs}>`
  }

  /* =========================
  PASSWORD
  ========================= */
  if(f.type === "password"){
    return `<input type="password" ${attrs}>`
  }

  /* =========================
  SELECT
  ========================= */
if(f.type === "select"){

  let options = []

  if(f.options){
    options.push(
      ...f.options.map(o=>({
        value:o.value,
        label:o.text
      }))
    )
  }

  if(f.ref){

    const rows = await getAll(f.ref)

    options.push(
      ...rows.map(r=>({
        value:r[f.value],
        label:r[f.text]
      }))
    )
  }

  return renderDropdownSelect({
    value:"",
    options,
    rowId:"",
    field:key,
    className:"erp-select",
    allowEmpty:true,
    emptyText:""
  })
}

  /* =========================
  IMAGE
  ========================= */
if(f.type === "image"){

  return `
  <div class="image-field">

    <img
      class="image-preview"
      data-preview="${key}"
      style="
        width:120px;
        height:120px;
        object-fit:cover;
        border:1px solid #ddd;
        border-radius:8px;
        display:none;
        margin-bottom:8px;
      "
    >

    <label class="image-upload-btn">
      Chọn ảnh

      <input
        type="file"
        accept="image/*"
        data-field="${key}"

        onchange="
          const img =
            this.closest('.image-field')
                .querySelector('img')

          const file =
            this.files?.[0]

          if(!file) return

          img.src =
            URL.createObjectURL(file)

          img.style.display='block'
        "
      >

    </label>

  </div>
  `
}

  /* =========================
  NUMBER
  ========================= */
  if(f.type === "number"){
    return `<input type="text" inputmode="decimal" data-type="number" ${attrs}>`
  }

  /* =========================
  DEFAULT (text)
  ========================= */
  return `<input type="text" ${attrs}>`
}