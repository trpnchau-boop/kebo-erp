import {
  documentActions
}
from "./actions/index.js"

export function bindDocumentActions({

  root,
  schema

}){

  if(
    root.dataset.actionsBinded === "1"
  ){
    return
  }

  root.dataset.actionsBinded = "1"

  root.addEventListener(
    "click",
    async e=>{

      const btn =
        e.target.closest(
          "button[data-event]"
        )

      if(!btn){
        return
      }

      const event =
        btn.dataset.event

      const handler =
        documentActions[event]

      if(!handler){

        console.warn(
          "Missing action:",
          event
        )

        return
      }

      const state =
        root._docState

      if(!state){

        console.warn(
          "Document state missing"
        )

        return
      }

      try{

        btn.disabled = true

        await handler({

          root,
          schema,
          state,

          button: btn,
          input: btn._input,

          document:
            state.header,

          items:
            state.items

        })

      }

      catch(error){

        console.error(error)

      }

      finally{

        btn.disabled = false

      }

    }
  )

}