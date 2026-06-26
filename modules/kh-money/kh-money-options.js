//modules/kh-money/kh-money-options.js//

import {
  resolveProductPrice
}
from "./kh-money-api.js"

/* =========================================================
BUILD PRICE OPTIONS
========================================================= */

export async function buildPriceOptions({

  field,

  product,

  customerType

}){

  const options = []

  const sources =
    field.priceSources || []

  for(
    const source
    of sources
  ){

    /* ========================================
    POLICY
    ======================================== */

    if(
      source.type === "policy"
    ){

      const value =
        await resolveProductPrice({

          customerType,

          product

        })

      options.push({

        type:"policy",

        label:
          source.label,

        value

      })

    }

    /* ========================================
    FIELD
    ======================================== */

    if(
      source.type === "field"
    ){

      const value =
        Number(

          product?.[
            source.field
          ]

          || 0

        )

      options.push({

        type:"field",

        label:
          source.label,

        value

      })

    }

  }

  return options

}