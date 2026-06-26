/* =========================================================
DOCUMENT SUMMARY BAR
========================================================= */

export function initSummaryBar(root, state){

  // Chỉ dùng trên mobile
  if(window.innerWidth > 768){
    removeSummaryBar(root)
    return
  }

  removeSummaryBar(root)

  const header =
    root.querySelector(".doc-header")

  if(!header) return

  const bar =
    document.createElement("div")

  bar.className =
    "doc-summary-bar"

  bar.innerHTML = `

    <div class="doc-summary-item">

      <span class="doc-summary-label">
        Tiền hàng
      </span>

      <strong
        class="doc-summary-value"
        data-key="tongtien">
      </strong>

    </div>

  `

  header.insertAdjacentElement(
    "afterend",
    bar
  )

  updateSummaryBar(root,state)

}

/* ========================================================= */

export function updateSummaryBar(root){

  const keys = [
    "tongtien",
    "tongthanhtoan"
  ]

  keys.forEach(key => {

    // input trong payment summary
    const source =
      root.querySelector(
        `.payment-summary [data-key="${key}"]`
      )

    // text trong summary bar
    const target =
      root.querySelector(
        `.doc-summary-bar [data-key="${key}"]`
      )

    if(source && target){
      target.textContent = source.value
    }

  })

}
/* ========================================================= */

function removeSummaryBar(root){

  root
    .querySelector(".doc-summary-bar")
    ?.remove()

}

/* ========================================================= */

function formatMoney(v){

  return Number(v || 0)
    .toLocaleString("vi-VN")

}