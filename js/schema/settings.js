import { withSystemFields } from "./core.js"

export const settingsSchema = {

set_document_type:{
  label:"Type chứng từ",
  fields:withSystemFields({
    name:{
      label:"Loại chứng từ",
      type:"text",
      showInList:true
    },
    code:{
      label:"Kí hiệu",
      type:"text"
    },
    prefix:{
      label:"Kí hiệu ct",
      type:"text"
    },
    stock:{
      label:"Giao dịch kho",
      type:"text"
    }
   })
},    

set_kh_khuvuc:{
  label:"Khu vực khách hàng",
  columns:3,
  fields:withSystemFields({
    prefix:{
      label:"Mã khu vực",
      type:"text"
    },
    name:{
      label:"Tên khu vực",
      type:"text",
      showInList:true
    }
   })
},

set_kh_money:{
  label:"Type khách hàng",
  columns:4,  
  fields:withSystemFields({
    khachhang:{
      label:"Khách hàng",
      type:"text"
    },
    set_dongia:{
      label:"Giá cố định",
      type:"select",
      options:[
        {value:"dongia1", text:"đơn giá"},
        {value:"giavon", text:"giá vốn"},
        {value:"gianhapGoc", text:"giá nhập"},
        {value:"dongia2", text:"đơn giá 2"},
        {value:"dongia3", text:"đơn giá 3"}
      ],
      showInList:true
    },

    fallback:{
      label:"Fallback",
      type:"multi_select_tags",
      options:[
        {value:"dongia1", text:"đơn giá"},
        {value:"giavon", text:"giá vốn"},
        {value:"gianhapGoc", text:"giá nhập"},
        {value:"dongia2", text:"đơn giá 2"},
        {value:"dongia3", text:"đơn giá 3"}
       ]
    },
   })
},

set_kho:{
  label:"Kho",
  columns:4,
  fields:withSystemFields({
    name:{
      label:"Tên kho",
      type:"text",
      showInList:true
    },
    kihieu:{
      label:"Kí hiệu",
      type:"text"
    },
  })
},

set_ns_rate:{
  label:"KPI",
  columns:5,
  fields:withSystemFields({
    steps:{
      label:"",
      type:"text",
    },
    dinhmuc_min:{
      label:"Min",
      type:"number",
      format:"money"
    },
    dinhmuc_max:{
      label:"Max",
      type:"number",
      format:"money"
    },
    rate:{
      label:"Hoa hồng",
      type:"number",
      format:"percent"
    },    
  })
},

set_payroll_item:{
  label:"Lương",
  columns:7,
  fields:withSystemFields({
    code:{
      label:"Mã",
      type:"text",
    },
    name:{
      label:"Tên",
      type:"text"
    },
    type:{
      label:"Phân loại",
      type:"select",
      options:[
        {value:"income", text:"Thu nhập"},
        {value:"deduction", text:"Giảm trừ"},
       ]
    },  
    value_default:{
      label:"Mặc định (vnđ)",
      type:"number",
      format:"money"
    },    
    sort_order:{
      label:"Line",
      type:"text"
    },     
    note:{
      label:"note",
      type:"text"
    },       
  })
},

set_sp_dvt:{
  label:"Đơn vị tính",
  columns:2,
  fields:withSystemFields({
    dvt:{
      label:"Đơn vị",
      type:"text",
      required:true,
      showInList:true
    }
  })
},

set_sp_group:{
  label:"Nhóm sản phẩm",
  columns:3,
  fields:withSystemFields({
    name:{
      label:"Tên nhóm",
      type:"text",
      required:true,
      showInList:true
    },
    prefix:{
      label:"Kí hiệu",
      type:"text"
    }
  })
},

module_groups:{ 
  label:"Nhóm modules",
  formHead:true,
  fields:withSystemFields({
    code:{
      label:"Mã kho",
      type:"text",
      showInList:true
    },
    name:{
      label:"Tên modules",
      type:"text"
    },
  })
},

}