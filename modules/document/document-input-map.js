const rowInputMap =
  new WeakMap()

export function setRowInput(
  row,
  key,
  input
){

  if(
    !rowInputMap.has(row)
  ){

    rowInputMap.set(
      row,
      {}
    )

  }

  const map =
    rowInputMap.get(row)

  map[key] = input

}

export function getRowInputs(
  row
){

  return (
    rowInputMap.get(row)
    || {}
  )

}