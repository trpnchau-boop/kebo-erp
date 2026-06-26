import { updateRow } from "/js/crud.js"

import {
  getDropdownValue
} from "/js/components/dropdown-select.js"

export function bindFilter(root){

  const input = root.querySelector("#filter-all")

  if(!input){
    console.warn("❌ filter-all chưa tồn tại")
    return
  }

  input.oninput = () => {
    const keyword = input.value.toLowerCase()

    root.querySelectorAll("tr[data-id]").forEach(row => {

      const name = row.querySelector(".input-name").value.toLowerCase()
      const code = getDropdownValue(row.querySelector(".dropdown-select")).toLowerCase()

      row.style.display =
        name.includes(keyword) || code.includes(keyword)
          ? ""
          : "none"
    })
  }
}

export function bindSave(root){

  const btn = root.querySelector("#btn-save")

  btn.onclick = async () => {

    const updates = []

    root.querySelectorAll("tr[data-id]").forEach(row => {

      const id = row.dataset.id

      const name = row.querySelector(".input-name").value
      const code = getDropdownValue(row.querySelector(".dropdown-select"))
      const secured = row.querySelector(".input-secured").checked ? "1" : "0"

      const changed = {}

      if(name !== row.dataset.name) changed.name = name
      if(code !== row.dataset.code) changed.module_code = code
      if(secured !== row.dataset.secured) changed.is_secured = secured === "1"

      if(Object.keys(changed).length){
        updates.push({ id, ...changed })
      }

    })

    if(!updates.length){
      alert("Không có thay đổi")
      return
    }

    await Promise.all(
      updates.map(r =>
        updateRow("table_modules", r.id, {
            name: r.name,
            module_code: r.module_code,
            is_secured: r.is_secured 
        })
      )
    )
    
    window.dispatchEvent(
      new Event("table_modules_changed")
    )

    alert("✅ Đã lưu")
  }
}

