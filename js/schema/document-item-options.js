import {
  documentSchema
}
from "./document.js"

import {
  productSchema
}
from "./product.js"

const documentFields =
  documentSchema
    .document_items
    .fields

const productFields =
  productSchema
    .data_product
    .fields

export const documentItemOptions = [

  ...Object.entries(
    documentFields
  ).map(([key, field]) => ({

    value: key,

    label:
      field.label || key

  })),

  ...Object.entries(
    productFields
  )

  .filter(([key])=>

    !(key in documentFields)

  )

  .map(([key, field]) => ({

    value: key,

    label:
      field.label || key

  }))

]