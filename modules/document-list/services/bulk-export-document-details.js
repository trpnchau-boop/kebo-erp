import {db} from "/js/supabase.js"


export async function bulkExportDocumentDetails(ctx = {}){

  const ids =
    ctx.ids || []

  if(!ids.length){

    alert("Chưa chọn chứng từ")

    return

  }


  if(typeof XLSX === "undefined"){

    alert("Thiếu thư viện XLSX")

    return

  }


  /* =========================================
     HEADER EXCEL
  ========================================= */

  const columns = [

    "Hình thức bán hàng",
    "Phương thức thanh toán",
    "Kiêm phiếu xuất kho",
    "Lập kèm hóa đơn",
    "Hóa đơn từ máy tính tiền",
    "Đã lập hóa đơn",
    "Ngày hạch toán (*)",
    "Ngày chứng từ (*)",
    "Số chứng từ (*)",
    "Mã khách hàng",
    "Tên hàng",
    "TK Tiền/Chi phí/Nợ (*)",
    "TK Doanh thu/Có (*)",
    "ĐVT",
    "Số lượng",
    "Đơn giá",
    "Thành tiền",
    "Nhóm ngành nghề",
    "Nguồn gốc doanh thu",
    "Tỷ lệ CK (%)"

  ]


  const data = [columns]


  /* =========================================
     LOAD TỪNG CHỨNG TỪ
  ========================================= */

  for(const id of ids){

    /* -----------------------------------------
       HEADER
    ----------------------------------------- */

    const {
      data:header,
      error:headerError
    } = await db

      .from("document")

      .select("*")

      .eq("id",id)

      .single()


    if(headerError){

      console.error(
        "LOAD HEADER ERROR",
        headerError
      )

      continue

    }


    /* -----------------------------------------
       KHÁCH HÀNG
    ----------------------------------------- */

    let customer = null


    if(header.id_customer){

      const {
        data,
        error
      } = await db

        .from("data_customer")

        .select(`
          id,
          code,
          name,
          donvi
        `)

        .eq(
          "id",
          header.id_customer
        )

        .single()


      if(error){

        console.error(
          "LOAD CUSTOMER ERROR",
          error
        )

      }else{

        customer = data

      }

    }


    /* -----------------------------------------
       CHI TIẾT
    ----------------------------------------- */

    const {
      data:items,
      error:itemError
    } = await db

      .from("document_items")

      .select("*")

      .eq(
        "id_doc",
        id
      )


    if(itemError){

      console.error(
        "LOAD ITEMS ERROR",
        itemError
      )

      continue

    }

    /* -----------------------------------------
       LOAD TÊN SẢN PHẨM GỐC
    ----------------------------------------- */

    const productIds = [
      ...new Set(
        (items || [])
          .map(item => item.id_product)
          .filter(Boolean)
      )
    ]

    let productMap = {}

    if(productIds.length){

        const {
            data:products,
            error:productError
        } = await db

        .from("data_product")
        .select(`
            id,
            name
        `)
        .in(
            "id",
            productIds
        )

        if(productError){
            
            console.error(
                "LOAD PRODUCTS ERROR",
                productError
            )

        }else{

            ;(products || []).forEach(product => {

                productMap[product.id] =
                product.name || ""

            })

        }

    }

    /* -----------------------------------------
       MỖI SẢN PHẨM = 1 DÒNG EXCEL
    ----------------------------------------- */

    for(const item of (items || [])){

      const qty =
        Number(
          item.tongsoluong || 0
        )


      const price =
        Number(
          item.dongia || 0
        )


      const amount =
        item.thanhtien !== null &&
        item.thanhtien !== undefined

          ? Number(item.thanhtien)

          : qty * price


      data.push([

        /* 1 */
        "Bán hàng hóa trong nước",

        /* 2 */
        "Chưa thu tiền",

        /* 3 */
        "Không",

        /* 4 */
        "Không",

        /* 5 */
        "Không",

        /* 6 */
        "Chưa lập",

        /* 7 */
        header.day || "",

        /* 8 */
        header.day || "",

        /* 9 */
        header.code || "",

        /* 10 */
        customer?.code || "",

        /* 11 */
        productMap[item.id_product] || "",

        /* 12 */
        "131",

        /* 13 */
        "5111",

        /* 14 */
        item.dvtGoc || "",

        /* 15 */
        qty,

        /* 16 */
        price,

        /* 17 */
        amount,

        /* 18 */
        "101",

        /* 19 */
        "Bán hàng thông thường",

        /* 20 */
        0

      ])

    }

  }


  /* =========================================
     KHÔNG CÓ DỮ LIỆU
  ========================================= */

  if(data.length <= 1){

    alert(
      "Không có chi tiết chứng từ để xuất"
    )

    return

  }


  /* =========================================
     TẠO SHEET
  ========================================= */

  const ws =
    XLSX.utils.aoa_to_sheet(
      data
    )


  /* =========================================
     ĐỘ RỘNG CỘT
  ========================================= */

  ws["!cols"] = [

    {wch:28},
    {wch:24},
    {wch:20},
    {wch:18},
    {wch:24},
    {wch:18},
    {wch:18},
    {wch:18},
    {wch:20},
    {wch:18},
    {wch:35},
    {wch:24},
    {wch:24},
    {wch:12},
    {wch:14},
    {wch:16},
    {wch:18},
    {wch:18},
    {wch:28},
    {wch:14}

  ]


  /* =========================================
     ĐỊNH DẠNG HEADER
  ========================================= */

  for(let c = 0; c < columns.length; c++){

    const cell =
      XLSX.utils.encode_cell({
        r:0,
        c
      })


    if(ws[cell]){

      ws[cell].s = {

        font:{
          bold:true
        },

        alignment:{
          vertical:"center",
          wrapText:true
        }

      }

    }

  }


  /* =========================================
     TẠO FILE
  ========================================= */

  const wb =
    XLSX.utils.book_new()


  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Chi tiết chứng từ"
  )


  const today =
    new Date()
      .toISOString()
      .slice(0,10)


  XLSX.writeFile(
    wb,
    `Chi-tiet-chung-tu-${today}.xlsx`
  )


  alert(
    `Đã xuất ${data.length - 1} dòng chi tiết`
  )

}