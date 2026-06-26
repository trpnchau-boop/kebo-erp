/* =========================================================
GENERIC OBJECT MAPPING
========================================================= */

export function applyMapping({

  source,

  target,

  mapping

}){

  if(
    !source
    ||
    !target
    ||
    !mapping
  ){
    return
  }

  Object.entries(mapping)

  .forEach(([to,from])=>{

    /* =====================================================
    FUNCTION
    ===================================================== */

    if(
      typeof from === "function"
    ){

      target[to] =
        from(source)

      return

    }

    /* =====================================================
    STRING PATH
    ===================================================== */

    target[to] =
      source[from]

  })

}