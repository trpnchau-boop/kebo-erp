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

  /* =========================
     CẬP NHẬT GIÁ TRỊ TIÊU CHUẨN
  ========================= */

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
        code === "SOCONG"
      ){

        state.congChuan =
          val

      }

      if(
        code === "LUONGCB"
      ){

        state.luongTc =
          val

      }

    })


  /* =========================
     TÍNH THỰC TẾ
  ========================= */

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

      /*
       * Hoa hồng không có
       * .income-formula
       * nên bỏ qua.
       */

      if(
        !inp ||
        !td
      ) return


      const code =
        inp.dataset.code

      let val = 0


      /* =========================
         SỐ CÔNG
      ========================= */

      if(
        code === "SOCONG"
      ){

        val =
          state.congThucTe

      }


      /* =========================
         LƯƠNG CƠ BẢN
      ========================= */

      else if(
        code === "LUONGCB"
      ){

        val =
          state.congChuan
          ? Math.round(

              state.luongTc /
              state.congChuan *
              state.congThucTe

            )
          : 0

      }


      /* =========================
         CÁC KHOẢN NHẬP TAY
      ========================= */

      else{
  
        const raw =
          String(
            inp.value || ""
          ).trim()
  
        const result =
          evalFormula(
            raw
          )

        const isFormula =
          /[+\-*/()]/.test(
            raw
          )

        if(isFormula){

          val =
            result

        }
        else{

          val =
            result *
            state.congThucTe

        }

      }

      td.innerText =
        formatDecimal(
          val
        )

    })


  /* =========================
     TÍNH TỔNG
  ========================= */

  calcNet()

}