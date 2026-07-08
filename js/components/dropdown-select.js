import { insertRow } from "/js/crud.js"
import { markDirty } from "/js/relation-cache.js"

export function renderDropdownSelect({

  value,
  options=[],
  rowId,
  field,
  className="",
  allowEmpty=true,
  emptyText="Tất cả kho",

  allowAdd = false,
  addTable = "",
  addField = "",

  dataset={}


}){

  return `
    <div
      class="
        dropdown-menu 
        dropdown-select
        ${className}
        ${!value ? "empty" : ""}
      "
      data-id="${rowId || ""}"
      data-field="${field}"
    >

      <button
        class="
          dropdown-trigger
          dropdown-select-trigger
        "
        type="button"
        data-id="${rowId || ""}"
        data-field="${field}"
        data-value="${value ?? ""}"
        data-allow-add="${allowAdd ? 1 : 0}"
        data-add-table="${addTable}"
        data-add-field="${addField}"

        ${
          Object.entries(dataset)
          .map(([k,v])=>
            `data-${k}="${v}"`
          ).join(" ")
        }

${
Object.entries(

options.find(
a=>String(a.value)===String(value)
)?.dataset || {}

)
.map(([k,v])=>

`data-${k}="${v}"`

)
.join(" ")
}
      >
 
        ${
          className.includes("stock-filter")
            ? `
              <img
                src="/icons/filter.svg"
                class="dropdown-filter-icon"
              >
            `
            : className.includes("print-filter")
              ? (
                  !value
                    ? `
                      <img
                        src="/icons/add-user.svg"
                        class="dropdown-filter-icon"
                      >
                    `
                    : "" 
                  )
              : "" 
        }

      <span>
        ${
          className.includes("print-filter")
            ? (
                value
                  ? options.find(
                    a => String(a.value) === String(value)
                  )?.label
                : ""
              )
            : (
                options.find(
                  a => String(a.value) === String(value)
                )?.label || emptyText
              )
        }
      </span>

      </button>

      <div class="dropdown-panel">

          ${allowAdd ? `
            <input
              class="dropdown-search"
              placeholder="Tìm kiếm..."
            >

            <div class="dropdown-add"></div>
          ` : ""}

          <div class="dropdown-items">
      
            ${allowEmpty ? `
              <button
                class="dropdown-item"
                data-value=""
                type="button"
              >
                ${emptyText}
              </button>
            ` : ""}

            ${options.map(a=>`

              <button
                class="dropdown-item"
                data-value="${a.value}"

                  ${
                    Object.entries(
                      a.dataset || {}
                    )
                    .map(([k,v])=>
                      `data-${k}="${v}"`
                    )
                    .join(" ")
                  }

                type="button"
              >

                ${a.label}

              </button>

            `).join("")}

          </div>

          </div> 

      </div>
  `
}

export function bindDropdownSelect(
  root = document
){

  if(root.__dropdownSelectBound)
    return

  root.__dropdownSelectBound = true

  root.addEventListener(
    "click",
    async e=>{

      const addBtn =
  e.target.closest(
    ".dropdown-add-btn"
  )

if(addBtn){

  const dropdown =
    addBtn.closest(
      ".dropdown-select"
    )

  const trigger =
    dropdown.querySelector(
      ".dropdown-select-trigger"
    )

  const input =
    dropdown.querySelector(
      ".dropdown-search"
    )

  const value =
    input.value.trim()

  if(!value) return

  await insertRow(

    trigger.dataset.addTable,

    {

      [trigger.dataset.addField]: value

    }

  )

  markDirty(
    trigger.dataset.addTable
  )



  const items =
    dropdown.querySelector(
      ".dropdown-items"
    )

  items.insertAdjacentHTML(
    "beforeend",
    `
      <button
        class="dropdown-item"
        data-value="${value}"
        type="button"
      >
        ${value}
      </button>
    `
  )

  items.lastElementChild.click()

  return

}

      const item =
        e.target.closest(
          ".dropdown-select .dropdown-item"
        )

      if(!item) return

      const dropdown =
        item.closest(
          ".dropdown-select"
        )

      const trigger =
        dropdown.querySelector(
          ".dropdown-select-trigger"
        )

      const value =
        item.dataset.value || ""

      const text =
       item.textContent.trim()

      trigger.dataset.value =
        value

      const keep = {
        field: trigger.dataset.field,
        id: trigger.dataset.id
      }

      Object.keys(trigger.dataset)
      .forEach(k=>{
        delete trigger.dataset[k]
      })

      trigger.dataset.field = keep.field || ""
      trigger.dataset.id = keep.id || ""
      trigger.dataset.value = value

      Object.entries(item.dataset)
      .forEach(([k,v])=>{

        trigger.dataset[k] = v

      })
      const span =
        trigger.querySelector("span")

      const icon =
        trigger.querySelector(".dropdown-filter-icon")

      if(dropdown.classList.contains("print-filter")){

        if(value){

          icon?.remove()

        }else if(!icon){

          trigger.insertAdjacentHTML(
            "afterbegin",
            `
              <img
                src="/icons/add-user.svg"
                class="dropdown-filter-icon"
              >
            `
          )

        }

      }

      if(span){

        span.textContent = text

      }else{

        trigger.textContent = text

      }

      trigger.dispatchEvent(

        new CustomEvent(
          "change",
          {
            bubbles:true
          }
        )
      )  

      dropdown.classList.toggle(
        "empty",
        !value
      )

      dropdown.classList.remove(
        "open"
      )

    }
  )

  root.addEventListener("input", e => {

  const input = e.target.closest(".dropdown-search")
  if(!input) return

  const dropdown = input.closest(".dropdown-select")

  const keyword =
    input.value.trim().toLowerCase()

  let found = false
  let exact = false

  dropdown
    .querySelectorAll(".dropdown-item")
    .forEach(item=>{

      const ok =
        item.textContent
        .toLowerCase()
        .includes(keyword)

      item.hidden = !ok

      if(ok){

  found = true

  if(
    item.textContent.trim().toLowerCase()
    ===
    keyword
  ){

    exact = true

  }

}

    })

  const add =
    dropdown.querySelector(".dropdown-add")

  add.innerHTML = ""

  const trigger =
    dropdown.querySelector(".dropdown-select-trigger")

  if(
      !exact &&
      keyword &&
      trigger.dataset.allowAdd === "1"
  ){

      add.innerHTML = `
        <button
          class="dropdown-add-btn"
          type="button"
        >
          ĐVT "${input.value.trim()}"
        </button>
      `
  }

})
}

export function getDropdownValue(el){

  if(!el) return ""

  const trigger =
    el.querySelector(
      ".dropdown-select-trigger"
    )

  return (
    trigger?.dataset.value || ""
  )

}