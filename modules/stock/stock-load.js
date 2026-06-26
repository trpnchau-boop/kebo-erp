// modules/stock/stock-load.js

import {getAll} from "../../js/crud.js"
import {stockState} from "./stock-state.js"
import {render} from "./stock-render.js"
import {
  renderDropdownSelect
}
from "/js/components/dropdown-select.js"

function $(root,id){
 return root.querySelector(`#${id}`)
}

export async function loadMaster(root){

const products = await getAll("data_product")
const warehouses = await getAll("set_kho")

stockState.productMap = {}
stockState.warehouseMap = {}

products.forEach(x=>{
stockState.productMap[x.id] = x
})

warehouses.forEach(x=>{
stockState.warehouseMap[x.id] = x
})

const el =
$(root,"filter-kho")

if(el){

  el.innerHTML =
  renderDropdownSelect({

    value:"",

    allowEmpty:false,

    className:"stock-filter",

    options:[

      {
        value:"",
        label:"Tất cả kho"
      },

      ...warehouses.map(x=>({

        value:x.id,
        label:x.name || x.code

      }))

    ]

  })

}

const statusEl =
$(root,"filter-status")

if(statusEl){

  statusEl.innerHTML =
  renderDropdownSelect({

    value:"",

    allowEmpty:false,

    className:"stock-filter",

    options:[

      {
        value:"",
        label:"Tất cả"
      },

      {
        value:"positive",
        label:"Còn hàng"
      },

      {
        value:"zero",
        label:"Hết hàng"
      },

      {
        value:"negative",
        label:"Âm kho"
      }

    ]

  })

}

fillTransferSelect(root,"transfer-to",warehouses)
}

export async function loadStock(root){

const body =
$(root,"stock-body")

if(body){

body.innerHTML = `
<tr>
<td colspan="10" style="text-align:center;padding:20px">
Đang tải...
</td>
</tr>
`

}

stockState.rows =
await getAll("vw_stock")

render(root)

}
function fillTransferSelect(root,id,list){

  const el = $(root,id)

  if(!el) return

  el.innerHTML =
  renderDropdownSelect({

    value:"",

    allowEmpty:false,

    className:"stock-filter",

    options:[

      {
        value:"",
        label:"Kho đích"
      },

      ...list.map(x=>({

        value:x.id,
        label:x.name || x.code || ""

      }))

    ]

  })

}