//core/store.js//

import {
  createPage
}
from "/modules/print/models/create-page.js"

import {
  createSection
}
from "/modules/print/models/create-section.js"

/* =========================================================
CREATE BLOCK
========================================================= */

function createBlock({

  id = crypto.randomUUID(),

  type = "text",

  x = 40,
  y = 40,

  width = 120,
  height = 40,

  props = {},
  style = {}

} = {}){

  return {

    id,

    type,

    x,
    y,

    width,
    height,

    rotate:0,

    visible:true,

    zIndex:1,

    props,

    style
  }
}

/* =========================================================
INITIAL STATE
========================================================= */

export const printState = {

  document:{

    page:
      createPage(),

    sections:[

      /* ===============================================
      HEADER
      ================================================ */

      {
        ...createSection({

          name:"Header",

          y:40,

          height:240
        }),

        blocks:[

          createBlock({

            type:"text",

            x:40,
            y:40
          }),

          createBlock({

            type:"image",

            x:220,
            y:40,

            width:160,
            height:120,

            props:{
              src:
                "https://dummyimage.com/400x300"
            }
          })
        ]
      },

      /* ===============================================
      CONTENT
      ================================================ */

      {
        ...createSection({

          name:"Content",

          y:320,

          height:400
        }),

        blocks:[

          createBlock({

            type:"table",

            x:40,
            y:40,

            width:520,

            props:{

              rowHeight:32,

              columns:[

                {
                  key:"name",
                  label:"Tên SP",
                  width:260
                },

                {
                  key:"qty",
                  label:"SL",
                  width:80
                },

                {
                  key:"price",
                  label:"Đơn giá",
                  width:180
                }
              ],

              rows:[

                {
                  name:"Coca",
                  qty:"2",
                  price:"20,000"
                },

                {
                  name:"Pepsi",
                  qty:"1",
                  price:"15,000"
                },

                {
                  name:"7UP",
                  qty:"5",
                  price:"100,000"
                }
              ]
            }
          })
        ]
      },

      /* ===============================================
      FOOTER
      ================================================ */

      {
        ...createSection({

          name:"Footer",

          y:760,

          height:140
        }),

        blocks:[

          createBlock({

            type:"text",

            x:40,
            y:40
          })
        ]
      }
    ]
  },

  /* =======================================================
  SELECTION
  ======================================================= */

  selectedIds:[],

  selectedSectionId:null,

  selectedColumnIndex:null,

  templateId:null,

  /* =======================================================
  UI
  ======================================================= */

  dragging:false,

  resizing:false,

  guides:[],

  selectionBox:null
}

/* =========================================================
LISTENERS
========================================================= */

const listeners =
  new Set()

/* =========================================================
EMIT
========================================================= */

function emit(){

  listeners.forEach(listener=>{

    listener(printState)
  })
}

/* =========================================================
STORE
========================================================= */

export const printStore = {

  /* =======================================================
  GET STATE
  ======================================================= */

  getState(){

    return printState
  },

  /* =======================================================
  SET STATE
  ======================================================= */

  setState(callback){

    if(
      typeof callback !==
      "function"
    ){
      return
    }

    callback(printState)

    emit()
  },

  /* =======================================================
  PATCH STATE
  ======================================================= */

  patchState(patch = {}){

    Object.assign(
      printState,
      patch
    )

    emit()
  },

  /* =======================================================
  SUBSCRIBE
  ======================================================= */

  subscribe(listener){

    listeners.add(listener)

    return ()=>{

      listeners.delete(listener)
    }
  }
}
