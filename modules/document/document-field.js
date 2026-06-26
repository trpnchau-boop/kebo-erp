import {createBasicField}
from "./field-basic.js"

import {createMoneyField}
from "./field-money.js"

import {createLookupField}
from "./field-lookup.js"

import {createRefField}
from "./field-ref.js"

export const FIELD_TYPES = {
  text: createBasicField,
  ref: createRefField,
  number: createBasicField,
  money: createMoneyField,
  date: createBasicField,
  select: createBasicField,
  checkbox: createBasicField,
  lookup: createLookupField
}

export function createField(
  field,
  row = {},
  state
){

  const factory =
    FIELD_TYPES[field.type]

  let input

  if(!factory){

    console.warn(
      "Unknown field type:",
      field.type
    )

    input =
      document.createElement("input")

  }else{

    input =
      factory(
        field,
        row,
        state
      )

  }

  if(
    field.readonly === true
    ||
    (
      field.computed
      &&
      field.readonly !== false
    )
  ){
    input.readOnly = true
  }

  return input

}