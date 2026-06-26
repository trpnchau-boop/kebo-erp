//document-types.js//

import {BASE_DOCUMENT}
from "./base-document.js"

/* =========================================================
HELPER
========================================================= */

function mergeDocument(
  base,
  override
){

  return structuredCloneDeep(
    base,
    override
  )

}

function structuredCloneDeep(
  base,
  override
){

  const result =
    structuredClone(base)

  deepMerge(
    result,
    override
  )

  return result

}

function deepMerge(
  target,
  source
){

  for(const key in source){

    const value =
      source[key]

    if(
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ){

      if(!target[key]){

        target[key] = {}

      }

      deepMerge(
        target[key],
        value
      )

    }

    else{

      target[key] = value

    }

  }

}

/* =========================================================
SALE
========================================================= */

const SALE = mergeDocument(
  BASE_DOCUMENT,
  {

    meta:{

      code:"SALE",

      prefix:"BH",

      title:"HÓA ĐƠN BÁN HÀNG"

    },

    workflow:{

      postable:false

    },

    validate:{

      requireCustomer:true

    },

    capabilities:{

      split:true

    },

    table:{

      columns:{

        price:{
          visible:true
        },

        amount:{
          visible:true
        },

        cost_price:{
          visible:false
        },

        cost_total:{
          visible:false
        },

        cost_alloc:{
          visible:false
        }

      }

    }

  }
)

/* =========================================================
INVOICE
========================================================= */

const INVOICE = mergeDocument(
  BASE_DOCUMENT,
  {

    meta:{

      code:"INVOICE",

      prefix:"HD",

      title:"HÓA ĐƠN"

    },

    workflow:{

      postable:false

    },

    validate:{

      requireCustomer:true

    },

    table:{

      columns:{

        price:{
          visible:true
        },

        amount:{
          visible:true
        }

      }

    }

  }
)

/* =========================================================
IMPORT
========================================================= */

const IMPORT = mergeDocument(
  BASE_DOCUMENT,
  {

    meta:{

      code:"IMPORT",

      prefix:"NK",

      title:"PHIẾU NHẬP KHO"

    },

    workflow:{

      postable:true

    },

    stock:{

      mode:"in",

      updateStock:true,

      requireWarehouse:true,

      updateCost:true

    },

    table:{

      columns:{

        id_warehouse:{
          visible:true
        },

        price:{
          visible:true
        },

        amount:{
          visible:true
        },

        cost_alloc:{
          visible:true
        }

      }

    }

  }
)

/* =========================================================
EXPORT
========================================================= */

const EXPORT = mergeDocument(
  BASE_DOCUMENT,
  {

    meta:{

      code:"EXPORT",

      prefix:"XK",

      title:"PHIẾU XUẤT KHO"

    },

    workflow:{

      postable:true

    },

    stock:{

      mode:"out",

      updateStock:true,

      requireWarehouse:true

    },

    table:{

      columns:{

        id_warehouse:{
          visible:true
        },

        price:{
          visible:false
        },

        amount:{
          visible:false
        },

        cost_price:{
          visible:true
        },

        cost_total:{
          visible:true
        }

      }

    },

    print:{

      showPrice:false,

      showCost:true

    }

  }
)

/* =========================================================
TRANSFER
========================================================= */

const TRANSFER = mergeDocument(
  BASE_DOCUMENT,
  {

    meta:{

      code:"TRANSFER",

      prefix:"CK",

      title:"CHUYỂN KHO"

    },

    workflow:{

      postable:true

    },

    stock:{

      mode:"transfer",

      updateStock:true,

      requireWarehouse:true

    },

    table:{

      columns:{

        id_warehouse:{
          visible:true
        },

        price:{
          visible:false
        },

        amount:{
          visible:false
        },

        cost_price:{
          visible:false
        },

        cost_total:{
          visible:false
        },

        cost_alloc:{
          visible:false
        }

      }

    },

    totals:{

      subtotal:{
        visible:false
      },

      discount:{
        visible:false
      },

      tax:{
        visible:false
      },

      grand_total:{
        visible:false
      }

    },

    print:{

      showPrice:false,

      showCost:false

    }

  }
)

/* =========================================================
ADJUST
========================================================= */

const ADJUST = mergeDocument(
  BASE_DOCUMENT,
  {

    meta:{

      code:"ADJUST",

      prefix:"KK",

      title:"KIỂM KHO"

    },

    workflow:{

      postable:true

    },

    stock:{

      mode:"adjust",

      updateStock:true,

      requireWarehouse:true

    },

    table:{

      columns:{

        id_warehouse:{
          visible:true
        },

        price:{
          visible:false
        },

        amount:{
          visible:false
        },

        cost_price:{
          visible:true
        },

        cost_total:{
          visible:true
        }

      }

    }

  }
)

/* =========================================================
ISSUE
========================================================= */

const ISSUE = mergeDocument(
  BASE_DOCUMENT,
  {
    dbTable:"tax_invoice",
    itemTable:"tax_invoice_items",

    meta:{

      code:"ISSUE",

      prefix:"PH",

      title:"PHIẾU PHỤ"

    },

    workflow:{

      postable:false

    },

    table:{

      columns:{

        price:{
          visible:true
        },

        amount:{
          visible:true
        }

      }

    }

  }
)

/* =========================================================
EXPORT
========================================================= */

export const DOCUMENT_TYPES = {

  SALE,

  INVOICE,

  IMPORT,

  EXPORT,

  TRANSFER,

  ADJUST,

  ISSUE

}