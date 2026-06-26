import {loadRef}
from "/js/relation-cache.js"

/* =========================================================
LAST CUSTOMER PRICE
========================================================= */

export async function getLastCustomerPrice({

  customerId,

  productId

}){

  if(
    !customerId
    ||
    !productId
  ){
    return null
  }

  const docs =
    await loadRef(
      "document"
    )

  const items =
    await loadRef(
      "document_items"
    )

  /* =========================================
  CUSTOMER DOC IDS
  ========================================= */

  const docMap = {}

  docs.forEach(doc=>{

    if(
      doc.type === "SALE"
      &&
      String(doc.id_customer)
      ===
      String(customerId)
    ){

      docMap[doc.id] = doc

    }

  })

  /* =========================================
  MATCH ITEMS
  ========================================= */

  const matched =

    items

    .filter(item=>

      docMap[item.id_doc]

      &&

      String(item.id_product)

      ===

      String(productId)

    )

    .sort((a,b)=>{

      const docA =
        docMap[a.id_doc]

      const docB =
        docMap[b.id_doc]

      return new Date(
        docB.day || 0
      ) - new Date(
        docA.day || 0
      )

    })

  const last =
    matched[0]

  if(!last){
    return null
  }

  return Number(
    last.dongia || 0
  )

}

/* =========================================================
PRICE WARNING
========================================================= */

function applyPriceWarning(
  key,
  input,
  target
){

  if(
    key !== "dongia"
  ){
    return
  }

  const dongia =
    Number(
      target.dongia || 0
    )

  const giavon =
    Number(
      target.dongiavon || 0
    )

  if(
    dongia < giavon
  ){

    input.style.color =
      "#dc2626"

    input.style.borderColor =
      "#dc2626"

    input.style.fontWeight =
      "600"

  }

  else{

    input.style.color = ""

    input.style.background = ""

    input.style.borderColor = ""

    input.style.fontWeight = ""

  }

}