import { getAll }
from "/js/crud.js"

export async function getCatalogData(){

  const [
    groups,
    products
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
    )

  ])

  return {

    groups,

    products:
      products.filter(
        p => !p.parent_id
      )

  }

}