export function renderDropdownSelect({

  value,
  options=[],
  rowId,
  field,
  className="",
  allowEmpty=true,
  emptyText="Tất cả kho",
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
              ? `
                <img
                  src="/icons/menu-dots.svg"
                  class="dropdown-filter-icon"
                >
              `
              : ""  
        }

        <span>
          ${
            options.find(
              a => String(a.value) === String(value)
            )?.label || emptyText
          }
        </span>

      </button>

      <div class="dropdown-panel">
      
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
    e=>{

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

      Object.keys(trigger.dataset)
      .forEach(k=>{

        if(k !== "value"){

          delete trigger.dataset[k]

        }

      })

      Object.entries(item.dataset)
      .forEach(([k,v])=>{

        trigger.dataset[k] = v

      })
      const span =
        trigger.querySelector("span")

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