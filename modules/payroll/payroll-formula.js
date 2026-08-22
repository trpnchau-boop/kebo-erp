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


  /*
   * Không cần dấu =
   *
   * 10000
   * 10000*6
   * 10000+5000
   * 10000*2+5000
   */

  text =
    text
      .replace(/\./g,"")
      .replace(",", ".")


  /*
   * Chỉ cho phép:
   * số
   * + - * /
   * ngoặc
   * khoảng trắng
   */

  if(
    !/^[0-9+\-*/(). ]+$/.test(text)
  ){

    return 0

  }


  try{

    const result =
      Function(
        "return " + text
      )()

    return Number.isFinite(result)
      ? result
      : 0

  }
  catch{

    return 0

  }

}