// quote-draft.js

import { state } from "./quote-state.js"
import {
  render
} from "./quote-render.js"
import {
  notify
} from "/js/notification/notification.js"

export function saveDraft(){

  if(!state.customer){
    alert("Chưa chọn khách hàng")
    return
  }

notify({

    type:"QUOTE",

    title:"Báo giá",

    createdAt:Date.now(),

    payload:{

        customer: structuredClone(
            state.customer
        ),

        items: structuredClone(
            state.items
        )

    }

})

state.customer = null
state.items = []

document.querySelector("#customer").value = ""
document.querySelector("#search-product").value = ""

render()

alert("Đã lưu báo giá")

}