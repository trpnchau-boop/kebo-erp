import { withSystemFields } from "./core.js"
import {
  documentItemOptions
}
from "./document-item-options.js"

export const printSchema = {

print_templates:{

label:"Prints",

fields:withSystemFields({

name:{
label:"Mẫu in",
type:"text",
showInList:true,
},

type_code:{
 label:"Type",
 showInList:true,
},

detail_group:{
 label:"Sắp xếp",
 showInList:true,
 type:"select",
 options: documentItemOptions
}

}),

},

}