//modules/document/actions/index.js//

import { saveDocument} from "./save-document.js"

import {
  showSalePreview
}
from "./show-sale-preview.js"

import {printDocument} from "./print-document.js"

import {deleteDocument, clearDocument} from "./delete-document.js"

import { splitDocument} from "./split-document.js"

import {postDocument} from "./post-document.js"

import {
  createCustomer
}
from "./create-customer.js"

import {
  createEmployee
}
from "./create-employee.js"



export const documentActions = {

  saveDocument,

  showSalePreview,

  printDocument,

  deleteDocument,

  clearDocument,

  splitDocument,

  postDocument,

  createCustomer,

  createEmployee,

}