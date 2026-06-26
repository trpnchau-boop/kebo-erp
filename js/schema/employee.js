import { withSystemFields } from "./core.js"

export const employeeSchema = {

data_employee:{
label:"Nhân sự",
layout:"inline",
fields:withSystemFields({

code:{
 label:"Mã nhân viên",
 showInList:true,
 autoCode:{
   prefix:"NS"
 }
},

name:{
label:"Họ và tên",
type:"text",
required:true,
showInList:true,
},

phone:{
label:"SĐT",
showInList:true,
type:"text",
},

chucvu:{
label:"Chức vụ ",
showInList:true,
type:"select",
ref:"roles",
value:"name",
text:"name"
},

work:{
label:"Công tiêu chuẩn",
showInList:true,
type:"number"
},

money:{
label:"Lương",
showInList:true,
type:"number",
format:"money",
},

congno:{
label:"Công nợ",
showInList:true,
type:"number",
format:"money"
}

})

},
}