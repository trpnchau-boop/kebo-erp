import {
  createSection
}
from "./create-section.js"

export function createDocument(){

  return {

    page:{
      width:794,
      height:1123,
      marginTop:40,
      marginRight:40,
      marginBottom:40,
      marginLeft:40
    },

    sections:[

      createSection("header"),
      createSection("body"),
      createSection("footer")

    ]
  }
}