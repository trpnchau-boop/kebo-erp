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

import {
  state
}
from "./payroll-state.js"

import {
  calculateTieredCommission
}
from "./payroll-commission.js"


/* =========================
   INPUTS
========================= */

export function bindInputs(root){

  root
    .querySelectorAll(
      ".formula-input"
    )
    .forEach(inp => {

      inp.onfocus = () => {

        const raw =
          String(
            inp.value || ""
          ).trim()

        if(
          /[+\-*/()]/.test(raw)
        ){

          return

        }

        const val =
          evalFormula(raw)

        inp.value =
          val || ""

      }


      inp.onblur = () => {

        const raw =
          String(
            inp.value || ""
          ).trim()

        if(!raw)
          return

        inp.value =
          raw.replace(
            /\d+(?:[.,]\d+)?/g,
            match => {

              const value =
                Number(
                  match
                    .replace(/\./g, "")
                    .replace(",", ".")
                )

              return formatDecimal(value)

            }
          )

      }


      inp.oninput = () => {

        if(
          inp.classList.contains(
            "income-formula"
          )
        ){

          recalcIncomeRows()

        }
        else{

          const td =
            inp
              .closest("tr")
              ?.querySelector(
                ".actual-cell"
              )

          if(!td)
            return

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


/* =========================
   COMMISSION
========================= */

export function bindCommission(
  rates = []
){

  state.root
    .querySelectorAll(
      ".dropdown-select.commission-rate"
    )
    .forEach(dropdown => {

      const trigger =
        dropdown.querySelector(
          ".dropdown-select-trigger"
        )

      const row =
        dropdown.closest("tr")

      const td =
        row?.querySelector(
          ".actual-cell"
        )

      const range =
        row?.querySelector(
          ".commission-range"
        )

      if(!trigger || !row || !td){

        return

      }


      /* =========================
         REVENUE
      ========================= */

      const revenue =
        Number(
          trigger.dataset.revenue || 0
        )

      row.dataset.commissionRevenue =
        revenue


      /* =========================
         CHANGE
      ========================= */

      trigger.addEventListener(
        "change",
        () => {

          const revenue =
            Number(
              row.dataset.commissionRevenue || 0
            )


          const selectedRate =
            getDropdownValue(
              dropdown
            )


          let commission = 0


          /* =========================
             THEO BẬC
          ========================= */

          if(
            selectedRate === ""
            ||
            selectedRate === null
            ||
            selectedRate === undefined
          ){

            commission =
              calculateTieredCommission(
                revenue,
                rates
              )


            if(range){

              range.innerText =
                "└─ Theo bậc tự động"

            }

          }


          /* =========================
             CHỌN RATE THỦ CÔNG
          ========================= */

          else{

            const rate =
              Number(
                selectedRate
              )


            /*
              Logic cũ:

              toàn bộ doanh số
              × tỷ lệ được chọn
            */

            commission =
              Math.round(
                revenue *
                rate /
                100
              )


            const min =
              Number(
                trigger.dataset.min || 0
              )

            const max =
              Number(
                trigger.dataset.max || 0
              )


            if(range){

              range.innerText =
                "└─ Định mức: " +
                formatDecimal(min) +
                " - " +
                formatDecimal(max)

            }

          }


          /* =========================
             UPDATE COMMISSION
          ========================= */

          td.innerText =
            formatDecimal(
              commission
            )


          /* =========================
             UPDATE NET
          ========================= */

          calcNet()

        }
      )

    })

}