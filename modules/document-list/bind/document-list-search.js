export function bindSearch(ctx){

  const input =

    document.querySelector(
      "#search-input"
    )

  if(!input)
    return

  input.addEventListener(
    "input",
    ()=>{

      ctx.search =
        input.value.trim()

      ctx.reload()

    }
  )

}