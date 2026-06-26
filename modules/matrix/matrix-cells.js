export function renderCheckboxCell(
row,
col,
checked
){

return `
<td>

<div
class="
matrix-check
${checked ? "state-extra" : "state-none"}
"
data-row="${row}"
data-col="${col}"
data-state="${
  checked
  ? "extra"
  : "none"
}"
>

${checked ? "✓" : ""}

</div>

</td>
`

}

export function renderAttendanceCell(
row,
col,
map
){

let value = ""

if(map){

value =
map.shift_code == null
? ""
: String(map.shift_code)

}

return `
<td
class="attendance-cell"
data-row="${row}"
data-col="${col}"
data-value="${value}"
>

</td>
`

}

export function renderCell(
config,
row,
col,
map,
meta = {}
){

if(config.cellType === "checkbox"){

  return renderCheckboxCell(
    row,
    col,
    !!map
  )

}

if(config.cellType === "attendance"){

  return renderAttendanceCell(
    row,
    col,
    map
  )

}

if(config.cellType === "user_permission"){

  return renderUserPermissionCell(
    row,
    col,
    meta.state || "none"
  )

}

return "<td></td>"

}


export function renderUserPermissionCell(
row,
col,
state
){

return `
<td>

<div
class="
matrix-check
state-${state}
"
data-row="${row}"
data-col="${col}"
data-state="${state}"
>

${
  state === "role"
  ? "✓"

  : state === "extra"
  ? "+"

  : ""
}

</div>

</td>
`

}