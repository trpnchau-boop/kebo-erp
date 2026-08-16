import {
  loadDocument
}
from "/modules/document/document-load.js"

import {
  createDocState
}
from "/modules/document/document-state.js"

import {
  groupItems
}
from "./group-items.js"

import {
  loadCustomerDebt
}
from "/modules/receivable/receivable-load.js"

export async function loadPrintData({

  id,
  schema,
  company = {},
  template

}){

  const state =
    createDocState()

  await loadDocument(
    id,
    schema,
    state
  )

  const customerId =
    state.header?.id_customer

  const noKhachHang =
    customerId
      ? await loadCustomerDebt(customerId)
      : 0

  let items = [...state.items]

  if(template?.detail_group && items.length ){

    items = await groupItems(

      items,

      template.detail_group,

      schema

    )

  }

  return {

    document:{

      ...state.header,

      no_khachhang:
        noKhachHang,

      company

    },

    items

  }

}