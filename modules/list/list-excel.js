import { schema } from "/js/schema/index.js"
import { db } from "/js/supabase.js"


/* ======================
CỘT DÙNG CHUNG
====================== */

function getColumns(table){

  const fields =
    schema[table]?.fields || {}

  return Object.entries(fields)
    .filter(([key, f]) => {

      if(key === "id") return false
      if(f.hidden) return false

      return f.showInList || !f.hidden

    })
    .map(([key, f]) => ({

      key,
      label: f.label || key,
      field: f

    }))

}


/* ======================
LẤY SẢN PHẨM CHA
TRONG TRƯỜNG HỢP CHA
KHÔNG CÓ TRONG rows
====================== */

async function getMissingParents(rows){

  const parentIds =
    rows
      .filter(r =>
        r.type === "variant" &&
        r.parent_id !== null &&
        r.parent_id !== undefined
      )
      .map(r => r.parent_id)


  const uniqueIds =
    [...new Set(
      parentIds.map(id => String(id))
    )]


  if(!uniqueIds.length){
    return []
  }


  /*
    Những cha đã có sẵn trong rows
    thì không cần query lại
  */

  const existingIds =
    new Set(
      rows.map(r => String(r.id))
    )


  const missingIds =
    uniqueIds.filter(
      id => !existingIds.has(id)
    )


  if(!missingIds.length){
    return []
  }


  const { data, error } =
    await db
      .from("data_product")
      .select(`
        id,
        code,
        name,
        tinhchat,
        dvtGoc,
        dongia1,
        dongia2,
        dongia3,
        giavon,
        gianhapGoc,
        type,
        parent_id
      `)
      .in("id", missingIds)


  if(error){

    console.error(
      "Lỗi lấy sản phẩm cha:",
      error
    )

    return []

  }


  return data || []

}

/* ======================
LẤY PRODUCT_UNIT
CỦA SẢN PHẨM THƯỜNG
====================== */

async function getNormalProductUnits(rows){

  const normalIds =
    rows
      .filter(r =>
        r.type !== "variant" &&
        r.id !== null &&
        r.id !== undefined
      )
      .map(r => r.id)


  const uniqueIds =
    [...new Set(
      normalIds.map(id => String(id))
    )]


  if(!uniqueIds.length){
    return []
  }


  const { data, error } =
    await db
      .from("product_unit")
      .select(`
        id,
        id_sp,
        unit,
        ratio,
        is_act
      `)
      .in("id_sp", uniqueIds)
      .eq("is_act", true)
      .order("id", {
        ascending: true
      })


  if(error){

    console.error(
      "Lỗi lấy product_unit sản phẩm thường:",
      error
    )

    return []

  }


  return data || []

}

/* ======================
GROUP PRODUCT_UNIT
THEO SẢN PHẨM CON

MỖI CON CHỈ LẤY
1 PRODUCT_UNIT ĐẦU TIÊN

KHÔNG TẠO NHIỀU DÒNG
====================== */

function groupVariantUnits(productUnits){

  const map =
    new Map()


  productUnits.forEach(unit => {

    const key =
      String(unit.id_sp)


    /*
      Chỉ lấy unit đầu tiên
      của mỗi variant.

      Các product_unit khác
      của variant sẽ bỏ qua.
    */

    if(!map.has(key)){

      map.set(
        key,
        unit
      )

    }

  })


  return map

}


/* ======================
TẠO 1 DÒNG EXCEL
====================== */

function createProductExportRow({

  parent,
  child,
  unit,
  stt

}){

  /*
    THÔNG TIN CHÍNH:
    LẤY TỪ CHA
  */

  const dvtGoc =
    parent?.dvtGoc ?? ""


  /*
    ĐƠN VỊ CHUYỂN ĐỔI:
    LẤY TỪ CON

    Ưu tiên dvtGoc của con.

    Nếu con không có thì dùng
    unit.unit làm dự phòng.
  */

  const donViChuyenDoi =
    child
      ? (child.dvtGoc ?? "")
      : (unit?.unit ?? "")


  /*
    TỶ LỆ:
    LẤY product_unit CỦA CON
  */

  const ratio =
    child
      ? (child.dinhluong ?? "")
      : (unit?.ratio ?? "")


  /* ======================
  MÔ TẢ
  ====================== */

  let moTa = ""


  if(
    donViChuyenDoi !== "" &&
    ratio !== "" &&
    dvtGoc !== ""
  ){

    moTa =
      `1 ${donViChuyenDoi} = ${ratio} ${dvtGoc}`

  }


  /* ======================
  GIÁ BÁN ĐVCĐ

  LẤY GIÁ CỦA CON
  ====================== */

  const donGiaBanDVCĐ1 =
    child?.dongia1 ?? ""


  return {

    "STT":
      stt,


    /* ======================
    THÔNG TIN CHA
    ====================== */

    "Mã hàng (*)":
      parent?.code ?? "",

    "Tên hàng (*)":
      parent?.name ?? "",

    "Tính chất":
      "Hàng hóa",

    "Đơn vị tính chính":
      dvtGoc,

    "Mã nhóm VTHH":
      "HH",

    "Diễn giải khi mua":
      parent?.name ?? "",

    "Diễn giải khi bán":
      parent?.name ?? "",


    /* ======================
    TÀI KHOẢN
    ====================== */

    "TK kho":
      "156",

    "TK doanh thu":
      "5111",

    "TK chiết khấu":
      "5111",

    "TK giảm giá":
      "5111",

    "TK Trả lại":
      "5111",

    "TK chi phí":
      "632",


    /* ======================
    GIÁ CỦA CHA
    ====================== */

    "Đơn giá mua gần nhất":
      parent?.giavon ?? "",

    "Đơn giá bán":
      parent?.dongia1 ?? "",

    "Đơn giá bán 2":
      parent?.dongia2 ?? "",

    "Đơn giá bán 3":
      parent?.dongia3 ?? "",

    "Đơn giá bán cố định":
      parent?.dongia1 ?? "",


    /* ======================
    NHÓM NGÀNH NGHỀ
    ====================== */

    "Nhóm ngành nghề":
      "101",


    /* ======================
    QUY ĐỔI CỦA CON
    ====================== */

    "Đơn vị chuyển đổi":
      donViChuyenDoi,

    "Tỷ lệ chuyển đổi":
      ratio,

    "Phép tính":
      child || unit
        ? "Phép nhân"
        : "",

    "Mô tả":
      moTa,


    /* ======================
    GIÁ BÁN CỦA CON
    ====================== */

    "Đơn giá bán ĐVCĐ 1":
      donGiaBanDVCĐ1

  }

}

/* ======================
XUẤT EXCEL SẢN PHẨM
====================== */

async function exportProductExcel(rows){

  /* ======================
  KIỂM TRA DỮ LIỆU
  ====================== */

  if(!rows.length){

    alert("Không có dữ liệu để xuất Excel")

    return

  }


  /* ======================
  1. LẤY CHA CÒN THIẾU
  ====================== */

  const missingParents =
    await getMissingParents(rows)


  /* ======================
  2. GỘP TẤT CẢ SẢN PHẨM
  ====================== */

  const allProducts = [
    ...rows,
    ...missingParents
  ]


  /* ======================
  3. MAP SẢN PHẨM THEO ID
  ====================== */

  const productsById =
    new Map()


  allProducts.forEach(product => {

    productsById.set(
      String(product.id),
      product
    )

  })


  /* ======================
  4. XÁC ĐỊNH CHA CÓ VARIANT
  ====================== */

  /*
    Ví dụ:

    Tai heo Kg
      ├─ Gói nhỏ
      ├─ Gói
      ├─ Gói lớn
      └─ Gói đại

    → parentIds chứa id của
      Tai heo Kg

    → dòng Tai heo Kg sẽ không xuất.
  */

  const parentIds =
    new Set()


  rows.forEach(product => {

    if(
      product.parent_id !== null &&
      product.parent_id !== undefined &&
      product.parent_id !== ""
    ){

      parentIds.add(
        String(product.parent_id)
      )

    }

  })


  /* ======================
  5. LẤY PRODUCT_UNIT
  CỦA SẢN PHẨM THƯỜNG
  ====================== */

  const normalProductUnits =
    await getNormalProductUnits(rows)


  /* ======================
  6. GROUP UNIT THEO
  SẢN PHẨM THƯỜNG
  ====================== */

  const unitsByNormalProduct =
    new Map()


  normalProductUnits.forEach(unit => {

    const key =
      String(unit.id_sp)


    if(!unitsByNormalProduct.has(key)){

      unitsByNormalProduct.set(
        key,
        []
      )

    }


    unitsByNormalProduct
      .get(key)
      .push(unit)

  })


  /* ======================
  7. TẠO DỮ LIỆU EXCEL
  ====================== */

  const data = []

  let stt = 1


  rows.forEach(product => {

    if(
      parentIds.has(
        String(product.id)
      )
    ){

      return

    }


    /* ==================================================
       TRƯỜNG HỢP 1:
       SẢN PHẨM CON / VARIANT
       ================================================== */

    if(product.type === "variant"){

      const parent =
        productsById.get(
          String(product.parent_id)
        )


      /*
        Nếu không tìm được cha
        → dùng chính product
      */

      const parentProduct =
        parent || product


      const isBaseUnitVariant =
        parent &&
        String(product.dvtGoc ?? "").trim() ===
          String(parent.dvtGoc ?? "").trim() &&
        Number(product.dinhluong) === 1


      if(isBaseUnitVariant){
 
        return

      }

      /*
        Variant KHÔNG lấy product_unit.

        Đơn vị chuyển đổi:
          → child.dvtGoc

        Tỷ lệ chuyển đổi:
          → child.dinhluong
      */

      data.push(

        createProductExportRow({

          parent:
            parentProduct,

          child:
            product,

          unit:
            null,

          stt:
            stt++

        })

      )


      return

    }


    /* ==================================================
       TRƯỜNG HỢP 2:
       SẢN PHẨM THƯỜNG CÓ PRODUCT_UNIT
       ================================================== */

    const units =
      unitsByNormalProduct.get(
        String(product.id)
      ) || []


    /*
      Mỗi product_unit
      → 1 dòng Excel
    */

    if(units.length){

      units.forEach(unit => {

        data.push(

          createProductExportRow({

            parent:
              product,

            child:
              null,

            unit:
              unit,

            stt:
              stt++

          })

        )

      })


      return

    }


    /* ==================================================
       TRƯỜNG HỢP 4:
       SẢN PHẨM THƯỜNG KHÔNG CÓ PRODUCT_UNIT
       ================================================== */

    data.push(

      createProductExportRow({

        parent:
          product,

        child:
          null,

        unit:
          null,

        stt:
          stt++

      })

    )

  })


  /* ======================
  8. TẠO WORKSHEET
  ====================== */

  const ws =
    XLSX.utils.json_to_sheet(
      data
    )


  /* ======================
  9. TẠO WORKBOOK
  ====================== */

  const wb =
    XLSX.utils.book_new()


  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Danh sách sản phẩm"
  )


  /* ======================
  10. XUẤT FILE
  ====================== */

  XLSX.writeFile(
    wb,
    "DanhSachSanPham.xlsx"
  )

}


/* ======================
XUẤT EXCEL CHUNG
====================== */

export async function exportExcel(
  table,
  rows = []
){

  /* ======================
  SẢN PHẨM
  ====================== */

  if(table === "data_product"){

    await exportProductExcel(
      rows
    )

    return

  }


  /* ======================
  CÁC BẢNG KHÁC
  ====================== */

  const cols =
    getColumns(table)


  const data =
    rows.map((r, i) => {

      const obj = {}


      obj["STT"] =
        i + 1


      cols.forEach(c => {

        obj[c.label] =
          r[c.key] ?? ""

      })


      return obj

    })


  const ws =
    XLSX.utils.json_to_sheet(
      data
    )


  const wb =
    XLSX.utils.book_new()


  XLSX.utils.book_append_sheet(
    wb,
    ws,
    table
  )


  XLSX.writeFile(
    wb,
    table + ".xlsx"
  )

}