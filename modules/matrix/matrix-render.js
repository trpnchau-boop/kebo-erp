import {
renderCell
}
from "./matrix-cells.js"

export function renderMatrix(
matrix,
config,
rows,
cols,
maps,
roleMaps = []
){

renderHead(
matrix,
config,
cols
)

renderBody(
matrix,
config,
rows,
cols,
maps,
roleMaps
)

}
export function renderHead(
matrix,
config,
cols
){

let html = ""

/* =========================
DAYS HEADER
========================= */

if(config.columnsSource === "days"){

html += "<tr>"

html += `
<th class="matrix-main-head" rowspan="2">
${config.label}
</th>
`

if(config.showCount){

html += `
<th class="matrix-main-head" rowspan="2">
Đếm
</th>
`

}

for(const col of cols){

html += `
<th class="matrix-day-head">
${String(col.day).padStart(2,"0")}
</th>
`

}

html += "</tr>"

html += "<tr>"

for(const col of cols){

const week = [
"CN",
"T2",
"T3",
"T4",
"T5",
"T6",
"T7"
]

html += `
<th class="weekday-head">
${week[col.weekday]}
</th>
`

}

html += "</tr>"

}

/* =========================
NORMAL HEADER
========================= */

else{

html += "<tr>"

html += `
<th>
${config.label}
</th>
`

for(const col of cols){

  html += `
  <th class="matrix-col-head">

    <div class="matrix-col-title">
      ${col[config.columnText] || ""}
    </div>

    ${
      config.columnSubText
      ? `
        <div class="matrix-col-sub">
          ${col[config.columnSubText] || ""}
        </div>
      `
      : ""
    }

  </th>
  `

}

html += "</tr>"

}

matrix.setHead(html)

}

export function renderBody(
matrix,
config,
rows,
cols,
maps,
roleMaps = []
){

let html = ""

const mapIndex = new Map()
const roleMapIndex = new Map()

for(const m of maps){

const key =
m[config.mapRowField]
+
"|"
+
m[config.mapColumnField]

mapIndex.set(key,m)

}

for(const m of roleMaps){

const key =
m.permission_code
+
"|"
+
m.role_id

roleMapIndex.set(key,m)

}

for(const row of rows){

let total = 0

let rowHtml = ""

for(const col of cols){

const colValue =
config.columnsSource === "days"
? col.date
: col[config.columnCode]

const value =
mapIndex.get(
String(row[config.rowCode])
+
"|"
+
String(colValue)
)

let state = "none"

if(config.cellType === "user_permission"){

  const roleKey =
  String(row[config.rowCode])
  +
  "|"
  +
  String(col.role_id)

  const hasRole =
  roleMapIndex.has(roleKey)

  if(hasRole){

    state = "role"

  }else if(value){

    state = "extra"

  }

}

const shift =
Number(value?.shift_code ?? 0)

total += shift

rowHtml += renderCell(

config,

row[config.rowCode],

config.columnsSource === "days"
? col.date
: col[config.columnCode],

value,

{
  state
}

)

}

html += "<tr>"

html += `
<td class="employee-cell">

<div class="barcode-link">

${
config.employeeLink
? `
<a
href="#/payroll/employee/${row.id}"
class="barcode-link"
>
${row[config.rowText] || ""}
</a>
`
: row[config.rowText] || ""
}

</div>

${
config.rowSubText
? `
<div class="employee-role">
└─ ${row[config.rowSubText] || ""}
</div>
`
: ""
}

</td>
`

if(config.showCount){

html += `
<td class="count-cell">
${total}
</td>
`

}

html += rowHtml

html += "</tr>"

}

matrix.setBody(html)

}