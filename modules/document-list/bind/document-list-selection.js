// document-list-selection.js

export function bindCheckAll({
  thead,
  tbody
}){

  if(tbody.__selectionBound)
    return

  tbody.__selectionBound = true

  const checkAll =
    thead.querySelector(
      "#check-all"
    )

  if(!checkAll) return

  checkAll.addEventListener(
    "change",
    ()=>{

      tbody

      .querySelectorAll(
        ".row-checkbox"
      )

      .forEach(cb=>{

        cb.checked =
          checkAll.checked

      })

    }
  )

  tbody.addEventListener(
    "change",
    e=>{

      if(
        !e.target.matches(
          ".row-checkbox"
        )
      ) return

      syncCheckAll({
        thead,
        tbody
      })

    }
  )

}

export function syncCheckAll({
  thead,
  tbody
}){

  const checkAll =
    thead.querySelector(
      "#check-all"
    )

  if(!checkAll) return

  const all =
    tbody.querySelectorAll(
      ".row-checkbox"
    )

  const checked =
    tbody.querySelectorAll(
      ".row-checkbox:checked"
    )

  checkAll.checked =

    all.length > 0 &&

    all.length === checked.length

}

export function getSelectedIds(
  tbody
){

  return [

    ...tbody.querySelectorAll(
      ".row-checkbox:checked"
    )

  ]

  .map(cb=>Number(cb.value))

}