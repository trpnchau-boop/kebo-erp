//document-compute.js//

/* =========================================================
COMPUTE TABLE ROW
========================================================= */

export function computeTableRow(

  schema,

  row,

  changedKey = ""

){

  const columns =

    schema.table?.columns

    || []

  columns.forEach(field=>{

    /* =====================================
    SKIP
    ===================================== */

    if(

      !field.computed

      ||

      !field.formula

    ){
      return
    }

    /* =====================================
    REVERSE COMPUTE
    ===================================== */

    if(

      changedKey

      ===

      field.key

      &&

      field.reverse

    ){

      const targetKey =

        field.reverse.target

      /* ===================================
      COMPUTE TARGET
      =================================== */

      row[targetKey] =

        evaluateFormula(

          field.reverse.formula,

          row

        )

      /* ===================================
      RECOMPUTE CURRENT FIELD
      =================================== */

      row[field.key] =

        evaluateFormula(

          field.formula,

          row

        )

      return

    }

    /* =====================================
    NORMAL COMPUTE
    ===================================== */

    row[field.key] =

      evaluateFormula(

        field.formula,

        row

      )

  })

}

/* =========================================================
EVALUATE FORMULA
========================================================= */

function evaluateFormula(

  formula,

  row

){

  try{

    /* =====================================
    SAFE ROW
    ===================================== */

    const safeRow =

      new Proxy(row,{

        has(){
          return true
        },

        get(target,key){

          return target[key] ?? 0

        }

      })

    /* =====================================
    EXECUTE
    ===================================== */

    const result =

      Function(

        "row",

        `
        with(row){

          return ${formula}

        }
        `

      )(safeRow)

    /* =====================================
    INVALID
    ===================================== */

    if(

      result === Infinity

      ||

      Number.isNaN(result)

    ){

      return 0

    }

    return result

  }

  catch(err){

    console.warn(

      "FORMULA ERROR:",

      formula,

      err

    )

    return 0

  }

}