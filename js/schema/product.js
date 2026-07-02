import { withSystemFields } from "./core.js"

export const productSchema = {

data_product:{
label:"Sản phẩm",
layout:"3col",
bulkEdit:true,
fields:withSystemFields({

code:{
 label:"Mã sản phẩm",
 showInList:true,
 autoCode:{
   source:"id_group",
   table:"set_sp_group",
   prefix:"SP"
 }
},

parent_id:{
type:"number",
hidden:true
}, 

barcode:{
label:"Barcode",
type:"text",
hidden:true,
showInList:true,
},

type:{
label:"Phân loại",
type:"select",
options:[
{value:"single",text:"Sản phẩm thường"},
{value:"variant",text:"Sản phẩm có biến thể"},
{value:"combo",text:"Combo"}
],
},

id_group:{
label:"Nhóm sản phẩm",
type:"select",
ref:"set_sp_group",
value:"id",
text:"name"
},

name:{
label:"Tên sản phẩm",
type:"text",
required:true,
showInList:true,
showInQuote:true,
span:3
},

tinhchat:{
label:"Tính chất",
type:"text",
showInList:true,
showInQuote:true,
},

dvtGoc:{
label:"ĐVT gốc",
showInList:true,
showInQuote:true,
type:"select",
ref:"set_sp_dvt",
value:"dvt",
text:"dvt"
},

dinhluong:{
label:"Định lượng",
type:"number",
required:true,
showInQuote:true,
},

dongia1:{
label:"Giá bán",
showInList:true,
showInQuote:true,
type:"number",
format:"money"
},

dongia2:{
label:"Giá bán 2",
type:"number",
format:"money"
},

dongia3:{
label:"Giá bán 3",
type:"number",
format:"money"
},

giavon:{
label:"Giá vốn",
showInQuote:true,
showInList:true,
permission:{

  view:"view_sensitive",

},
type:"number",
format:"money"
},

gianhapGoc:{
label:"Giá nhập",
showInList:true,
permission:{

  view:"view_sensitive",

  edit:"edit_sensitive"

},
type:"number",
format:"money"
},

id_warehouse:{
label:"Kho mặc định",
type:"select",
ref:"set_kho",
value:"id",
text:"name"
},

image_url:{
  label:"Image",
  showInList:true,
  showInQuote:true,  
  type:"image",
  bucket:"product-images",
  span:3
},

show_catalog:{
  label:"Catalog",
  showInList:true,
  type:"checkbox"
},

catalog_priority:{
  label:"Ưu tiên Catalog",
  showInList:true,
  type:"checkbox"
},

qty:{
  label:"Số lượng",
  showInQuote:true,
  showInForm:false,
  type:"number",
  virtual:true
},

note:{
  label:"Ghi chú",
  showInQuote:true,
  showInForm:false,
  type:"text",
  virtual:true
},

})
},

product_unit:{
label:"Quy cách sản phẩm",

fields:withSystemFields({

id_sp:{
label:"Sản phẩm",
type:"number"
},

unit:{
label:"Đơn vị",
type:"select",
ref:"set_sp_dvt",
value:"dvt",
text:"dvt"
},

ratio:{
label:"Quy đổi",
type:"number"
}

})
},

product_structure:{
label:"Cấu trúc sản phẩm",

fields:withSystemFields({

product_id:{
label:"SP cha",
type:"number"
},

id_sp_con:{
label:"SP con",
type:"number"
},

qty:{
label:"Số lượng",
type:"number"
}

})
},

}