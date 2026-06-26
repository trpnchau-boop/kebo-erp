export function getFieldValue(el){

  if(!el) return ""

  // dropdown custom
  if(
    el.classList?.contains(
      "dropdown-select-trigger"
    )
  ){
    return el.dataset.value || ""
  }

  // checkbox
  if(el.type === "checkbox"){
    return el.checked
  }

  // input / textarea
  return el.value ?? ""
}

export function setFieldValue(el,value){

  if(!el) return

  // dropdown custom
  if(
    el.classList?.contains(
      "dropdown-select-trigger"
    )
  ){

    const v = value ?? ""

    el.dataset.value = String(v)

    const dropdown =
      el.closest(".dropdown-select")

    const item =
      dropdown?.querySelector(
        `.dropdown-item[data-value="${v}"]`
      )

    const span =
      el.querySelector("span")

    if(span){

      span.textContent =
        item?.textContent.trim() || ""

    }

    dropdown?.classList.toggle(
      "empty",
      !v
    )

    return
  }

  // checkbox
  if(el.type === "checkbox"){

    el.checked = !!value

    return
  }

  // input / textarea
  el.value = value ?? ""
}