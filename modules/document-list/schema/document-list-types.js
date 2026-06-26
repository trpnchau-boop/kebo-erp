// modules/document-list/document-list-types.js

export const DOCUMENT_LIST_TYPES = {

  SALE:{
    table:"document",
    title:"Bán hàng",
    primaryAction:{
      key:"add",
      label:"+ Thêm",
      route:"document"
    },  
    list:[
      "code",
      "day",
      "id_employee",      
      "id_customer",
      "note",
      "tongthanhtoan",
      "tien_tt",
    ],
    actions:[
      { key:"merge", label:"Gộp đơn"},
      { key:"bulk_delete", label:"Xóa hàng loạt" }, 
      { key:"bulk_print", label:"In hàng loạt" }, 
      { key:"bulk_release", label:"Phát hành hàng loạt" },
      { key:"bulk_export_stock", label:"Xuất kho hàng loạt" },  
    ],
    rowActions:[
      { key:"remove", label:"Xóa" },
      { key:"print", label:"In" },
      { key:"payment", label:"Thanh toán" },
      { key:"release", label:"Phát hành"},
      { key:"split", label:"Tách đơn" },      
      { key:"export_stock", label:"Xuất kho" }      
    ]
  },

  IMPORT:{
    table:"document",    
    title:"Nhập kho",
    primaryAction:{
      key:"add",
      label:"+ Thêm",
      route:"document"
    },    
    list:[
      "code",
      "day",
      "id_employee",
      "id_customer",
      "note",      
      "tongthanhtoan",
      "tien_tt",
    ],
    actions:[
      { key:"bulk_post", label:"Ghi sổ hàng loạt" },
      { key:"bulk_delete", label:"Xóa hàng loạt" }, 
      { key:"bulk_print", label:"In hàng loạt" }, 
      { key:"bulk_payment", label:"Thanh toán hàng loạt" },
    ],
    rowActions:[
      { key:"remove", label:"Xóa" },
      { key:"print", label:"In" },
      { key:"payment", label:"Thanh toán" },
      { key:"post", label:"Ghi sổ" },          
    ]
  },

  INVOICE:{
    table:"document",    
    title:"Hóa đơn",
    primaryAction:{
      key:"add",
      label:"+ Thêm",
      route:"document"
    },    
    list:[
      "code",
      "day",
      "id_employee",
      "id_customer",
      "note",      
      "tongthanhtoan",
      "tien_tt",
    ],
    actions:[
      { key:"bulk_post", label:"Ghi sổ hàng loạt" },
      { key:"bulk_delete", label:"Xóa hàng loạt" }, 
      { key:"bulk_print", label:"In hàng loạt" }, 
      { key:"bulk_payment", label:"Thanh toán hàng loạt" },
    ],
    rowActions:[
      { key:"remove", label:"Xóa" },
      { key:"print", label:"In" },
      { key:"payment", label:"Thanh toán" },
      { key:"post", label:"Ghi sổ" },  
    ]
  },  

  EXPORT:{
    table:"document",    
    title:"Xuất kho",
    primaryAction:{
      key:"add",
      label:"+ Thêm",
      route:"document"
    },    
    list:[
      "code",
      "day",
      "id_employee",
      "id_customer",
      "note",      
      "tongthanhtoan",
      "tien_tt",
    ],

    actions:[
      { key:"bulk_post", label:"Ghi sổ hàng loạt" },
      { key:"bulk_delete", label:"Xóa hàng loạt" }, 
      { key:"bulk_print", label:"In hàng loạt" }, 
      { key:"bulk_payment", label:"Thanh toán hàng loạt" },
    ],
    rowActions:[
      { key:"remove", label:"Xóa" },
      { key:"print", label:"In" },
      { key:"payment", label:"Thanh toán" },
      { key:"post", label:"Ghi sổ" },        
    ]
  },
  ISSUE:{
    table:"tax_invoice",
    itemTable:"tax_invoice_items",
    title:"Phát hành",

    list:[
      "code",
      "day",
      "id_customer",
      "id_customer",
      "note",      
      "tongthanhtoan",
      "tien_tt",
    ],

    actions:[
      { key:"bulk_post", label:"Ghi sổ hàng loạt" },
      { key:"bulk_delete", label:"Xóa hàng loạt" },
      { key:"bulk_print", label:"In hàng loạt" },
    ],

    rowActions:[
      { key:"remove", label:"Xóa" },
      { key:"print", label:"In" },
      { key:"post", label:"Ghi sổ" },
    ]
  },
  TRANSFER:{
    table:"document",

    title:"Chuyển kho",

    list:[
      "code",
      "day",
      "id_employee",
    ],

    actions:[
      { key:"bulk_post", label:"Ghi sổ hàng loạt" },
      { key:"bulk_delete", label:"Xóa hàng loạt" },
    ],

    rowActions:[
      { key:"print", label:"In" },
      { key:"post", label:"Ghi sổ" },
      { key:"remove", label:"Xóa" },      
    ]
  },
  ADJUST:{
    table:"document",

    title:"Kiểm kho",

    list:[
      "code",
      "day",
      "id_employee",
    ],

    actions:[
      { key:"bulk_post", label:"Ghi sổ hàng loạt" },
      { key:"bulk_delete", label:"Xóa hàng loạt" },      
    ],

    rowActions:[
      { key:"print", label:"In" },
      { key:"post", label:"Ghi sổ" },
      { key:"remove", label:"Xóa" },      
    ]
  },

}