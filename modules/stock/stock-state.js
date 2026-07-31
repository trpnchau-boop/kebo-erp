// modules/stock/stock-state.js

export const stockState = {
  rows: [],

  productMap: {},
  warehouseMap: {},

  checkMode: false,
  transferMode: false,
  onlyChanged:false,

  checkCache: {},
  transferCache: {},

  loading: false,
  lastLoadedAt: null,

  keyword: "",
  warehouseId: "",
  status: "",

  sort: {
    field: "code",
    dir: "asc"
  }
}

export function resetStockState(){

  stockState.rows = []

  stockState.productMap = {}
  stockState.warehouseMap = {}

  stockState.checkMode = false
  stockState.transferMode = false
  stockState.checkCache = {}
  stockState.transferCache = {}

  stockState.loading = false
  stockState.lastLoadedAt = null

  stockState.keyword = ""
  stockState.warehouseId = ""
  stockState.status = ""

  stockState.sort = {

    field: "code",

    dir: "asc"
 
  }

}

export function setStockLoading(flag){

  stockState.loading = !!flag

  if(flag){
    stockState.lastLoadedAt =
    new Date()
    .toISOString()
  }

}