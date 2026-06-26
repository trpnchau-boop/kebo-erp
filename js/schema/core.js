const systemFields = {

id:{
type:"number",
hidden:true
},

created_at:{
label:"Ngày tạo",
type:"datetime",
hidden:true,
readonly:true
},

updated_at:{
label:"Cập nhật",
type:"datetime",
hidden:true,
readonly:true
},

is_act:{
label:"Hoạt động",
type:"checkbox",
default:true,
hidden:true
}

}


export function withSystemFields(fields){

return {
...systemFields,
...fields,

}

}

export const customerField = {
  label:"Khách hàng",
  type:"select",
  source:"data_customer",
  value:"id",
  text:"name"
}