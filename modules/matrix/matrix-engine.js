export function createMatrix(root){

const thead =
root.querySelector("#thead")

const tbody =
root.querySelector("#tbody")

/* =========================
HEAD
========================= */

function setHead(html){

thead.innerHTML = html

}

/* =========================
BODY
========================= */

function setBody(html){

tbody.innerHTML = html

}

/* =========================
CLEAR
========================= */

function clear(){

thead.innerHTML = ""
tbody.innerHTML = ""

}

/* =========================
CELL
========================= */

function getCell(row,col){

return tbody.querySelector(
`[data-row="${row}"][data-col="${col}"]`
)

}


/* =========================
CELL CLICK
========================= */

function bindCellClick(
selector,
onClick
){

tbody
.querySelectorAll(selector)
.forEach(el=>{

el.addEventListener(
"click",
()=>{

onClick({

row: el.dataset.row,
col: el.dataset.col,
el

})

}
)

})

}

/* =========================
RETURN
========================= */

return {

thead,
tbody,

setHead,
setBody,
clear,

getCell,

bindCellClick

}

}