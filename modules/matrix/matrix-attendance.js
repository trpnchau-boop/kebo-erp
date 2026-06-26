export function bindAttendance(matrix){

const cells =
matrix.tbody.querySelectorAll(
".attendance-cell"
)

cells.forEach(cell=>{

renderAttendanceValue(
cell,
cell.dataset.value || ""
)

})

let isMouseDown = false
let dragValue = ""

/* =========================
CELL EVENTS
========================= */

cells.forEach(cell=>{

/* =========================
LEFT CLICK / DRAG
========================= */

cell.addEventListener(
"mousedown",
e=>{

/* chuột phải = xóa */

if(e.button === 2){

e.preventDefault()

isMouseDown = true
dragValue = ""

applyAttendance(
cell,
""
)

cell.classList.add(
"dragging"
)

return

}

/* chỉ xử lí chuột trái */

if(e.button !== 0){
return
}

e.preventDefault()

isMouseDown = true

const current =
cell.dataset.value || ""

const next =
getNextAttendanceValue(
current
)

dragValue = next

applyAttendance(
cell,
next
)

cell.classList.add(
"dragging"
)

}
)

/* =========================
DRAG ENTER
========================= */

cell.addEventListener(
"mouseenter",
()=>{

if(!isMouseDown) return

applyAttendance(
cell,
dragValue
)

cell.classList.add(
"dragging"
)

}
)

/* =========================
DRAG LEAVE
========================= */

cell.addEventListener(
"mouseleave",
()=>{

cell.classList.remove(
"dragging"
)

}
)

/* =========================
DISABLE CONTEXT MENU
========================= */

cell.addEventListener(
"contextmenu",
e=>{

e.preventDefault()

}
)

})

/* =========================
MOUSE UP
========================= */

document.addEventListener(
"mouseup",
()=>{

isMouseDown = false

cells.forEach(cell=>{

cell.classList.remove(
"dragging"
)

})

}
)

}

/* =========================
NEXT VALUE
========================= */

function getNextAttendanceValue(
value
){

if(value === ""){
return "1"
}

if(value === "1"){
return "0.5"
}

if(value === "0.5"){
return "0"
}

return ""

}

/* =========================
APPLY
========================= */

function applyAttendance(
cell,
value
){

cell.dataset.value = value

renderAttendanceValue(
cell,
value
)

updateRowTotal(
cell
)

}

/* =========================
RENDER
========================= */

function renderAttendanceValue(
  cell,
  value
){

  cell.innerHTML = ""

  if(!value){
    return
  }

  const mark =
    document.createElement("div")

  mark.className =
    "attendance-mark"

  if(value === "1"){

    mark.innerHTML = "✓"

    mark.style.background =
      "#dcfce7"

    mark.style.color =
      "#16a34a"

  }

  else if(value === "0.5"){

    mark.innerHTML = "1/2"

    mark.style.background =
      "#fde7b0"

    mark.style.color =
      "#d97706"

  }

  else if(value === "0"){

    mark.innerHTML = "x"

    mark.style.background =
      "#f7caca"

    mark.style.color =
      "#dc2626"

  }

  cell.appendChild(mark)

}

/* =========================
TOTAL
========================= */

function updateRowTotal(cell){

const tr =
cell.closest("tr")

const cells =
tr.querySelectorAll(
".attendance-cell"
)

let total = 0

cells.forEach(c=>{

const value =
Number(
c.dataset.value || 0
)

total += value

})

tr.querySelector(
".count-cell"
).innerHTML = total

}