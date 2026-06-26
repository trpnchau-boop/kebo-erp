import { withSystemFields } from "./core.js"

export const authSchema = {

  /* =========================
  ROLES
  ========================= */

  roles:{
    label:"Cấp truy cập",
    formHead:true,

    fields:withSystemFields({

      code:{
        label:"Level",
        type:"text"
      },

      name:{
        label:"Tên cấp",
        type:"text",
        showInList:true
      }

    })

  },

  /* =========================
  PERMISSIONS
  ========================= */

  permissions:{
    label:"Quyền truy cập",

    fields:withSystemFields({

      code:{
        label:"Mã quyền",
        type:"text",
        showInList:true
      },

      name:{
        label:"Truy cập",
        type:"text",
        showInList:true
      },

      module_code:{
        label:"Module",
        type:"text",
        showInList:true
      },

      action_code:{
        label:"Action",
        type:"text",
        showInList:true
      }

    })

  },

  /* =========================
  PERMISSION MATRIX
  ========================= */

  permission_matrix:{
    label:"Phân quyền",

    type:"matrix",

    cellType:"checkbox",

    rowsTable:"permissions",

    columnsTable:"roles",

    mapTable:"role_permissions",

    rowCode:"code",

    columnCode:"id",

    mapRowField:"permission_code",

    mapColumnField:"role_id",

    rowText:"name",

    columnText:"name",

    filters:[
      "module_code",
      "action_code"
    ]

  },

  user_permission_matrix:{

  label:"Phân quyền tài khoản",

  type:"matrix",

  cellType:"user_permission",

  rowsTable:"permissions",

  columnsTable:"vw_users",

  mapTable:"user_permission_extra",

  rowCode:"code",

  columnCode:"id",

  mapRowField:"permission_code",

  mapColumnField:"user_id",

  rowText:"name",

  columnText:"employee_name",

  columnSubText:"role_name",

  filters:[
    "module_code",
    "action_code"
  ]

},


  attendance_matrix:{

    label:"Chấm công",

    type:"matrix",

    cellType:"attendance",

    rowsTable:"data_employee",

    columnsSource:"days",

    mapTable:"attendance",

    rowCode:"id",

    rowText:"name",

    showCount:true,

    rowSubText:"chucvu",

    mapRowField:"id_employee",

    mapColumnField:"day",

    employeeLink:true

  },

  /* =========================
  USER ACCOUNT
  ========================= */

  user_account:{

    label:"Tài khoản",

    layout:"inline",

    type:"api",

    fields:{

      email:{
        label:"Email",
        type:"text",
        required:true
      },

      password:{
        label:"Mật khẩu",
        type:"password",
        required:true
      },

      role:{
        label:"Vai trò",
        type:"select",
        ref:"roles",
        value:"code",
        text:"name",
        required:true
      },

      employee_id:{
        label:"Nhân sự",
        type:"select",
        ref:"data_employee",
        value:"id",
        text:"name",
        required:true
      }

    },

    onSave: async ({root})=>{

      const email =
      root.querySelector(
      '[data-field="email"]'
      ).value

      const password =
      root.querySelector(
      '[data-field="password"]'
      ).value

      const role =
      root.querySelector(
      '[data-field="role"]'
      ).value

      const employee_id =
      root.querySelector(
      '[data-field="employee_id"]'
      ).value

      if(
        !email ||
        !password ||
        !role
      ){
        alert("Thiếu dữ liệu")
        return
      }

      const res =
      await fetch(
      "http://localhost:3000/create-user",
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          email,
          password,
          role,
          employee_id
        })
      })

      const result =
      await res.json()

      if(result.success){

        alert("Tạo thành công")

      }else{

        alert(result.error)

      }

    }

  },

  /* =========================
  USERS VIEW
  ========================= */

  vw_users:{

    label:"Danh sách người dùng",

    type:"view",

    fields:{

      email:{
        label:"Email",
        showInList:true
      },

      role_name:{
        label:"Vai trò",
        showInList:true
      },

      employee_name:{
        label:"Nhân sự",
        showInList:true
      }

    },

    canEdit:false,

    canDelete:true,

    formTable:"user_account",

    onDelete: async (id)=>{

      const res =
      await fetch(
      "http://localhost:3000/delete-user",
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({id})
      })

      const result =
      await res.json()

      if(!result.success){

        alert(result.error)

        throw new Error(result.error)

      }

      alert("Đã xóa user")

    }

  }

}