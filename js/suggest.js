export function createSuggestBox(input){

  let wrapper = input.closest(".suggest-wrapper")

  if(!wrapper){
    wrapper = document.createElement("div")
    wrapper.className = "suggest-wrapper"

    input.parentNode.insertBefore(wrapper, input)
    wrapper.appendChild(input)
  }

  let box = wrapper.querySelector(".suggest-box")

  if(!box){
    box = document.createElement("div")
    box.className = "suggest-box"
    wrapper.appendChild(box)
  }

  box._input = input

  bindKeyboard(box)
  bindOutside(box)

  return box
}

/* ========================= */

export function clearSuggest(box){
  box.innerHTML = ""
  box._list = []
  box._index = -1
  box.scrollTop = 0
}

/* ========================= */

export function renderSuggest(box, list, onSelect, options = {}){

  box.innerHTML = ""

  box._list = (list || []).slice(0,10)
  box._index = -1   // ❗ không auto chọn
  box._onSelect = onSelect
  box._autoSelectFirst = options.autoSelectFirst ?? true

  box._list.forEach((row)=>{

    const item = document.createElement("div")
    item.className = "suggest-item"
    item.textContent = row.label || ""

    item.addEventListener("mousedown", e => {
      e.preventDefault()
      e.stopPropagation()

      onSelect(row)
      clearSuggest(box)
   })

    box.appendChild(item)
  })
}

/* ========================= */

function bindKeyboard(box){

  const input = box._input
  if(!input) return

  if(input.dataset.keyBound==="1") return
  input.dataset.keyBound = "1"

  input.addEventListener("keydown", e => {

    // 👉 không có list → cho browser xử lý
    if(!box._list?.length) return

    /* ===================== */
    if(e.key==="ArrowDown"){
      e.preventDefault()

    if(box._index === -1){
      box._index = 0
    }else{
      box._index = (box._index + 1) % box._list.length
    }

    paint(box)
    return
    }

    /* ===================== */
    if(e.key==="ArrowUp"){
      e.preventDefault()

    if(box._index === -1){
      box._index = box._list.length - 1
    }else{
      box._index =
        (box._index - 1 + box._list.length) % box._list.length
    }

    paint(box)
    return
    }

    /* ===================== */
    if(e.key==="Enter" || e.key==="Tab"){

      let idx = box._index

      // 👉 chưa chọn → lấy item đầu
      if(idx === -1){

        if(box._autoSelectFirst === false){    
          clearSuggest(box)   
          return
        }
        idx = 0
      }

      const row =
        box._list[idx]

      if(row){

        e.preventDefault()

        box._onSelect(row)
        clearSuggest(box)

        if(e.key==="Tab"){

          const root =
            box._input.closest(".doc-page") || document

          const inputs = Array.from(
            root.querySelectorAll("input, select, textarea")
          ).filter(el =>
            !el.disabled &&
            el.offsetParent !== null
          )

          const next =
            inputs[inputs.indexOf(box._input) + 1]

          next?.focus()
        }
      }

      return
    }

    /* ===================== */
    if(e.key==="Escape"){
      clearSuggest(box)
    }

  })
}

/* ========================= */

function bindOutside(box){

  if(box.dataset.outsideBound==="1") return
  box.dataset.outsideBound = "1"

  document.addEventListener("mousedown", e => {

    if(
      box.contains(e.target) ||
      box._input === e.target
    ){
      return
    }

    clearSuggest(box)
  })
}

/* ========================= */

function paint(box){

  const items = box.querySelectorAll(".suggest-item")

  items.forEach(x =>
    x.classList.remove("active")
  )

  if(box._index === -1) return

  const active = items[box._index]

  active?.classList.add("active")

  active?.scrollIntoView({
    block:"nearest"
  })
}