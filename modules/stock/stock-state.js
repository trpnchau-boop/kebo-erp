// modules/stock/stock-state.js

export const stockState = {
  rows: [],

  productMap: {},
  warehouseMap: {},

  checkMode: false,
  transferMode: false,

  loading: false,
  lastLoadedAt: null,

  keyword: "",
  warehouseId: "",
  status: ""
}

export function resetStockState(){

  stockState.rows = []

  stockState.productMap = {}
  stockState.warehouseMap = {}

  stockState.checkMode = false
  stockState.transferMode = false

  stockState.loading = false
  stockState.lastLoadedAt = null

  stockState.keyword = ""
  stockState.warehouseId = ""
  stockState.status = ""

}

export function setStockLoading(flag){

  stockState.loading = !!flag

  if(flag){
    stockState.lastLoadedAt =
    new Date()
    .toISOString()
  }

}