import {
  withSystemFields,
  customerField
} from "./core.js"

export const documentSchema = {

document: {

table: "document",

fields:withSystemFields({

code: {
label: "Số chứng từ",
type: "text"
},

type: {
label: "Loại",
type: "select",
source: "set_document_type",
value: "code",
text: "name"
},

day: {
label: "Ngày",
type: "date"
},

id_customer: {
label: "Khách hàng",
type: "select",
source: "data_customer",
value: "id",
text: "name"
},

id_employee: {
label: "Nhân viên",
type: "select",
source: "data_employee",
value: "id",
text: "name"
},

note: {
label: "Ghi chú",
type: "textarea"
},

tongtien: {
label: "Tổng thành tiền",
type:"number",
format:"money",
readonly:true
},

chietkhau: {
label: "Chiết khấu",
type:"number",
format:"money"
},

thue: {
label: "Thuế",
type:"number",
format:"money"
},

tongthanhtoan: {
label: "Tổng thanh toán",
type:"number",
format:"money",
readonly:true
},

tien_tt: {
label: "Đã thanh toán",
type:"number",
format:"money"
},

no_tt: {
label: "Chưa thanh toán",
type:"number",
format:"money",
readonly:true
},

tongtienvon: {
label: "Tổng tiền vốn",
type:"number",
format:"money",
readonly:true
},

phathanh: {
label: "Phát hành",
type: "textarea"
},
 
ref: {
label: "Tham chiếu",
type: "textarea"
},

})

},

document_items: {

table: "document_items",

fields:withSystemFields({

id_doc: {
label: "Số chứng từ",
type: "number",
source: "document",
value: "id",
text: "code",
showInList:true
},

id_customer: {
label: "Khách hàng",
type: "number",
source: "document",
value: "id",
text: "name",
showInList:true
},

id_warehouse: {
label: "Kho",
type: "select",
source: "set_kho",
value: "id",
text: "name"
},

id_product: {
label: "Sản phẩm",
type: "select",
source: "data_product",
value: "id",
text: "name"
},

name: {
label: "Tên sản phẩm",
type: "textarea",
showInList:true
},

parent_id:{
label:"Biến thể",
type:"number"
},

tongsoluong: {
label: "Tổng số lượng",
type: "number",
showInList:true
},

dvtGoc:{
label:"Đvt gốc",
type:"text",
showInList:true
},

dongia: {
label: "Đơn giá",
type: "number",
showInList:true
},

thanhtien:{
label:"Thành tiền",
type:"number",
format:"money",
readonly:true,
showInList:true
},

tienvon:{
label:"Tiền vốn",
type:"number"
},

cost_alloc: {
label: "Phí phân bổ",
type: "number"
},

note: {
label: "Ghi chú",
type: "textarea",
showInList:true
},

qty: {
label: "Số lượng",
type: "number"
},

id_unit: {
label: "Đơn vị",
type: "select",
source: "product_unit",
value: "id",
text: "unit"
},

dongiavon: {
label: "Đơn giá vốn",
type: "number"
},

line: {
label: "Định lượng",
type: "number"
},

tinhchat: {
label: "Tính chất",
type: "text",
},

})
},

tax_invoice: {

table: "tax_invoice",

fields:withSystemFields({

code: {
label: "Số chứng từ",
type: "text"
},

type: {
label: "Loại",
type: "select",
source: "set_document_type",
value: "code",
text: "name"
},

day: {
label: "Ngày",
type: "date"
},

id_customer: {
label: "Khách hàng",
type: "select",
source: "data_customer",
value: "id",
text: "name"
},

id_employee: {
label: "Nhân viên",
type: "select",
source: "data_employee",
value: "id",
text: "name"
},

note: {
label: "Ghi chú",
type: "textarea"
},

tongtien: {
label: "Tổng thành tiền",
type:"number",
format:"money",
readonly:true
},

chietkhau: {
label: "Chiết khấu",
type:"number",
format:"money"
},

thue: {
label: "Thuế",
type:"number",
format:"money"
},

tongthanhtoan: {
label: "Tổng thanh toán",
type:"number",
format:"money",
readonly:true
},

tien_tt: {
label: "Đã thanh toán",
type:"number",
format:"money"
},

no_tt: {
label: "Chưa thanh toán",
type:"number",
format:"money",
readonly:true
},

tongtienvon: {
label: "Tổng tiền vốn",
type:"number",
format:"money",
readonly:true
},

phathanh: {
label: "Phát hành",
type: "textarea"
},
 
ref: {
label: "Tham chiếu",
type: "textarea"
},

})

},

tax_invoice_items: {

table: "tax_invoice_items",

fields:withSystemFields({

id_doc: {
label: "Số chứng từ",
type: "number",
source: "document",
value: "id",
text: "code"
},

id_warehouse: {
label: "Kho",
type: "select",
source: "set_kho",
value: "id",
text: "name"
},

id_product: {
label: "Sản phẩm",
type: "select",
source: "data_product",
value: "id",
text: "name"
},

name: {
label: "Tên sản phẩm",
type: "textarea"
},

parent_id:{
label:"Biến thể",
type:"number"
},

tongsoluong: {
label: "Tổng số lượng",
type: "number"
},

dvtGoc:{
label:"Đvt gốc",
type:"text"
},

dongia: {
label: "Đơn giá",
type: "number"
},

thanhtien:{
label:"Thành tiền",
type:"number",
format:"money",
readonly:true
},

tienvon:{
label:"Tiền vốn",
type:"number"
},

cost_alloc: {
label: "Phí phân bổ",
type: "number"
},

note: {
label: "Ghi chú",
type: "textarea"
},

qty: {
label: "Số lượng",
type: "number"
},

id_unit: {
label: "Đơn vị",
type: "select",
source: "product_unit",
value: "id",
text: "unit"
},

dongiavon: {
label: "Đơn giá vốn",
type: "number"
},

})
},

}