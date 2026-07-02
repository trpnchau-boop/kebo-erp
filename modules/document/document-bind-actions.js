import {
  documentActions
}
from "./actions/index.js"

import {
  focusTo
}
from "/js/keyboard.js"

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

  async function finishDocument(state){

    await documentActions.clearDocument({

      root,
      schema,
      state

    })

    focusTo("id_customer")

  }

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

        /* =====================================
        SAVE
        ===================================== */

        if(event === "saveDocument"){

          const result =
            await documentActions.saveDocument({

              root,
              schema,
              state,

              button: btn,
              input: btn._input

            })

          if(result){
            await finishDocument(state)
          }

          return

        }

        /* =====================================
        PRINT
        ===================================== */

        if(event === "printDocument"){
          
          const result =
          await documentActions.saveDocument({
            
            root,
            schema,
            state,

            button: btn,
            input: btn._input

          })

          if(!result){
            return
          }  

          await documentActions.printDocument({
            document: result.header,
            items: result.items
          })
  
          await finishDocument(state)
          return
        }

        /* =====================================
        DEFAULT
        ===================================== */

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