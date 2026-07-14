import {createField}
from "./document-field.js"

import {bindField}
from "./document-bind.js"

export function renderField({
  field,
  row,
  state
}){

  const input =
    createField(
      field,
      row,
      state
    )

  input._row = row  

  input.dataset.key =
    field.key

  bindField(
    input,
    field,
    row,
    state
  )

  return input

}