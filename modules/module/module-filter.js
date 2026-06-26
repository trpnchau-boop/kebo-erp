import {
  getDropdownValue
} from "/js/components/dropdown-select.js"

export function showUngroupedTables(){

  document
    .querySelectorAll('#table-body tr[data-id]')
    .forEach(row => {

      const code = getDropdownValue(
        row.querySelector(".dropdown-select")
      )

      row.style.display =
        !code
          ? ""
          : "none"

      row.classList.remove("active-row")
    })
}

export function showAllTables(){

  document
    .querySelectorAll('#table-body tr[data-id]')
    .forEach(row => {

      row.style.display = ""

      row.classList.remove("active-row")
    })
}

export function showGroupTables(module, table){

  document
    .querySelectorAll('#table-body tr[data-id]')
    .forEach(row => {

      const code = getDropdownValue(
        row.querySelector(".dropdown-select")
      )

      row.style.display =
        code === module
          ? ""
          : "none"

      row.classList.toggle(
        "active-row",
        row.querySelector("td")?.innerText === table
      )
    })
}