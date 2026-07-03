import { getAll }
from "/js/crud.js"

export async function getCatalogData(){

  const [
    groups,
    products,
    stocks
  ] = await Promise.all([

    getAll(
      "set_sp_group",
      {
        is_act:true
      }
    ),

    getAll(
      "data_product",
      {
        is_act:true,
        show_catalog:true
      }
    ),

    getAll("vw_stock")

  ])

  const stockMap = {}

  for(const row of stocks){

    stockMap[row.id_product] =
      (stockMap[row.id_product] || 0)
      + Number(row.qty_balance || 0)

  }

  return {

    groups,

    products:
      products
        .filter(p => !p.parent_id)
        .map(p=>({
          ...p,
          qty:
            stockMap[p.id] || 0
        }))    


  }

}