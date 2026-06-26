import {mergeDocuments} from "../../services/document-merge.js"
import {bulkPostDocuments} from "../../services/bulk-post-documents.js"
import {bulkDeleteDocuments} from "../../services/bulk-delete-documents.js"
import {printDocument} from "../../services/bulk-print-documents.js"
import {paymentDocument} from "../../services/document-payment.js"
import {bulkStockDocument} from "../../services/bulk-export-stock.js"
import {
  openReleasePage
}
from "../../services/document-release.js"

export const BULK_ACTION_MAP = {

  merge:mergeDocuments,

  bulk_post:bulkPostDocuments,

  bulk_delete:bulkDeleteDocuments,

  bulk_print:printDocument,

  bulk_payment: paymentDocument,

  bulk_release: openReleasePage,

  bulk_export_stock: bulkStockDocument


}
