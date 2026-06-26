// modules/document-list/services/release/release-export.js

import ExcelJS from "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/+esm"

export async function exportReleaseExcel(rows = []){

  /* =====================================
  SELECTED ROWS
  ===================================== */

  const selectedRows =

    Array.from(

      document.querySelectorAll(
        ".release-row-check:checked"
      )

    )

  if(!selectedRows.length){

    alert(
      "Chưa chọn dòng"
    )

    return

  }

  /* =====================================
  WORKBOOK
  ===================================== */

  const workbook =

    new ExcelJS.Workbook()

  const sheet =

    workbook.addWorksheet(
      "Phat_hanh"
    )

  /* =====================================
  COLUMNS
  ===================================== */

  sheet.columns = [

    {
      header:"STT",
      key:"stt",
      width:8
    },

    {
      header:"Ngày",
      key:"day",
      width:14
    },

    {
      header:"Mã KH",
      key:"id_customer",
      width:14
    },

    {
      header:"Tên đơn vị",
      key:"donvi",
      width:30
    },

    {
      header:"MST",
      key:"mst",
      width:20
    },

    {
      header:"Địa chỉ",
      key:"address",
      width:36
    },

    {
      header:"Người mua hàng",
      key:"buyer",
      width:24
    },

    {
      header:"HT thanh toán",
      key:"payment",
      width:16
    },

    {
      header:"Tên SP",
      key:"product",
      width:32
    },

    {
      header:"ĐVT",
      key:"dvt",
      width:12
    },

    {
      header:"SL",
      key:"qty",
      width:12
    },

    {
      header:"Đơn giá",
      key:"dongia",
      width:16
    },

    {
      header:"Thành tiền",
      key:"thanhtien",
      width:18
    }

  ]

  /* =====================================
  HEADER STYLE
  ===================================== */

  const headerRow =

    sheet.getRow(1)

  headerRow.font = {
    bold:true
  }

  headerRow.alignment = {
    vertical:"middle",
    horizontal:"center"
  }

  /* =====================================
  DATA
  ===================================== */

  let stt = 1

  const renderedDocs =

    new Set()

  selectedRows.forEach(input=>{

    const tr =

      input.closest("tr")

    if(!tr) return

    const docIndex =

      Number(
        tr.dataset.docIndex
      )

    const itemIndex =

      Number(
        tr.dataset.itemIndex
      )

    const doc =
      rows[docIndex]

    if(!doc) return

    const item =

      doc.document_items?.[
        itemIndex
      ]

    if(!item) return

    /* ===================================
    FIRST ROW OF DOCUMENT
    =================================== */

    const isFirstRow =

      !renderedDocs.has(
        doc.id
      )

    if(isFirstRow){

      renderedDocs.add(
        doc.id
      )

    }

    /* ===================================
    FORMAT DATE
    =================================== */

    let formattedDate = ""

    if(doc.day){

      const d =

        new Date(doc.day)

      formattedDate =

        [
          d.getDate(),
          d.getMonth() + 1,
          d.getFullYear()
        ]

        .join("/")
    }

    /* ===================================
    CURRENT STT
    =================================== */

    const currentStt =

      isFirstRow
        ? stt++
        : stt - 1


    /* ===================================
    ADD ROW
    =================================== */

    const row =

      sheet.addRow({

        stt:
          currentStt,

        day:

          isFirstRow
            ? formattedDate
            : "",

        id_customer:

          isFirstRow
            ? (doc.id_customer || "")
            : "",

        donvi:

          isFirstRow
            ? (doc.donvi || "")
            : "",

        mst:

          isFirstRow
            ? (doc.tax_code || "")
            : "",

        address:

          isFirstRow
            ? (doc.address || "")
            : "",

        buyer:

          isFirstRow
            ? (doc.customer_name || "")
            : "",

        payment:

          isFirstRow
            ? "TM/CK"
            : "",

        product:
          item.name || "",

        dvt:
          item.dvtGoc || "",

        qty:

          Number(
            item.tongsoluong || 0
          ),

        dongia:

          Number(
            item.dongia || 0
          )

      })

    /* ===================================
    FORMULA
    =================================== */

    const rowNumber =

      row.number

    row.getCell(13).value = {

      formula:
        `K${rowNumber}*L${rowNumber}`,

      result: 

        Number(
          item.thanhtien || 0
        )    

    }

    /* ===================================
    ALIGN
    =================================== */

    ;[11,12,13].forEach(col=>{

      row.getCell(col).alignment = {
        horizontal:"right"
      }

    })


  })



  /* =====================================
  EXPORT
  ===================================== */

  const buffer =

    await workbook.xlsx.writeBuffer()

  const blob =

    new Blob(

      [buffer],

      {

        type:

          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

      }

    )

  const url =

    URL.createObjectURL(blob)

  const a =

    document.createElement("a")

  a.href = url

  a.download =

    `phat-hanh-${Date.now()}.xlsx`

  a.click()

  URL.revokeObjectURL(url)

}