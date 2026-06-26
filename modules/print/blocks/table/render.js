export function renderTableBlock(
  block,
  state
){

  const headerBackgroundColor =
  
    block.props?.headerBackgroundColor ||

    "#f3f4f6"

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

  const rowHeight =

    block.props?.rowHeight ||

    22

  const headerHeight =

    36

  /* =========================================
  TYPOGRAPHY
  ========================================== */

const headerFontSize =

  block.props?.headerFontSize ||

  14

const headerFontWeight =

  block.props?.headerBold

    ? "700"

    : "400"

const headerFontStyle =

  block.props?.headerItalic

    ? "italic"

    : "normal"

const headerTextDecoration =

  block.props?.headerUnderline

    ? "underline"

    : "none"

const headerColor =

  block.props?.headerColor ||

  "#000000"

const headerTextStyle = `

  font-size:${headerFontSize}px;

  font-weight:${headerFontWeight};

  font-style:${headerFontStyle};

  text-decoration:${headerTextDecoration};

  color:${headerColor};

`

  /* =========================================
  AUTO HEIGHT
  ========================================== */

  const autoHeight =

    headerHeight +

    rows.length *
    rowHeight

  /* =========================================
  HEADER
  ========================================== */

  const headerHtml =

    columns

      .map((column,index)=>{

        const selectedColumn =
          state.selectedIds?.includes(block.id)
          &&
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

              justify-content:
                ${
                  column.align === "right"
                  ? "flex-end"
                  : column.align === "center"
                  ? "center"
                  : "flex-start"
                };

              background:
                
                ${
                  selectedColumn
                  ? "#bfdbfe"
                  : headerBackgroundColor
                };

              ${headerTextStyle}
            "
          >

            ${
              column.label || ""
            }

            <div

              class="
                table-column-resize
              "

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

  /* =========================================
  ROWS
  ========================================== */

  const rowsHtml =

    rows

      .map(row=>{

        const cellsHtml =

          columns

            .map((column,index)=>{

            const selectedColumn =
              state.selectedIds?.includes(block.id)
              &&
              state.selectedColumnIndex === index              

              return `

                <div

                  class="
                    print-table-cell
                  "

                  style="
                    width:${column.width}px;

                    height:${rowHeight}px;

                    justify-content:
                      ${
                        column.align === "right"
                        ? "flex-end"
                        : column.align === "center"
                        ? "center"
                        : "flex-start"
                      };

                    background:  
                      ${
                        selectedColumn
                        ? "#bfdbfe"
                        : "transparent"
                      };    

                  "
                >

                  ${
                    row[
                      column.key
                    ] || ""
                  }

                </div>

              `
            })

            .join("")

        return `

          <div
            class="
              print-table-row
            "
          >

            ${cellsHtml}

          </div>

        `
      })

      .join("")

  /* =========================================
  RENDER
  ========================================== */

  return `

    <div

      class="
        print-table
      "

      style="
        width:100%;

        height:100%;

        overflow:hidden;

        background:white;
      "
    >

      <div

        class="
          print-table-row
        "

        style="
          height:${headerHeight}px;
        "
      >

        ${headerHtml}

      </div>

      ${rowsHtml}

    </div>

  `
}