import {state}
from "./payroll-state.js"

import {
evalFormula,
parseNumber
}
from "./payroll-formula.js"

import {
formatDecimal
}
from "../../js/core/format.js"

export function calcNet(){

  let sumIncome = 0
  let sumDeduct = 0

  state.root
  .querySelectorAll(
    "#tbody-income tr"
  )
  .forEach(tr=>{

    const td =
    tr.querySelector(
      ".actual-cell"
    )

    if(!td) return

    const inp =
    tr.querySelector(
      ".income-formula"
    )

    if(inp){

      const code =
      inp.dataset.code

      if(
        code==="SOCONG"
      ){
        return
      }

    }

    sumIncome +=
    parseNumber(
      td.innerText
    )

  })

  state.root
  .querySelectorAll(
    "#tbody-deduct .actual-cell"
  )
  .forEach(td=>{

    sumDeduct +=
    parseNumber(
      td.innerText
    )

  })

  state.sumIncomeEl.innerText =
  formatDecimal(
    sumIncome
  )

  state.sumDeductEl.innerText =
  formatDecimal(
    sumDeduct
  )

  state.netPayEl.innerText =
  formatDecimal(
    sumIncome -
    sumDeduct
  )

}

export function recalcIncomeRows(){

  state.root
  .querySelectorAll(
    ".income-formula"
  )
  .forEach(inp=>{

    const code =
    inp.dataset.code

    const val =
    evalFormula(
      inp.value
    )

    if(
      code==="SOCONG"
    ){
      state.congChuan =
      val
    }

    if(
      code==="LUONGCB"
    ){
      state.luongTc =
      val
    }

  })

  state.root
  .querySelectorAll(
    "#tbody-income tr"
  )
  .forEach(tr=>{

    const inp =
    tr.querySelector(
      ".income-formula"
    )

    const td =
    tr.querySelector(
      ".actual-cell"
    )

    if(
      !inp ||
      !td
    ) return

    const code =
    inp.dataset.code

    let val = 0

    if(
      code==="SOCONG"
    ){

      val =
      state.congThucTe

    }else if(
      code==="LUONGCB"
    ){

      val =
      state.congChuan
      ? Math.round(

        state.luongTc /
        state.congChuan *
        state.congThucTe

      )
      : 0

    }else{

      val =
      evalFormula(
        inp.value
      )

    }

    td.innerText =
    formatDecimal(
      val
    )

  })

  calcNet()

}