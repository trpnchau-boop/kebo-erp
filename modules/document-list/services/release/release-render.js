import {
  bindAllMoneyInputs
}
from "/js/core/input-format.js"

import {
  parseMoney
}
from "/js/core/format.js"

export function renderReleaseRows(rows = []){

  const tbody =

    document.querySelector(
      ".release-tbody"
    )

  if(!tbody) return

  tbody.innerHTML = ""

  rows.forEach((doc,index)=>{

    const items =

      doc.document_items || []

    items.forEach((item,itemIndex)=>{

      const isFirst =  
        itemIndex === 0

      tbody.insertAdjacentHTML(

        "beforeend",

        `
          <tr
            
            data-doc-index="${index}"

            data-item-index="${itemIndex}"

          >  

            <!-- STT -->

            <td class="ta-c">
              <div
                style="
                  display:flex;
                  align-items:center;
                  gap:8px;
                "
              >  
                <input  
                  type="checkbox"
                  class="release-row-check"
                  checked
                />  

                <span>
                  ${index + 1}
                </span> 
              </div>   
            </td>

            <!-- NGÀY -->

            <td>
              ${isFirst
                ? (doc.day || "")
                : ""
              }
            </td>

            <!-- MÃ KH -->

            <td>
              ${isFirst
                ? (doc.id_customer || "")
                : ""
              }
            </td>

            <!-- TÊN ĐƠN VỊ -->

            <td>
              ${isFirst
                ? (doc.donvi|| "")
                : ""
              }
            </td>

            <!-- MST -->

            <td>
              ${isFirst
                ? (doc.tax_code || "")
                : ""
              }
            </td>

            <!-- ĐỊA CHỈ -->

            <td>
              ${isFirst
                ? (doc.address || "")
                : ""
              }
            </td>

            <!-- NGƯỜI MUA -->

            <td>
              ${isFirst
                ? (doc.customer_name || "")
                : ""
              }
            </td>

            <!-- HTTT -->

            <td>
              ${isFirst
                ? "TM/CK"
                : ""
              }
            </td>

            <!-- TÊN SP -->

            <td>
              <div>
                ${item.name || ""}
              </div>

              <div
                style=" font-size:12px; color:#6b7280; margin-top:2px;"
              >
                Tồn kho:
                ${
                  item.qty_balance || 0
                }
                ${
                  item.dvtGoc || ""
                }
              </div>

            </td>

            <!-- ĐVT -->

            <td>
              ${item.dvtGoc || ""}
            </td>

            <!-- SL -->

            <td>

              <input

                class="
                  release-input
                  release-input-sm
                  release-qty
                "

                type="text"

                data-format="money"

                value="${
                  item.tongsoluong || 0
                }"

              />

            </td>

            <!-- ĐƠN GIÁ -->

            <td>

              <input

                class="
                  release-input
                  release-input-sm
                  release-price
                "

                type="text"

                data-format="money"

                value="${
                  item.dongia || 0
                }"

              />

            </td>

            <!-- THÀNH TIỀN -->

            <td>

              <input

                class="
                  release-input
                  release-input-sm
                  release-amount
                "

                type="text"

                data-format="money"

                value="${
                  item.thanhtien || 0
                }"

              />

            </td>

          </tr>
        `

      )

    })

  })

  bindReleaseCheckbox()

  /* =========================
  MONEY FORMAT
  ========================= */

  bindAllMoneyInputs(tbody)

  /* =========================
  CALCULATION
  ========================= */

  bindReleaseCalculation(rows)

}

function bindReleaseCalculation(rows = []){

  const tbody =

    document.querySelector(
      ".release-tbody"
    )

  if(!tbody) return

  /* =========================
  EVENT DELEGATION
  ========================= */

  tbody.oninput = (e)=>{

    const target = e.target

    if(
      !target.classList.contains(
        "release-qty"
      )
      &&
      !target.classList.contains(
        "release-price"
      )
      &&
      !target.classList.contains(
        "release-amount"
      )
    ){
      return
    }

    const tr =

      target.closest("tr")

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

    const qtyInput =

      tr.querySelector(
        ".release-qty"
      )

    const priceInput =

      tr.querySelector(
        ".release-price"
      )

    const amountInput =

      tr.querySelector(
        ".release-amount"
      )

    const qty =

      parseMoney(
        qtyInput.value
      ) || 0

    const price =

      parseMoney(
        priceInput.value
      ) || 0

    const amount =

      parseMoney(
        amountInput.value
      ) || 0

    /* =====================
    QTY / PRICE
    => AMOUNT
    ===================== */

    if(

      target.classList.contains(
        "release-qty"
      )

      ||

      target.classList.contains(
        "release-price"
      )

    ){

      const total =

        qty * price

      amountInput.value =

        total

      item.tongsoluong = qty

      item.dongia = price

      item.thanhtien = total

    }

    /* =====================
    AMOUNT
    => PRICE
    ===================== */

    if(

      target.classList.contains(
        "release-amount"
      )

    ){

      if(qty){

        const newPrice =

          Math.round(
            amount / qty
          )

        priceInput.value =

          newPrice

        item.dongia =
          newPrice

      }

      item.thanhtien =
        amount

    }

  }

}
function bindReleaseCheckbox(){

  const checkAll =

    document.querySelector(
      ".release-check-all"
    )

  if(!checkAll) return

  checkAll.addEventListener(

    "change",

    ()=>{

      document

        .querySelectorAll(
          ".release-row-check"
        )

        .forEach(input=>{

          input.checked =
            checkAll.checked

        })

    }

  )

}