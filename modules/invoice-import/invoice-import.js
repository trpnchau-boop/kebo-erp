
import { openTab } from '/js/tabs.js';

import {
  readInvoiceFile,
  imageToText
} from './invoice-reader.js';

import {
  parseInvoice
} from './invoice-parser.js';

import {
  mapInvoiceProducts
} from './invoice-product-map.js';


let parsedInvoice = null;


const byId = id =>
  document.getElementById(id);


const status = (
  message,
  isError = false
) => {

  const el =
    byId('invoice-import-status');

  if (!el) return;

  el.textContent = message;

  el.style.color =
    isError
      ? '#b42318'
      : '';

};


const esc = value => {

  return String(value ?? '')
    .replace(
      /[&<>"']/g,
      char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]
    );

};


/* =========================
PREVIEW XML
========================= */

function renderPreview(invoice) {

  const host =
    byId('invoice-import-preview');

  if (!host) return;

  const rows =
    invoice.items || [];


  host.innerHTML = `
    <div>
      <b>Hóa đơn:</b>
      ${esc(
        invoice.header?.code ||
        '(chưa nhận diện mã)'
      )}

      &nbsp;

      <b>Ngày:</b>
      ${esc(
        invoice.header?.day || ''
      )}

      &nbsp;

      <b>MST NCC:</b>
      ${esc(
        invoice.header?.supplier_tax_code ||
        '(chưa nhận diện)'
      )}
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Tên hàng trên hóa đơn</th>
          <th>SL</th>
          <th>ĐVT</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
          <th>Ghép sản phẩm</th>
        </tr>
      </thead>

      <tbody>

        ${rows.map((row, index) => `

          <tr class="${row._mapped ? '' : 'unmatched'}">

            <td>
              ${index + 1}
            </td>

            <td>
              ${esc(row.name || '')}
            </td>

            <td>
              ${esc(row.qty ?? '')}
            </td>

            <td>
              ${esc(row.dvtGoc || '')}
            </td>

            <td>
              ${esc(row.dongia ?? '')}
            </td>

            <td>
              ${esc(row.thanhtien ?? '')}
            </td>

            <td>
              ${
                row._mapped
                  ? `Đã nhận diện (ID ${esc(row.id_product)})`
                  : 'Chưa nhận diện'
              }
            </td>

          </tr>

        `).join('')}

      </tbody>
    </table>
  `;

}


/* =========================
READ XML / IMAGE / PDF
========================= */

async function handleFiles(files) {

  const file =
    files?.[0];

  if (!file) return;


  parsedInvoice = null;


  const openButton =
    byId('invoice-import-open');

  if (openButton) {
    openButton.disabled = true;
  }


  status(
    'Đang đọc ' + file.name + '…'
  );


  try {

    let read =
      await readInvoiceFile(file);


    /* =========================
    OCR
    ========================= */

    if (
      read.format === 'image' ||
      read.format === 'pdf-image'
    ) {

      const image =
        read.format === 'image'
          ? read.file
          : file;


      read = {
        format: 'ocr',

        text:
          await imageToText(image)
      };

    }


    /* =========================
    PARSE
    ========================= */

    let invoice =
      parseInvoice(read);


    if (!invoice.items?.length) {

      status(
        'Đã đọc file nhưng chưa tách được dòng hàng tự động. Bạn có thể cần kiểm tra định dạng hoặc nhập thủ công trong chứng từ.',
        true
      );

    }


    /* =========================
    MAP PRODUCTS
    ========================= */

    invoice =
      await mapInvoiceProducts(invoice);


    parsedInvoice =
      invoice;


    renderPreview(invoice);


    if (openButton) {
      openButton.disabled = false;
    }


    status(
      `Đã đọc ${invoice.items.length} dòng hàng. Dòng màu cam chưa được ghép MASP.`
    );


  } catch (error) {

    console.error(
      'INVOICE IMPORT',
      error
    );


    status(
      error?.message ||
      'Không đọc được file hóa đơn.',
      true
    );

  }

}


/* =========================
OPEN XML PREVIEW DOCUMENT
========================= */

function openXmlPreview() {

  if (!parsedInvoice) {
    return;
  }


  /* =========================
  HEADER
  ========================= */

  const header = {

    ...(parsedInvoice.header || {}),

    type: 'XML_PREVIEW'

  };


  /* =========================
  ITEMS
  ========================= */

  const items = (

    parsedInvoice.items || []

  ).map(row => ({

    ...row

  }));


  /* =========================
  DOCUMENT STATE
  ========================= */

  const state = {

    docType: 'XML_PREVIEW',

    header,

    items,

    draftRow: {},

    xmlPreview: true,

    invoiceImport: {

      source: 'file'

    }

  };


  /* =========================
  OPEN TAB
  ========================= */

  const tabId =
    'document-XML_PREVIEW-' +
    Date.now();


  return openTab(

    tabId,

    'Kiểm tra hóa đơn XML',

    'document',

    {
      type: 'XML_PREVIEW'
    },

    state

  );

}


/* =========================
INIT
========================= */

export async function init() {

  const input =
    byId('invoice-import-file');

  const open =
    byId('invoice-import-open');


  if (!input || !open) {
    return;
  }


  /* =========================
  FILE INPUT
  ========================= */

  input.addEventListener(
    'change',
    event => {

      handleFiles(
        event.target.files
      );

    }
  );


  /* =========================
  OPEN DOCUMENT
  ========================= */

  open.addEventListener(
    'click',
    async () => {

      try {

        await openXmlPreview();

      } catch (error) {

        console.error(
          'OPEN XML PREVIEW',
          error
        );

        status(
          error?.message ||
          'Không mở được chứng từ XML.',
          true
        );

      }

    }
  );

}
