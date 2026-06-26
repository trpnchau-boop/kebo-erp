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

  document
  .querySelectorAll(
    ".commission-rate"
  )
  .forEach(sel=>{

    sel.onchange = ()=>{

      const revenue =
      Number(
        sel.dataset.revenue || 0
      )

      const rate =
      Number(
        sel.value || 0
      )

      const td =
      sel.closest("tr")
      .querySelector(
        ".actual-cell"
      )

      const option =

        sel.options[
          sel.selectedIndex
        ]

      const min =

        Number(
          option.dataset.min || 0
        )
        
      const max =
      
        Number(
          option.dataset.max || 0
        )

      sel
      .closest("tr")
      .querySelector(
        ".commission-range"
      )
      .innerText =

        "└─ Định mức: " +

        formatDecimal(min) +

        " - " +

       formatDecimal(max)

      td.innerText =
      formatDecimal(

        Math.round(
          revenue *
          rate / 100
        )

      )

      calcNet()

    }

  })

}