/* =========================================================
SORT ITEMS
========================================================= */

import {
  buildMap,
  loadRef
}
from "/js/relation-cache.js"

import {
  productSchema
}
from "/js/schema/product.js"

export async function groupItems(
  items = [],
  field = "",
  schema
){

  if(
    !field ||
    !Array.isArray(items) ||
    !items.length
  ){
    return [...items]
  }

  const result = [...items]

  const docFields =
    schema?.document_items?.fields || {}

  const productFields =
    productSchema.data_product.fields

  const isProductField =
    !(field in docFields) &&
    field in productFields

  /* =====================================================
  FIELD TRONG DOCUMENT_ITEMS
  ===================================================== */

  if(!isProductField){

    const fieldSchema =
      docFields[field]

    let textMap = null

    if(fieldSchema){

      let refTable =
        fieldSchema.ref

      if(!refTable){

        if(
          typeof fieldSchema.source === "string"
        ){

          refTable =
            fieldSchema.source

        }else{

          refTable =
            fieldSchema.source?.table

        }

      }

      if(refTable){

        textMap = await buildMap(

          refTable,

          fieldSchema.value
          ||
          fieldSchema.source?.value
          ||
          "id",

          fieldSchema.text
          ||
          fieldSchema.source?.label
          ||
          fieldSchema.source?.text
          ||
          "name"

        )

      }

    }

    return sortArray(
      result,
      field,
      textMap
    )

  }

  /* =====================================================
  FIELD TRONG DATA_PRODUCT
  ===================================================== */

  const products =
    await loadRef(
      "data_product"
    )

  const productMap = {}

  products.forEach(p=>{

    productMap[p.id] = p

  })

  const productField =
    productFields[field]

  let productTextMap = null

  if(
    productField.ref
    ||
    productField.source
  ){

    let refTable =
      productField.ref

    if(!refTable){

      if(
        typeof productField.source === "string"
      ){

        refTable =
          productField.source

      }else{

        refTable =
          productField.source?.table

      }

    }

    productTextMap =
      await buildMap(

        refTable,

        productField.value
        ||
        productField.source?.value
        ||
        "id",

        productField.text
        ||
        productField.source?.label
        ||
        productField.source?.text
        ||
        "name"

      )

  }

  result.sort((a,b)=>{

    let av =
      productMap[
        a.id_product
      ]?.[field]

    let bv =
      productMap[
        b.id_product
      ]?.[field]

    if(productTextMap){

      av =
        productTextMap[av] ?? av

      bv =
        productTextMap[bv] ?? bv

    }

    return compareValue(
      av,
      bv
    )

  })

  return result

}

/* =========================================================
SORT DOCUMENT FIELD
========================================================= */

function sortArray(
  items,
  field,
  textMap
){

  items.sort((a,b)=>{

    let av =
      a[field]

    let bv =
      b[field]

    if(textMap){

      av =
        textMap[av] ?? av

      bv =
        textMap[bv] ?? bv

    }

    return compareValue(
      av,
      bv
    )

  })

  return items

}

/* =========================================================
COMPARE
========================================================= */

function compareValue(
  av,
  bv
){

  if(
    av == null &&
    bv == null
  ){
    return 0
  }

  if(av == null){
    return 1
  }

  if(bv == null){
    return -1
  }

  if(
    typeof av === "number" &&
    typeof bv === "number"
  ){
    return av - bv
  }

  return String(av).localeCompare(

    String(bv),

    "vi",

    {

      numeric:true,

      sensitivity:"base"

    }

  )

}