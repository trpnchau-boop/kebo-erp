
import { createField } from "./document-field.js"

import { createLookupField } from "./field-lookup.js"

import { bindField } from "./document-bind.js"

export function renderField({
  field,
  row,
  state
}) {

  // Riêng màn XML: Mã SP là ô tìm kiếm sản phẩm nội bộ
  const isXmlProductCode =
    state?.xmlPreview === true &&
    field.key === "product_code"

  const input = isXmlProductCode
    ? createLookupField(
        {
          ...field,

          // Lookup mã sản phẩm nội bộ
          key: "product_code",

          source: {
            table: "data_product",
            value: "code",
            search: ["code", "name"],
            display: ["code", "name"]
          }
        },
        row,
        state
      )
    : createField(
        field,
        row,
        state
      )

  input._row = row

  input.dataset.key = field.key

  bindField(
    input,
    field,
    row,
    state
  )

  return input

}
