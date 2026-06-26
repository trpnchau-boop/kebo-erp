//js/schema/company.js//

export const companySchema = {

set_company:{
label:"Thông tin doanh nghiệp",

fields:({

code:{
label:"Mã đơn vị",
type:"text",
showInList:true
},

name:{
label:"Tên doanh nghiệp",
type:"text",
required:true,
print:{show:true},
showInList:true
},

tax_code:{
label:"Mã số thuế",
type:"text",
print:{show:true},
showInList:true
},

phone:{
label:"Số điện thoại",
type:"text",
print:{show:true}
},

address:{
label:"Địa chỉ",
type:"textarea",
print:{show:true}
},

bank_name:{
label:"Ngân hàng",
type:"text",
print:{show:true}
},

bank_account:{
label:"Số tài khoản",
type:"text",
print:{show:true}
},

bank_owner:{
label:"Chủ tài khoản",
type:"text",
print:{show:true}
},

email:{
label:"Email",
type:"text",
},

website:{
label:"Website",
type:"text",

},

note:{
label:"Ghi chú",
type:"textarea",
print:{show:true}
}

})

},
}