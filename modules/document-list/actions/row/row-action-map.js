import {editDocument} from "../../services/document-edit.js"
import {
  bulkDeleteDocuments
}
from "../../services/bulk-delete-documents.js"
import {printDocument} from "../../services/bulk-print-documents.js"
import {paymentDocument} from "../../services/document-payment.js"
import {bulkPostDocuments} from "../../services/bulk-post-documents.js"
import {exportStockDocument} from "../../services/document-export-stock.js"
import {
  openReleasePage
}
from "../../services/document-release.js"

import {
  postDocument
}
from "../../services/document-post.js"

export const ROW_ACTION_MAP = {

  edit:editDocument,

  remove:bulkDeleteDocuments,

  print:printDocument,

  payment:paymentDocument,

  release:openReleasePage,

  post:postDocument,

  split:editDocument,

  export_stock:exportStockDocument
}
