export const BASE_DOCUMENT = {
  meta:{
    code:"DOCUMENT",
    prefix:"DOC",
    title:"CHỨNG TỪ",
    table:"document",
    detailTable:"document_items" },

  docType:{
    default:"SALE",
    bind:"#doc-type",
    editable:true,
    options:[
      "SALE",
      "IMPORT",
      "EXPORT",
      "TRANSFER",
      "ADJUST"
    ]},

  actions:[
    { key:"preview", label:"⏳",  event:"showSalePreview", },
    { key:"save", label:"💾 Lưu", class:"primary", event:"saveDocument",},
    { key:"print", label:"In", event:"printDocument", },
    { key:"delete", label:"Xóa", class:"danger", event:"deleteDocument",},
    { key:"post", label:"Ghi sổ", class:"success", event:"postDocument", },
    { key:"split", label:"Tách đơn", event:"splitDocument",}
  ],
  form:{
    layout:"4col",
    fields:[      
      {
        key:"invoice_actions",
        label:"",
        type:"group",
        inlineActions:true,
        class:"inline-checkbox-group",
        
        fields:[          
          {
            key:"auto_export",
            label:"Lập phiếu xuất kho",
            type:"checkbox",
            default:false,
            persist:false,
            show:{
              form:true
            }
          },
          {
            key:"publish_invoice",
            label:"Phát hành hóa đơn",
            type:"checkbox",
            default:false,
            persist:false,
            show:{
            form:true
            }
          }
        ]
      },
      {
        key:"code",
        label:"Số CT",
        type:"text",
        readonly:true,        
        show:{
          form:true
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      },
      {
        key:"id_employee",
        label:"Nhân viên",
        display:[
          "name"
        ],
        type:"lookup",
        source:{
          table:"data_employee",
          value:"id",
          search:[ "code", "name", "phone"],
          display:[ "name"]
        },
        action:{
          icon:"+",
          event:"createEmployee",
          permission:"employee.create"
        },
        show:{
          form:true
        },
        print:{
          show:true,
        }        
      },  
      {
        key:"day",
        label:"Ngày",
        type:"date",
        required:true,
        show:{
          form:true
        },
        print:{
          show:true,
          section:"header",
          col:2
        }
      },                                                    
      {
        key:"note",
        label:"Ghi chú",
        type:"text",
        show:{
          form:true
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      },  
      {
        key:"id_customer",
        label:"Khách hàng",
        type:"lookup",
        source:{
          table:"data_customer",
          value:"id",
          search:[
            "code",
            "name",
            "phone"
          ],
          display:[
           "code",
           "name"
          ]
        },
        mapping:{
          customer_name:"name",
          phone:"phone",
          mst:"mst",
          address:"add",
          customer_type:"customer_type"
        },
        action:{
          icon:"+",
          event:"createCustomer",
          permission:"customer.create"
        },
        show:{
          form:true
        },    
        print:{
          show:true,
        }            
      },          
      {
        key:"mst",
        label:"MST",
        type:"text",
        snapshot:true,
        persist:false,
        show:{
          form:true
        },
        print:{
          show:true,
        }
      },  
      {
        key:"customer_type",
        label:"Loại khách",
        type:"select",
        persist:false,
        source:{
          table:"set_kh_money",
          value:"khachhang",
          label:"khachhang"
        },
        show:{
          form:true
        },
        print:{
          show:true,
        }        
      },  
      {
        key:"customer_name",
        label:"Tên KH",
        type:"text",
        snapshot:true,
        persist:false,
        show:{
          form:true
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      },                     
      {
        key:"phone",
        label:"SĐT",
        type:"text",
        snapshot:true,
        persist:false,
        show:{
          form:true
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      },
      {
        key:"address",
        label:"Địa chỉ",
        type:"text",
        snapshot:true,
        persist:false,
        show:{
          form:true
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      }, 
      {
        key:"ref",
        label:"Ref",
        type:"ref",
        width:520,
        span:2,
        refTable:"sale_order",
        textField:"order_code",
        show:{
          form:true
        },
        print:{
          show:true,
        }        
      },      
     {
        key:"tongtienvon",
        type:"money",
        computed:true,
        formula:"sum(tienvon)",
        show:{
          form:false,
          totals:false,
          table:false
        },
        print:{
          show:false,
        }        
      },
    {
      key:"payment_summary",
      label:"Thanh toán",
      type:"group",
      class:"payment-summary",

     fields:[
      {
        key:"tongthanhtoan",
        label:"",
        type:"money",
        readonly:true,
        computed:true,
        formula:"tongtien - chietkhau + thue",
        show:{
          form:true,
          totals:false
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      },       
      {
        key:"thue",
        label:"Thuế",
        placeholder:"Thuế",
        type:"money",
        default:0,    
        show:{
          form:true,
          totals:false
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      },     
      {
        key:"chietkhau",
        label:"Chiết khấu",
        placeholder:"Chiết khấu",
        type:"money",
        default:0,
        show:{
          form:true,
          totals:false
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      }, 
      {
        key:"tongtien",
        label:"Tiền hàng",        
        placeholder:"Tiền hàng",
        type:"money",
        readonly:true,
        computed:true,
        formula:"sum(thanhtien)",
        show:{
          form:true,
          totals:false
        },
        print:{
          show:true,
          section:"header",
          col:2
        }        
      },           
      ]
      },      
    ]
  },

  table:{
    editable:true,
    removable:true,
    selectable:true,
    summary:false,
    system:{
      checkbox:true,
      stt:true,
      delete:true
    },

    input:{
      enabled:true,
      sticky:true,
      autoPush:true,
      clearAfterPush:true,
      autoFocus:"product_code"
    },

    columns:[
      {
        key:"product_code",
        label:"Mã SP",
        type:"text",
        width:100,
        placeholder:"Mã SP",
        runtime:true,
        persist:false,
        scan:true,
        show:{
          input:true,
          table:false
        },
        print:{
          show:true,
        }        
      },
      {
        key:"id_product",
        label:"Sản phẩm",
        type:"lookup",
        source:{
          table:"data_product",
          value:"id",
          search:[
            "code",
            "name",
            "tinhchat"
          ],
          display:[
            "name",
            "tinhchat"
          ],
        },
        mapping:{
          product_code:"code",
          name:"name",
          line:"dinhluong",
          dvtGoc:"dvtGoc",
          id_warehouse:"id_warehouse",
          parent_id:"parent_id",
          tinhchat: "tinhchat",
          tonsoluong:"tonkho",
          dongiavon:"giavon",
        },
        action:{
          icon:"+",
          event:"createProduct",
          permission:"product.create"
        },
        width:180,
        maxWidth:250,
        placeholder:"Tên sản phẩm",
        required:true,
        editable:true,
        autoPrice:true,
        onSelect:"fillProductRow",
        show:{
          input:true,
          table:true
        },
        print:{
          show:false,
          table:true,
          width:240,
        } 
      },

      {
        key:"name",
        type:"text",
        snapshot:true,
        show:{
          input:false,
          table:false
        },
        print:{
          show:true
        }
      },

      {
        key:"tinhchat",
        type:"text",
        persist:true,
        show:{          
          input:false,
          table:false
        },
        print:{
          show:true,
        }        
      },
      
      {
        key:"parent_id",
        type:"number",
        show:{
          input:false,
          table:false
        }
      },

      {
        key:"line",
        label:"Định lượng",
        type:"number",
        width:90,
        placeholder:"Định lượng",
        runtime:true,
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
        }        
      },

      {
        key:"note",
        label:"Ghi chú",
        type:"text",
        width:90,
        placeholder:"Ghi chú",
        editable:true,
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
          width:100
        }        
      },

      {
        key:"id_warehouse",
        label:"Kho",
        type:"select",
        source:{
          table:"set_kho",       
          value:"id",
          label:"name"
        },  
        width:120,
        placeholder:"Kho",
        editable:true,
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
          width:100
        }     
      },

      {
        key:"qty",
        label:"SL",
        type:"number",
        width:60,
        placeholder:"SL",
        default:1,
        editable:true,
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
          width:100
        },     
      },

      {
        key:"id_unit",
        label:"Đvt",
        type:"select",
        source:{
          table:"product_unit",
          value:"id",
          label:"unit"
        },

        nullable:true,
        width:100,
        placeholder:"ĐVT",
        editable:true,
        show:{
          input:true,
          table:true
        },
        mapping:{
          unit_name:"unit"
        }       
      },

      {
        key:"unit_name",
        label:"Tên ĐVT",
        type:"text",
        runtime:true,
        persist:false,
        show:{
          input:false,
          table:false
        }, 
        print:{
          show:true,
          width:100
        }               
      },

      {
        key:"dvtGoc",
        label:"Đvt gốc",       
        type:"text", 
        width:80,
        readonly:true,       
        show:{
          input:false,
          table:true
        },
        print:{
          show:true,
          width:100
        }        
      },

      {
        key:"tongsoluong",
        label:"Tổng SL",
        type:"number",
        width:80,
        placeholder:"Tổng SL",
        readonly:true,
        computed:true,
        formula:"(ratio && ratio > 0) ? qty * ratio : qty",
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
          width:100
        }        
      },

      {
        key:"ratio",
        type:"number",
        runtime:true,
        persist:false,
        show:{
          input:false,
          table:false
        }
      },

      {
        key:"dongia",
        label:"Đơn giá",
        type:"money",
        valueMode:"number",
        width:100,
        placeholder:"Đơn giá",
        default:0,
        editable:true,
        priceSources:[
        {
          type:"history",
        },
        {
          type:"policy",
        },
        {
          type:"fallback",
        }
      ],
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
          width:100
        }        
      },

      {
        key:"thanhtien",
        label:"Thành tiền",
        type:"money",
        width:100,
        placeholder:"Thành tiền",
        readonly:false,
        computed:true,
        formula:"tongsoluong * dongia",
        reverse:{
          target:"dongia",
          formula:
          "(tongsoluong > 0)"
          +
          " ? thanhtien / tongsoluong"
          +
          " : 0"
        },
        summary:true,      
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
          width:100
        }        
      },

      {

        key:"cost_alloc",
        label:"Phí PB",
        type:"money",
        width:100,
        placeholder:"Phí PB",
        default:0,
        hideInDocTypes:["SALE","INVOICE","EXPORT","ISSUE"],
        show:{
          input:true,
          table:true
        }
      },

      {
        key:"dongiavon",
        label:"Giá vốn",
        type:"money",
        width:100,
        placeholder:"Giá vốn",
        hideInDocTypes:["SALE","IMPORT","INVOICE","ISSUE"],
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
          width:100
        }        
      },

      {
        key:"tienvon",
        label:"Tiền vốn",
        type:"money",
        computed:true,
        formula:"tongsoluong * dongiavon",
        width:100,
        placeholder:"Tiền vốn",
        hideInDocTypes:["SALE","IMPORT","INVOICE","ISSUE"],
        show:{
          input:true,
          table:true
        },
        print:{
          show:true,
          width:100
        }        
      }
    ]
  }
}