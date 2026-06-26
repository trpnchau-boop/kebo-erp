import { getOne} from "/js/crud.js"

import { mountPrint} from "/modules/print/core/mount-print.js"

export async function init(
  params = {}
){

  const appRoot =
    document.querySelector(
      ".tab-host.active"
    )

  if(!appRoot){
    return
  }

  const html =
    await fetch(
      "/modules/print/print.html"
    )
    .then(r=>r.text())

  appRoot.innerHTML =
    html
  
  let template = null

  if(params.type &&
  params.type !== "new"){

    template =
      await getOne(
        "print_templates",
        params.type
      )
  }

  mountPrint({
 
    root:
      document.querySelector(
        "#print-root"
      ),

    template
  })
}