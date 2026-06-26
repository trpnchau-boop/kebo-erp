import {renderViewMode} from "../modules/inventory/mode-view.js"
import {renderCountMode} from "../modules/inventory/mode-count.js"
import {renderTransferMode} from "../modules/inventory/mode-transfer.js"

const mode =
new URLSearchParams(location.search).get("mode") || "view"

if(mode === "view") renderViewMode()
if(mode === "count") renderCountMode()
if(mode === "transfer") renderTransferMode()