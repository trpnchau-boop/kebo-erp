import {
  getTableMetrics
}
from "/modules/print/layout/get-table-metrics.js"

export function renderTableBlock(
  block,
  state
){

  const columns =

    Array.isArray(
      block.props?.columns
    )

      ? block.props.columns

      : []

  const rows =

    Array.isArray(
      block.props?.rows
    )

      ? block.props.rows

      : []

  const {

    headerHeight,

    rowHeight

  } =

    getTableMetrics(

      block,

      rows.length

    )

  const headerHtml =

    columns

      .map((column,index)=>{

        const selected =

          state.selectedIds?.includes(block.id) &&

          state.selectedColumnIndex === index

        return `

          <div

            class="
              print-table-cell
              print-table-header
            "

            data-column-index="${index}"

            style="
              position:relative;

              width:${column.width}px;

              height:${headerHeight}px;

              display:flex;

              align-items:center;

              justify-content:${
                column.align==="right"
                  ? "flex-end"
                  : column.align==="center"
                  ? "center"
                  : "flex-start"
              };

              padding:4px;

              box-sizing:border-box;

              line-height:1;

              font-size:${block.props?.headerFontSize || 14}px;

              font-weight:${
                block.props?.headerBold
                  ? 700
                  : 400
              };

              font-style:${
                block.props?.headerItalic
                  ? "italic"
                  : "normal"
              };

              text-decoration:${
                block.props?.headerUnderline
                  ? "underline"
                  : "none"
              };

              color:${
                block.props?.headerColor || "#000"
              };

              background:${
                selected
                  ? "#bfdbfe"
                  : block.props?.headerBackgroundColor || "#f3f4f6"
              };
            "

          >

            ${column.label || ""}

            <div

              class="table-column-resize"

              data-column-index="${index}"

              style="
                position:absolute;

                top:0;

                right:-4px;

                width:8px;

                height:100%;

                cursor:col-resize;

                z-index:100;
              "

            ></div>

          </div>

        `

      })

      .join("")

  const rowsHtml =

    rows

      .map(row=>`

        <div class="print-table-row">

          ${columns.map((column,index)=>{

            const selected =

              state.selectedIds?.includes(block.id) &&

              state.selectedColumnIndex === index

            return `

              <div

                class="print-table-cell"

                style="
                  width:${column.width}px;

                  height:${rowHeight}px;

                  display:flex;

                  align-items:center;

                  justify-content:${
                    column.align==="right"
                      ? "flex-end"
                      : column.align==="center"
                      ? "center"
                      : "flex-start"
                  };

                  padding:4px;

                  box-sizing:border-box;

                  line-height:1;

                  background:${
                    selected
                      ? "#bfdbfe"
                      : "transparent"
                  };
                "

              >

                ${row[column.key] || ""}

              </div>

            `

          }).join("")}

        </div>

      `)

      .join("")

  return `

    <div

      class="print-table"

      style="
        width:100%;

        height:100%;

        background:#fff;
      "

    >

      <div class="print-table-row">

        ${headerHtml}

      </div>

      ${rowsHtml}

    </div>

  `
}