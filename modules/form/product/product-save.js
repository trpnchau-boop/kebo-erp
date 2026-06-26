import {insertRow,deleteWhere} from "../../../js/crud.js"
import {saveUnits} from "./product-unit.js"
import {saveCombo} from "./product-combo.js"
import {saveVariants} from "./product-variant.js"

export async function saveProductStructure(productId,row,bulk){

if(bulk) return

await saveVariants(productId,row)

await saveCombo(productId)

await saveUnits(productId)

}

