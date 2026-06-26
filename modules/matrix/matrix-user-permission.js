export function bindUserPermission(
matrix
){

matrix.bindCellClick(

".matrix-check",

({el})=>{

const state =
el.dataset.state

/* role lock */

if(state === "role"){
  return
}

/* none -> extra */

if(state === "none"){

  el.dataset.state = "extra"

  el.className =
  "matrix-check state-extra"

  el.textContent = "+"

  return

}

/* extra -> none */

if(state === "extra"){

  el.dataset.state = "none"

  el.className =
  "matrix-check state-none"

  el.textContent = ""

}

}

)

}