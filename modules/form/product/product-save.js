import {insertRow,deleteWhere, getAll} from "../../../js/crud.js"
import {saveUnits} from "./product-unit.js"
import {saveCombo} from "./product-combo.js"
import {saveVariants} from "./product-variant.js"

export async function saveProductStructure(productId,row,bulk){

  if(bulk){

    const variants =
      await getAll("data_product",{
        parent_id:productId
      })

    if(variants.length===0){
      await saveVariants(productId,row)
    }

    const units =
      await getAll("product_unit",{
        id_sp:productId
      })

    if(units.length===0){
        await saveUnits(productId)
    }

    return
  }

  await saveVariants(productId,row)
  await saveCombo(productId)
  await saveUnits(productId)
}