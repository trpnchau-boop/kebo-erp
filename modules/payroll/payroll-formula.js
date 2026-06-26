export function parseNumber(text){

  text =
  String(text || "")
  .trim()

  text =
  text
  .replace(/\./g,"")
  .replace(",", ".")

  return Number(text) || 0

}

export function evalFormula(text){

  text =
  String(text || "")
  .trim()

  if(!text)
  return 0

  if(
    !text.startsWith("=")
  ){
    return parseNumber(text)
  }

  text =
  text.slice(1)

  if(
    !/^[0-9+\-*/()., ]+$/
    .test(text)
  ){
    return 0
  }

  text =
  text
  .replace(/\./g,"")
  .replace(",", ".")

  try{

    const result =
    Function(
      "return " + text
    )()

    return Number.isFinite(
      result
    )
      ? result
      : 0

  }catch{

    return 0

  }

}