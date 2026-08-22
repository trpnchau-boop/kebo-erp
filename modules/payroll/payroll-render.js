import {state}
from "./payroll-state.js"

import {
formatDecimal
}
from "../../js/core/format.js"

import {
  renderDropdownSelect
}
from "/js/components/dropdown-select.js"

export function renderIncomeTable(

  incomes,
  commissionInfo,
  rates,
  tbodyIncome

){

  let html = ""

  for(

    let i=0;
    i<incomes.length;
    i++

  ){

    const a =
      incomes[i]

    let tc = 0
    let tt = 0

    let itemName =
      a.name

    let standardHtml = ""

    if(
      a.code === "SOCONG"
    ){

      tc =
        state.congChuan

      tt =
        state.congThucTe

    }
    else if(
      a.code === "LUONGCB"
    ){

      tc =
        state.luongTc

      tt =
        state.congChuan
        ? Math.round(

          state.luongTc /
          state.congChuan *
          state.congThucTe

        )
        : 0

    }
else if(
  a.code === "HOAHONG"
){

  /*
   * Mặc định:
   * → Theo bậc
   *
   * Nếu trước đó đã chọn thủ công:
   * → commissionInfo.isManualRate = true
   * → dùng commissionInfo.rate
   */

  const isManualRate =
    commissionInfo.isManualRate === true

  tc =
    isManualRate
      ? commissionInfo.rate
      : ""

  tt =
    commissionInfo.commission

  itemName = `

    <div>
      Hoa hồng
    </div>

    <div class="employee-role">
      └─ Doanh số:
      ${formatDecimal(
        commissionInfo.revenue
      )}
    </div>

    <div class="employee-role commission-range">
      ${
        isManualRate
          ? `
            └─ Định mức:
            ${formatDecimal(
              commissionInfo.dinhmuc_min
            )}
            -
            ${formatDecimal(
              commissionInfo.dinhmuc_max
            )}
          `
          : `
            └─ Theo bậc tự động
          `
      }
    </div>

  `


  /* =========================
     DROPDOWN OPTIONS
  ========================= */

  const options = rates.map(r => ({

    value:
      r.rate,

    label:
      r.rate + "%",

    dataset:{

      min:
        r.dinhmuc_min,

      max:
        r.dinhmuc_max

    }

  }))


  /* =========================
     DROPDOWN
  ========================= */

  standardHtml =

    renderDropdownSelect({

      /*
       * "" = Theo bậc
       */

      value:
        tc,

      options,

      className:
        "commission-rate",

      /*
       * Cho phép dòng rỗng
       */

      allowEmpty:
        true,

      emptyText:
        "Theo bậc",

      dataset:{

        revenue:
          commissionInfo.revenue

      }

    })

}
    else{

      tc =
      Number(
        a.value_default || 0
      )

      tt = tc

    }

    if(
      a.code !== "HOAHONG"
    ){

      standardHtml = `

        <input
          class="formula-input income-formula"
          data-code="${a.code}"
          value="${formatDecimal(tc)}"
          style="width:100%"
        >

      `

    }

    html += `

      <tr>

        <td align="center">
          ${i+1}
        </td>

        <td>
          ${itemName}
        </td>

        <td>
          ${standardHtml}
        </td>

        <td
          class="actual-cell"
          align="right"
        >
          ${formatDecimal(tt)}
        </td>

      </tr>

    `

  }

  tbodyIncome.innerHTML =
    html

}

export function renderDeductTable(

  deductions,
  tbodyDeduct

){

  let html = ""

  for(

    let i=0;
    i<deductions.length;
    i++

  ){

    const b =
      deductions[i]

    const tc =
      Number(
        b.value_default || 0
      )

    html += `

      <tr>

        <td align="center">
          ${i+1}
        </td>

        <td>
          ${b.name}
        </td>

        <td>

          <input
            class="formula-input deduct-formula"
            value="${formatDecimal(tc)}"
            style="width:100%"
          >

        </td>

        <td
          class="actual-cell"
          align="right"
        >
          ${formatDecimal(tc)}
        </td>

      </tr>

    `

  }

  tbodyDeduct.innerHTML =
    html

}