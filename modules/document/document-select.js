let activeSelect = null

export function createDocumentSelect(){

  const root =
    document.createElement("div")

  root.className =
    "doc-select"

  root.innerHTML = `
    <button
      type="button"
      class="doc-select-trigger"
    >
      <span class="doc-select-text"></span>

      <span class="doc-select-arrow">
        ▾
      </span>
    </button>

    <div class="doc-select-panel"></div>
  `

  root._value = ""
  root._options = []
  root._displayText = null
  root.selectedOptions = []

  /* =====================================================
  VALUE
  ===================================================== */

  Object.defineProperty(
    root,
    "value",
    {
      get(){
        return root._value || ""
      },

      set(v){

        root._value =
          v ?? ""

        root.updateSelectedOptions()

        const panel =
          root.querySelector(
            ".doc-select-panel"
          )

        panel
          ?.querySelectorAll(
            ".doc-select-item"
          )
          .forEach(el=>{

            el.classList.toggle(
              "selected",
              String(el.dataset.value)
              ===
              String(root._value)
            )

          })

        updateDisplay()
      }
    }
  )

  /* =====================================================
  DISPLAY TEXT OVERRIDE
  ===================================================== */

  root.setDisplayText = function(text){
    root._displayText =
      text ?? null

    updateDisplay()
  }

  /* =====================================================
  OPTIONS
  ===================================================== */

  root.setOptions = function(
    options = []
  ){

    root._options =
      Array.isArray(options)
        ? options
        : []

    const panel =
      root.querySelector(
        ".doc-select-panel"
      )

    panel.innerHTML =
      root._options.map(opt=>`

        <button
          type="button"
          class="
            doc-select-item
            ${
              String(opt.value)
              ===
              String(root.value)
                ? "selected"
                : ""
            }
          "
          data-value="${opt.value}"
        >
          ${opt.label}
        </button>

      `).join("")

    root.updateSelectedOptions()
    updateDisplay()
  }

  /* =====================================================
  SELECTED
  ===================================================== */

  root.getSelectedOption =
    function(){

      return root._options.find(
        opt =>
          String(opt.value)
          ===
          String(root.value)
      )

    }

  root.updateSelectedOptions =
    function(){

      const selected =
        root.getSelectedOption()

      root.selectedOptions =
        selected
          ? [selected]
          : []

    }

  /* =====================================================
  DISPLAY
  ===================================================== */

  function updateDisplay(){

    const text =
      root.querySelector(
        ".doc-select-text"
      )

    const selected =
      root.getSelectedOption()

    if(
      root._displayText !== null
      &&
      root._displayText !== undefined
    ){
      text.textContent =
        root._displayText
      return
    }

    text.textContent =
      selected?.label
      ??
      root._value
      ??
      ""
  }

  /* =====================================================
  OPEN / CLOSE
  ===================================================== */

  const trigger =
    root.querySelector(
      ".doc-select-trigger"
    )

  trigger.addEventListener(
    "click",
    e=>{

      e.stopPropagation()

      if(
        activeSelect
        &&
        activeSelect !== root
      ){
        activeSelect.classList.remove(
          "open"
        )
      }

      root.classList.toggle(
        "open"
      )

      activeSelect =
        root.classList.contains("open")
          ? root
          : null
    }
  )

  /* =====================================================
  PICK ITEM
  ===================================================== */
root.addEventListener(
  "click",
  e=>{

    const item =
      e.target.closest(".doc-select-item")

    if(!item){
      return
    }

    const pickedValue =
      item.dataset.value || ""

    root.querySelectorAll(".doc-select-item")
      .forEach(x => x.classList.remove("active"))

    root.setDisplayText(null)
    root.value = pickedValue

    root.classList.remove("open")

    activeSelect = null

    root.dispatchEvent(
      new Event(
        "input",
        {
          bubbles:true
        }
      )
    )
  }
)

  /* =====================================================
  GLOBAL CLOSE
  ===================================================== */

  if(
    !window.__docSelectBound
  ){

    window.__docSelectBound =
      true

    document.addEventListener(
      "click",
      ()=>{

        if(activeSelect){
          activeSelect.classList.remove(
            "open"
          )
          activeSelect = null
        }

      }
    )
  }

  return root
}