import {renderSuggest, clearSuggest} from "./suggest.js"

/* =========================
LOCK INPUT
========================= */

export function lockInput(input){

  if(!input) return

  input.setAttribute("autocomplete", "new-password")
  input.setAttribute("spellcheck", "false")
  input.setAttribute("autocorrect", "off")

  input.name =
    "f_" + Math.random().toString(36).slice(2)

}

/* =========================
SUGGEST CORE
========================= */

export function bindSuggestInput({
  input,
  fetch,
  render,
  onSelect
}){

  if(!input) return

  let box = null
  let lastKeyword = ""
  let requestId = 0

  box = render(input)

  const handle = debounce(async () => {

  const keyword = input.value.toLowerCase()

    lastKeyword = keyword

    if(!keyword){
      if(box) clearSuggest(box)
      return
    }

    const id = ++requestId

    const list = await fetch(keyword)

    if(id !== requestId){
        return
    }

    // ❗ chặn kết quả cũ
    if(keyword !== lastKeyword){
      return
    }

    renderSuggest(box, list, row => {
      onSelect(row)
    })

  }, 100)

  input.addEventListener("input", handle)
}

/* =========================
DEBOUNCE
========================= */

function debounce(fn, delay = 100){
  let t

  return (...args)=>{
    clearTimeout(t)

    t = setTimeout(()=>{
      fn(...args)
    }, delay)
  }
}