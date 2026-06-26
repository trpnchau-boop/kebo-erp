// modules/document-list/document-list-fields.js

export const documentFields = {

  code:{
    label:"Số CT",
    width:"140px"
  },

  day:{
    label:"Ngày",
    type:"date",

    width:"120px"
  },

  id_customer:{
    label:"Khách hàng",
    width:"220px",
  },

  id_employee:{
    label:"Nhân viên",
    width:"180px",

    input:{
      type:"select",

      source:{
        table:"data_employee",
        value:"id",
        label:"name"
      },

      update(row,value){

        return {
          id_employee:
            value == null
            ? null
            : Number(value)
        }

      }
    }
  },

  note:{
    label:"Ghi chú"
  },

  tongthanhtoan:{
    label:"Tổng thanh toán",

    format:"money",

    align:"right",

    width:"140px"
  },

  tien_tt:{
    label:"Đã thanh toán",

    format:"money",

    align:"right",

    width:"100px",    

    input:{
      type:"money",
      realtime:true,
      update(row,value){
        return {
          tien_tt:value,
          no_tt: row.tongthanhtoan - value
        } 
      }
    }     
  },  

  status:{
    label:"Trạng thái",

    width:"140px"
  }

}