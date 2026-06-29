import {
evalFormula
}
from "./payroll-formula.js"

import {
formatDecimal
}
from "../../js/core/format.js"

import {
calcNet,
recalcIncomeRows
}
from "./payroll-engine.js"

import {
  getDropdownValue
}
from "/js/components/dropdown-select.js"

import {state}
from "./payroll-state.js"

export function bindInputs(root){

  root
  .querySelectorAll(
    ".formula-input"
  )
  .forEach(inp=>{

    inp.onfocus = ()=>{

      const val =
      evalFormula(
        inp.value
      )

      if(
        !inp.value
        .startsWith("=")
      ){
        inp.value =
        val || ""
      }

    }

    inp.onblur = ()=>{

      if(
        inp.value
        .startsWith("=")
      ){
        return
      }

      inp.value =
      formatDecimal(
        evalFormula(
          inp.value
        )
      )

    }

    inp.oninput = ()=>{

      if(
        inp.classList.contains(
          "income-formula"
        )
      ){

        recalcIncomeRows()

      }else{

        const td =
        inp.closest("tr")
        .querySelector(
          ".actual-cell"
        )

        td.innerText =
        formatDecimal(
          evalFormula(
            inp.value
          )
        )

        calcNet()

      }

    }

  })

}

export function bindCommission(){

  state.root
  .querySelectorAll(
    ".dropdown-select.commission-rate"
  )
  .forEach(dropdown=>{

    const trigger =
      dropdown.querySelector(
        ".dropdown-select-trigger"
      )

    trigger?.addEventListener(
      "change",
      ()=>{

        const min =
Number(trigger.dataset.min || 0)

const max =
Number(trigger.dataset.max || 0)

dropdown
.closest("tr")
.querySelector(".commission-range")
.innerText =

"└─ Định mức: " +

formatDecimal(min) +

" - " +

formatDecimal(max)

        const revenue =
        Number(
          trigger.dataset.revenue || 0
        )

        const rate =
        Number(
          getDropdownValue(
            dropdown
          )
        )

        const td =
        dropdown
        .closest("tr")
        .querySelector(
          ".actual-cell"
        )

        td.innerText =
        formatDecimal(

          Math.round(
            revenue *
            rate / 100
          )

        )

        calcNet()

      }
    )

  })

}