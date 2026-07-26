import {insertRow, updateRow, getOne} from "../../../js/crud.js"
import {saveProductStructure} from "../product/product-save.js"
import {markDirty} from "/js/relation-cache.js"
import {parseMoney} from "/js/core/format.js"
import {uploadImage} from "/js/upload-image.js"
import {
  getFieldValue
} from "../core/form-field.js"
import {
  cleanForm
} from "./form-loader.js"

export async function saveData(ctx){

  const {table, id, bulk, ids} = ctx

  const form = document.getElementById("form")

  const inputs = form.querySelectorAll(`
    input[data-field],
    textarea[data-field],
    .dropdown-select-trigger[data-field]
  `)

  let row = {}

  /* =========================
  READ FORM
  ========================= */

  for(const i of inputs){

    const field = i.dataset.field
    let value

    /* ---------- FILE ---------- */

    if(i.type === "file"){

      const imageField =
        i.closest(".image-field")

      const file = 
        imageField?._imageFile ||
        i.files?.[0]

      if(file){

        row[field] =
          await uploadImage(file)

      }

      continue
    }

    /* ---------- READ VALUE ---------- */

    const raw =
      getFieldValue(i)

    /* ---------- CHECKBOX ---------- */

    if(i.type === "checkbox"){

      if(bulk && !raw){
        continue
      }

      value = raw
    }

    /* ---------- OTHER ---------- */

    else{

      const v =
        String(raw ?? "").trim()

      // bulk update: bỏ qua field rỗng
      if(v === ""){
        continue
      }

      // money
      if(i.dataset.format === "money"){

        value =
          parseMoney(v)

      }

      // number
      else if(i.dataset.type === "number"){

        value =
          Number(v)

      }

      // text / dropdown
      else{

        value = v
      }
    }

    row[field] = value
  }

  /* =========================
  CUSTOM CUSTOMER NAME
  ========================= */

  if(table === "data_customer"){

    let current = null

    if(id){

      current =
        await getOne(
          "data_customer",
          id
        )

    }

    const currentName =
      row.name ||
      current?.name ||
      ""

    const areaId =
      row.id_khuvuc ||
      current?.id_khuvuc

    if(currentName && areaId){

      const area =
        await getOne(
          "set_kh_khuvuc",
          areaId
        )

      if(area?.name){

        const baseName =
          currentName.replace(
            /\s*-\s*.*$/,
            ""
          )

        row.name =
          `${baseName} - ${area.name}`

      }
 
    }

  }

  /* =========================
  VALIDATE
  ========================= */

  const hasUnits =
  document.querySelectorAll(
  "#unit-list .unit-row"
  ).length>0

  const hasVariants =
  document.querySelectorAll(
  "#variant-list .variant-row"
  ).length>0

  if(
    bulk &&
    Object.keys(row).length===0 &&
    !hasUnits &&
    !hasVariants
  ){
    alert("Không có dữ liệu để cập nhật")
    return
  }

  let productId

  /* =========================
  SAVE DB
  ========================= */

  if(bulk){

    for(const _id of ids){

      await updateRow(
        table,
        _id,
        row
      )

      if(table === "data_product"){

        await saveProductStructure(
          _id,
          row,
          true
        )

      }

    }

    productId = ids[0]
  }

  else if(id){

    await updateRow(
      table,
      id,
      row
    )

    productId = id
  }

  else{

    if(
      table === "data_product"
    ){

      row.catalog_priority = true

      row.catalog_priority_until =
  
        new Date(

          Date.now()

          +

          30 * 24 * 60 * 60 * 1000

        ).toISOString()

    }

    const r =
      await insertRow(
        table,
        row
      )

    productId = r?.id
  }

  /* =========================
  PRODUCT EXTRA
  ========================= */

  if(
    table === "data_product" &&
    !bulk
  ){

    await saveProductStructure(
      productId,
      row
    )
    if(!id){
      await cleanForm(table)
    }  
  }

  /* =========================
  GLOBAL CACHE REFRESH
  ========================= */

  markDirty(table)

  if(table === "data_product"){
    markDirty("product_unit")
  }

  /* =========================
  LIST RELOAD
  ========================= */

  if(window.reloadCurrentList){

    await window.reloadCurrentList()
  }

  /* =========================
  CALLBACK
  ========================= */

  if(window.__sidebarOnSave){

    window.__sidebarOnSave({
      id: productId,
      row: {
        id: productId,
        ...row
      }
    })

    window.__sidebarOnSave = null
  }
  alert("Đã lưu")
}