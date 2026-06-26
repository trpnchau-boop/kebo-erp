import {getAll}
from "../../js/crud.js"

import {
initPayrollSave,
loadSoft
}
from "./payroll-save.js"

import {
getCommissionInfo
}
from "./payroll-commission.js"

import {state}
from "./payroll-state.js"

import {
calcNet,
recalcIncomeRows
}
from "./payroll-engine.js"

import {
bindInputs,
bindCommission
}
from "./payroll-bind.js"

import {
renderIncomeTable,
renderDeductTable
}
from "./payroll-render.js"

function $(id){

  return state.root
  .querySelector(
    `#${id}`
  )

}

export async function init(
  params = {},
  pageRoot
){

  state.root =
  pageRoot

  state.employeeId =
  params.ref || null

  state.monthInput =
  $("month")

  state.employeeSelect =
  $("employee")

  state.tbodyIncome =
  $("tbody-income")

  state.tbodyDeduct =
  $("tbody-deduct")

  state.sumIncomeEl =
  $("sum-income")

  state.sumDeductEl =
  $("sum-deduct")

  state.netPayEl =
  $("net-pay")

  state.titleMonth =
  $("title-month")

  state.employeeInfo =
  $("employee-info")

  const now =
  new Date()

  state.monthInput.value =

    now.getFullYear() +
    "-" +

    String(
      now.getMonth()+1
    ).padStart(
      2,
      "0"
    )

  await loadEmployees()

  $("btn-load")
  ?.addEventListener(
    "click",
    render
  )

  state.employeeSelect
  ?.addEventListener(
    "change",
    render
  )

  state.monthInput
  ?.addEventListener(
    "change",
    render
  )

  initPayrollSave({

    root:
    state.root,

    monthInput:
    state.monthInput,

    employeeSelect:
    state.employeeSelect,

    calcNet

  })

  await render()

}

async function loadEmployees(){

  const rows =

  await getAll(

    "data_employee",

    {
      is_act:true
    }

  )

  state.employeeSelect
  .innerHTML =

    rows.map(r=>`

      <option
        value="${r.id}"
      >

        ${r.code}
        -
        ${r.name}

      </option>

    `).join("")

  if(
    state.employeeId
  ){

    state.employeeSelect
    .value =

      state.employeeId

  }

}

async function render(){

  const ym =
  state.monthInput.value

  const id_employee =
  Number(
    state.employeeSelect.value || 0
  )

  if(
    !id_employee
  ) return

  const employees =
  await getAll(
    "data_employee",
    {
      is_act:true
    }
  )

  const emp =
  employees.find(
    x =>
    Number(x.id) ===
    id_employee
  )

  if(!emp) return

  const items =
  await getAll(
    "set_payroll_item",
    {
      is_active:true
    }
  )

  const attends =
  await getAll(
    "attendance",
    {
      month:ym,
      id_employee
    }
  )

  const commissionInfo =

  await getCommissionInfo({

    id_employee,
    ym

  })

  const rates =
  await getAll(
    "set_ns_rate",
    {
      is_act:true
    }
  )

  state.congThucTe =

    attends.reduce(

      (sum,r)=>

      sum +

      (
        Number(
          r.shift_code
        ) || 0
      ),

      0

    )

  state.congChuan =
  Number(
    emp.work || 0
  )

  state.luongTc =
  Number(
    emp.money || 0
  )

  items.sort(
    (a,b)=>

    (a.sort_order||0)
    -

    (b.sort_order||0)
  )

  const incomes =
  items.filter(
    x =>
    x.type === "income"
  )

  const deductions =
  items.filter(
    x =>
    x.type === "deduction"
  )

  state.titleMonth.innerText =

    "BẢNG LƯƠNG - THÁNG " +
    ym

  state.employeeInfo.innerText =

    (emp.code || "") +
    " - " +

    (emp.name || "") +
    " - " +

    (emp.chucvu || "")

  renderIncomeTable(

    incomes,
    commissionInfo,
    rates,
    state.tbodyIncome

  )

  renderDeductTable(

    deductions,
    state.tbodyDeduct

  )

  bindInputs(
    state.root
  )

  bindCommission()

  loadSoft({

    root:
    state.root,

    monthInput:
    state.monthInput,

    employeeSelect:
    state.employeeSelect,

    calcNet

  })

  recalcIncomeRows()

  calcNet()

}