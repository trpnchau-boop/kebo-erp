import {stockState} from "./stock-state.js"

export function getStockRow(productId, warehouseId){

return stockState.rows.find(x =>
Number(x.id_product) === Number(productId) &&
Number(x.id_warehouse) === Number(warehouseId)
) || {}

}

export function getProduct(productId){

return stockState.productMap[productId] || {}

}