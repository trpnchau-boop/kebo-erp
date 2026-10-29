
/* =========================================================
DOCUMENT COMPUTE
========================================================= */

export function computeTableRow(
  schema,
  row,
  changedKey = "",
  options = {}
){

  /* =====================================================
  XML PREVIEW / XML_IN
  ===================================================== */

  if(
    options.xmlPreview ||
    options.xmlIn
  ){

    /* =====================================
    QUANTITY / RATIO
    ===================================== */

    const qty =
      Number(row.qty) || 0;

    const ratio =
      Number(row.ratio) || 1;

    /* =====================================
    TỔNG SỐ LƯỢNG

    Tổng SL = SL * Ratio
    ===================================== */

    row.tongsoluong =
      qty * ratio;

    /* =====================================
    THÀNH TIỀN XML GỐC

    Chỉ lấy giá trị gốc khi chưa khởi tạo.
    Không ghi đè khi SL hoặc ĐVT thay đổi.
    ===================================== */

    if(
      row._xmlThanhtien === undefined ||
      row._xmlThanhtien === null
    ){

      row._xmlThanhtien =
        Number(row.thanhtien) || 0;

    }

    const thanhtien =
      Number(row._xmlThanhtien) || 0;

    /* =====================================
    GIỮ NGUYÊN THÀNH TIỀN
    ===================================== */

    row.thanhtien =
      thanhtien;

    /* =====================================
    ĐƠN GIÁ
    ===================================== */

    if(options.xmlPreview){

      /*
      XML_PREVIEW:
      Luôn tính đơn giá theo Thành tiền XML.
      */

      row.dongia =
        row.tongsoluong > 0
          ? thanhtien / row.tongsoluong
          : 0;

    }

    if(options.xmlIn){

      /*
      XML_IN:

      Khi mở chứng từ:
      Giữ đơn giá đã lưu DB.

      Khi đổi SL hoặc ĐVT:
      Tính lại đơn giá theo Tổng SL mới.

      Thành tiền không thay đổi.
      */

      const priceChanged =
        changedKey === "qty" ||
        changedKey === "id_unit";

      if(priceChanged){

        row.dongia =
          row.tongsoluong > 0
            ? thanhtien / row.tongsoluong
            : 0;

      }
      else{

        row.dongia =
          Number(row.dongia) || 0;

      }

    }

    /* =====================================
    XML PREVIEW

    TÍNH GIÁ VỐN TỪ VAT DÒNG
    ===================================== */

    if(options.xmlPreview){

      const vatAmount =
        row.vatAmount === null ||
        row.vatAmount === undefined ||
        row.vatAmount === ""
          ? null
          : Number(row.vatAmount);

      if(
        vatAmount !== null &&
        Number.isFinite(vatAmount) &&
        row.tongsoluong > 0
      ){

        /* Phí phân bổ */

        row.cost_alloc =
          vatAmount / row.tongsoluong;

        /* Giá vốn */

        row.dongiavon =
          row.dongia + row.cost_alloc;

        /* Tiền vốn */

        row.tienvon =
          row.tongsoluong * row.dongiavon;

      }
      else{

        row.cost_alloc = null;

        row.dongiavon = null;

        row.tienvon = null;

      }

    }

    /* =====================================
    XML_IN

    GIỮ NGUYÊN GIÁ VỐN ĐÃ LƯU DB
    ===================================== */

/* =====================================
XML_IN

TÍNH LẠI PHÍ PB, GIÁ VỐN, TIỀN VỐN
TỪ VAT GỐC ĐÃ LƯU DB
===================================== */

if(options.xmlIn){

  const vatAmount =
    row.vatAmount === null ||
    row.vatAmount === undefined ||
    row.vatAmount === ""
      ? null
      : Number(row.vatAmount);

  if(
    vatAmount !== null &&
    Number.isFinite(vatAmount) &&
    row.tongsoluong > 0
  ){

    /* Phí PB */

    row.cost_alloc =
      vatAmount / row.tongsoluong;

    /* Giá vốn */

    row.dongiavon =
      row.dongia + row.cost_alloc;

    /* Tiền vốn */

    row.tienvon =
      row.tongsoluong * row.dongiavon;

  }
  else{

    row.cost_alloc = 0;

    row.dongiavon =
      Number(row.dongia) || 0;

    row.tienvon =
      row.tongsoluong * row.dongiavon;

  }

}

    /* =====================================
    KẾT THÚC XML COMPUTE
    ===================================== */

    return;

  }

  /* =====================================================
  NORMAL DOCUMENT COMPUTE
  ===================================================== */

  const columns =
    schema.table?.columns || [];

  columns.forEach(field => {

    /* =====================================
    SKIP NON-COMPUTED FIELDS
    ===================================== */

    if(
      !field.computed ||
      !field.formula
    ){

      return;

    }

    /* =====================================
    REVERSE COMPUTE
    ===================================== */

    if(
      changedKey === field.key &&
      field.reverse
    ){

      const targetKey =
        field.reverse.target;

      /* Compute target */

      row[targetKey] =
        evaluateFormula(
          field.reverse.formula,
          row
        );

      /* Recompute current field */

      row[field.key] =
        evaluateFormula(
          field.formula,
          row
        );

      return;

    }

    /* =====================================
    NORMAL COMPUTE
    ===================================== */

    row[field.key] =
      evaluateFormula(
        field.formula,
        row
      );

  });

}

/* =========================================================
EVALUATE FORMULA
========================================================= */

function evaluateFormula(
  formula,
  row
){

  try{

    /* =====================================
    SAFE ROW
    ===================================== */

    const safeRow =
      new Proxy(row, {

        has(){

          return true;

        },

        get(target, key){

          return target[key] ?? 0;

        }

      });

    /* =====================================
    EXECUTE FORMULA
    ===================================== */

    const result =
      Function(
        "row",
        `
        with(row){

          return ${formula};

        }
        `
      )(safeRow);

    /* =====================================
    INVALID RESULT
    ===================================== */

    if(
      result === Infinity ||
      result === -Infinity ||
      Number.isNaN(result)
    ){

      return 0;

    }

    return result;

  }
  catch(err){

    console.warn(
      "FORMULA ERROR:",
      formula,
      err
    );

    return 0;

  }

}
