import { withSystemFields } from "./core.js"

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

}),

},

}