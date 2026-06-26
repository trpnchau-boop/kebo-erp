export function bindCheckboxMatrix(
  matrix
){

  matrix.bindCellClick(

    ".matrix-check",

    ({el})=>{

      const state =
        el.dataset.state

      if(state === "none"){

        el.dataset.state = "extra"

        el.className =
          "matrix-check state-extra"

        el.textContent = "✓"

        return
      }

      if(state === "extra"){

        el.dataset.state = "none"

        el.className =
          "matrix-check state-none"

        el.textContent = ""

      }

    }

  )

}