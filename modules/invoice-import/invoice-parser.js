
const norm = s =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();


const first = (obj, keys) => {

  for (const k of keys) {

    if (
      obj[k] !== undefined &&
      obj[k] !== null &&
      String(obj[k]).trim() !== ''
    ) {
      return obj[k];
    }

  }

  return null;

};


const num = v => {

  if (typeof v === 'number') {
    return v;
  }

  let s = String(v ?? '')
    .trim()
    .replace(/\s/g, '');

  if (!s) {
    return 0;
  }

  if (
    s.includes(',') &&
    s.includes('.')
  ) {

    s =
      s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.')
        : s.replace(/,/g, '');

  }

  else if (s.includes(',')) {

    s = s.replace(',', '.');

  }

  const n = Number(
    s.replace(/[^0-9.-]/g, '')
  );

  return Number.isFinite(n)
    ? n
    : 0;

};


const dateISO = v => {

  if (!v) {
    return new Date().toISOString().slice(0, 10);
  }

  const s = String(v).trim();

  let m = s.match(
    /^(\d{1,2})[/.\\-](\d{1,2})[/.\\-](\d{4})$/
  );

  if (m) {

    return (
      `${m[3]}-` +
      `${m[2].padStart(2, '0')}-` +
      `${m[1].padStart(2, '0')}`
    );

  }

  m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (m) {
    return m[0].slice(0, 10);
  }

  const d = new Date(s);

  return Number.isNaN(+d)
    ? new Date().toISOString().slice(0, 10)
    : d.toISOString().slice(0, 10);

};


/* =========================================================
XML HELPERS
========================================================= */

function xmlToObj(xml) {

  const doc =
    new DOMParser().parseFromString(
      xml,
      'text/xml'
    );


  if (
    doc.querySelector('parsererror')
  ) {

    throw new Error(
      'XML không hợp lệ.'
    );

  }


  const all = (...names) => {

    for (const n of names) {

      const el =
        doc.getElementsByTagName(n)[0];

      if (
        el?.textContent?.trim()
      ) {

        return el.textContent.trim();

      }

    }

    return null;

  };


  const nodes = [
    ...doc.getElementsByTagName('*')
  ];


  const rowNodes = nodes.filter(el =>
    /^(HHDVu|Item|HangHoa|ChiTiet|InvoiceDetail|Product)$/i
      .test(el.localName)
  );


  /*
  ---------------------------------------------------------
  LẤY GIÁ TRỊ TRONG TTKhac

  Ví dụ:
  <TTin>
    <TTruong>VATAmount</TTruong>
    <DLieu>143703</DLieu>
  </TTin>
  ---------------------------------------------------------
  */

  const getExtraValue = (
    el,
    fieldName
  ) => {

    const extras = [
      ...el.getElementsByTagName('TTin')
    ];


    const item = extras.find(tin => {

      const field =
        tin.getElementsByTagName('TTruong')[0];

      return (
        field?.textContent?.trim() ===
        fieldName
      );

    });


    return (
      item
        ?.getElementsByTagName('DLieu')[0]
        ?.textContent
        ?.trim()
      ?? null
    );

  };


  /*
  ---------------------------------------------------------
  PARSE ITEM
  ---------------------------------------------------------
  */

  const items = rowNodes
    .map(el => {

      const get = (...keys) => {

        for (const k of keys) {

          const x =
            el.getElementsByTagName(k)[0] ||
            el.getAttributeNode(k);

          if (
            x?.textContent?.trim() ||
            x?.value
          ) {

            return (
              x.textContent?.trim() ||
              x.value
            );

          }

        }

        return null;

      };


      const name =
        first(
          {
            v: get(
              'THHDVu',
              'Ten',
              'TenHang',
              'Name',
              'ItemName',
              'ProductName',
              'Description',
              'DienGiai'
            )
          },
          ['v']
        ) ||
        el.textContent.trim();


      /*
      VAT từng dòng:

      Ưu tiên VATAmount.
      Nếu không có thì lấy VATAmountOC.

      Không có cả hai thì null.
      */

      const vatRaw = first(
        {
          vatAmount:
            getExtraValue(
              el,
              'VATAmount'
            ),

          vatAmountOC:
            getExtraValue(
              el,
              'VATAmountOC'
            )
        },
        [
          'vatAmount',
          'vatAmountOC'
        ]
      );


      return {

        name,

        _supplierProductName:
          name,

        qty: num(
          get(
            'SLuong',
            'SoLuong',
            'Quantity',
            'Qty'
          )
        ),

        dvtGoc: get(
          'DVTinh',
          'DonViTinh',
          'Unit'
        ),

        dongia: num(
          get(
            'DGia',
            'DonGia',
            'UnitPrice',
            'Price'
          )
        ),

        thanhtien: num(
          get(
            'ThTien',
            'ThanhTien',
            'Amount',
            'Total'
          )
        ),

        taxRate: num(
          get(
            'TSuat',
            'ThueSuat',
            'TaxRate'
          )
        ),

        /*
        null = XML không có VAT riêng từng dòng.
        0    = XML có VAT dòng bằng 0.
        */

        vatAmount:
          vatRaw !== null
            ? num(vatRaw)
            : null

      };

    })

    .filter(item =>
      item.name
    );


  /*
  ---------------------------------------------------------
  HEADER
  ---------------------------------------------------------
  */

  return {

    header: {

      code: all(
        'SHDon',
        'SoHoaDon',
        'InvoiceNo',
        'InvoiceNumber'
      ),

      day: dateISO(
        all(
          'NLap',
          'NgayLap',
          'InvoiceDate',
          'IssueDate'
        )
      ),

      supplier_tax_code: all(
        'MST',
        'MaSoThue',
        'TaxCode',
        'SellerTaxCode'
      ),

      supplier_name: all(
        'TenNban',
        'TenNguoiBan',
        'SellerName',
        'SupplierName'
      ),

      tongtien: num(
        all(
          'TgTCThue',
          'TotalBeforeTax',
          'SubTotal'
        )
      ),

      thue: num(
        all(
          'TgTThue',
          'TThue',
          'TotalTax',
          'TaxAmount'
        )
      ),

      tongthanhtoan: num(
        all(
          'TgTTTBSo',
          'TgTTien',
          'TotalAmount',
          'InvoiceTotal'
        )
      )

    },

    items

  };

}


/* =========================================================
EXCEL
========================================================= */

function excelRowsToInvoice(sheets) {

  const rows =
    sheets.flatMap(
      s => s.rows
    );


  let header = {};

  const found = [];


  for (const row of rows) {

    const cells =
      row.map(v =>
        String(v ?? '').trim()
      );


    const joined =
      norm(cells.join(' '));


    if (
      !header.supplier_tax_code &&
      /(ma so thue|mst nguoi ban|tax code)/
        .test(joined)
    ) {

      const i = cells.findIndex(v =>
        /(ma so thue|mst nguoi ban|tax code)/i
          .test(v)
      );

      header.supplier_tax_code =
        cells[i + 1] ||
        cells[i]
          ?.split(':')
          .pop()
          ?.trim() ||
        null;

    }


    if (
      !header.code &&
      /(so hoa don|invoice number)/
        .test(joined)
    ) {

      const i = cells.findIndex(v =>
        /(so hoa don|invoice number)/i
          .test(v)
      );

      header.code =
        cells[i + 1] ||
        null;

    }


    if (
      cells.some(v =>
        /(ten hang|ten san pham|hang hoa|description|item name)/i
          .test(v)
      ) &&
      cells.some(v =>
        /(so luong|quantity|qty)/i
          .test(v)
      )
    ) {

      const ix = {

        name: cells.findIndex(v =>
          /(ten hang|ten san pham|hang hoa|description|item name)/i
            .test(v)
        ),

        qty: cells.findIndex(v =>
          /(so luong|quantity|qty)/i
            .test(v)
        ),

        unit: cells.findIndex(v =>
          /(don vi|dvt|unit)/i
            .test(v)
        ),

        price: cells.findIndex(v =>
          /(don gia|unit price)/i
            .test(v)
        ),

        total: cells.findIndex(v =>
          /(thanh tien|amount|total)/i
            .test(v)
        )

      };


      const start =
        rows.indexOf(row) + 1;


      for (
        let j = start;
        j < rows.length;
        j++
      ) {

        const r = rows[j];


        if (
          !r ||
          !r[ix.name]
        ) {
          break;
        }


        found.push({

          name:
            String(r[ix.name]),

          qty:
            num(r[ix.qty]),

          dvtGoc:
            ix.unit >= 0
              ? r[ix.unit] || null
              : null,

          dongia:
            num(r[ix.price]),

          thanhtien:
            num(r[ix.total]),

          /*
          Excel parser hiện chưa xác định
          VAT riêng từng dòng.
          */

          vatAmount: null

        });

      }


      break;

    }

  }


  return {

    header: {

      code:
        header.code ||
        null,

      day:
        new Date()
          .toISOString()
          .slice(0, 10),

      supplier_tax_code:
        header.supplier_tax_code ||
        null

    },

    items: found

  };

}


/* =========================================================
TEXT / OCR
========================================================= */

function textToInvoice(text) {

  const lines =
    String(text || '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);


  const all =
    lines.join(' ');


  const match = re =>
    all.match(re)?.[1]?.trim() ||
    null;


  const header = {

    code: match(
      /(?:Số hóa đơn|So hoa don|Invoice\s*(?:No|Number))\s*[:#]?\s*([\w/-]+)/i
    ),

    day: dateISO(
      match(
        /(?:Ngày lập|Ngay lap|Invoice date)\s*[:]?\s*(\d{1,2}[/.\\-]\d{1,2}[/.\\-]\d{4})/i
      )
    ),

    supplier_tax_code: match(
      /(?:Mã số thuế|Ma so thue|Tax code)\s*[:]?\s*([0-9-]+)/i
    ),

    supplier_name: match(
      /(?:Tên người bán|Ten nguoi ban|Seller)\s*[:]?\s*([^\n]+)/i
    )

  };


  /*
  OCR formats vary.
  Conservative row parser.
  */

  const items = [];


  for (const line of lines) {

    const m = line.match(
      /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(\S+)\s+([\d.,]+)\s+([\d.,]+)$/
    );


    if (
      m &&
      !/(cộng|tổng|total|thuế|vat)/i
        .test(m[1])
    ) {

      items.push({

        name:
          m[1].trim(),

        qty:
          num(m[2]),

        dvtGoc:
          m[3],

        dongia:
          num(m[4]),

        thanhtien:
          num(m[5]),

        /*
        OCR chưa đọc VAT từng dòng
        thì không tự suy đoán.
        */

        vatAmount: null

      });

    }

  }


  return {

    header,

    items

  };

}


/* =========================================================
EXPORT
========================================================= */

export function parseInvoice(
  readResult
) {

  if (
    readResult.format === 'xml'
  ) {

    return xmlToObj(
      readResult.text
    );

  }


  if (
    readResult.format === 'excel'
  ) {

    return excelRowsToInvoice(
      readResult.sheets
    );

  }


  if (readResult.text) {

    return textToInvoice(
      readResult.text
    );

  }


  return {

    header: {

      day:
        new Date()
          .toISOString()
          .slice(0, 10)

    },

    items: [],

    needsManualReview: true

  };

}


/* =========================================================
NORMALIZE SUPPLIER NAME
========================================================= */

export function normalizeSupplierName(
  value
) {

  return norm(value);

}
