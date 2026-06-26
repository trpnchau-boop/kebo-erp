import { withSystemFields } from "./core.js"

export const customerSchema = {

data_customer:{
label:"Khách hàng",
layout:"inline",
fields:withSystemFields({

id_khuvuc:{
label:"Khu vực",
type:"select",
ref:"set_kh_khuvuc",
value:"id",
text:"name"
},

code:{
 label:"Mã khách hàng",
 showInList:true,
 autoCode:{
   source:"id_khuvuc",
   table:"set_kh_khuvuc",
   prefix:"KH"
 }
},

name:{
label:"Tên khách hàng",
type:"text",
required:true,
showInList:true,
},

customer_type:{
label:"Type khách",
type:"select",
ref:"set_kh_money",
value:"khachhang",
text:"khachhang"
},

phone:{
label:"Số điện thoại",
type:"text",
showInList:true,
},

add:{
label:"Địa chỉ",
type:"text",
},

mst:{
label:"MST",
type:"text",
showInList:true,
},

donvi:{
label:"Đơn vị",
type:"text"
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