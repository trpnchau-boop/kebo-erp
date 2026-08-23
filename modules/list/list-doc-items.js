import {db} from "/js/supabase.js"
import {openTab} from "/js/tabs.js"
import {
  formatMoney,
  formatDecimal
} from "/js/core/format.js"
import {
  createDatepicker
} from "/js/ui/init-datepicker.js"

let root

let rows = []
let thead
let tbody
let toolbar

// ========================================
// PAGINATION
// ========================================

const PAGE_SIZE = 100

let loadedOffset = 0
let hasMore = true
let loading = false

// Bộ lọc đã được áp dụng
let appliedSearch = {
  qCode: "bh",
  qCustomer: "",
  qProduct: "",
  fromDate: "",
  toDate: ""
}


// ========================================
// HELPER DOM
// ========================================

function $(id){
  return root.querySelector(`#${id}`)
}


// ========================================
// INIT
// ========================================

export async function init(params={}, pageRoot){

  root = pageRoot

  thead   = $("thead")
  tbody   = $("tbody")
  toolbar = $("toolbar")

  buildToolbar()
  buildHeader()

  createDatepicker(
    root,
    "#from-date",
    null
  )

  createDatepicker(
    root,
    "#to-date",
    null,
    {side:"right"}
  )

  bindEvents()

  // Mặc định chỉ lấy BH
  $("search-code").value = "BH"

  appliedSearch = getSearchValues()

  await resetAndLoad()
}


// ========================================
// UI
// ========================================

function buildToolbar(){

  toolbar.innerHTML = `

<div class="search-wrap">

  <div class="search-group">

    <input
      id="search-code"
      placeholder="Số CT"
    >

    <span id="search-code-label">
      Số CT
    </span>

    <input
      id="search-customer"
      placeholder="Khách hàng"
    >

    <input
      id="search-product"
      placeholder="Sản phẩm"
    >

  </div>

  <button
    class="search-btn"
    type="button"
  >
    🔍
  </button>

</div>

<div class="date-filter">

  <span>Từ ngày:</span>

  <input
    id="from-date"
    placeholder="yyyy-mm-dd"
  >

</div>

<div class="date-filter">

  <span>Đến ngày:</span>

  <input
    id="to-date"
    placeholder="yyyy-mm-dd"
  >

</div>

`
}


function buildHeader(){

  thead.innerHTML = `

<tr>

  <th>Ngày</th>

  <th>Số CT</th>

  <th>Khách hàng</th>

  <th>Sản phẩm</th>

  <th>Ghi chú</th>

  <th>Số lượng</th>

  <th>ĐVT</th>

  <th>Đơn giá</th>

  <th>Thành tiền</th>

</tr>

`
}


// ========================================
// EVENTS
// ========================================

function bindEvents(){

  // Click số chứng từ
  tbody?.addEventListener(
    "click",
    async e => {

      const link =
        e.target.closest(".barcode-link")

      if(!link) return

      e.preventDefault()

      const id =
        link.dataset.id

      const type =
        link.dataset.type

      if(!id || !type) return

      await openTab(
        `document-${type}-${id}`,
        link.textContent.trim(),
        "document",
        {
          type,
          id
        }
      )

    }
  )


  // Nút tìm kiếm
  root
    .querySelector(".search-btn")
    ?.addEventListener(
      "click",
      handleSearch
    )


  // Enter trong ô tìm kiếm
  for(
    const id of [
      "search-code",
      "search-customer",
      "search-product"
    ]
  ){

    $(id)?.addEventListener(
      "keydown",
      handleSearchKeydown
    )

  }

  $("search-code")?.addEventListener(
    "focus",
    () => {
      $("search-code-label").style.display = "none"
    }
  )

  $("from-date")
    ?.addEventListener(
      "keydown",
      handleSearchKeydown
    )

  $("to-date")
    ?.addEventListener(
      "keydown",
      handleSearchKeydown
    )


  // ========================================
  // INFINITE SCROLL
  // ========================================

  const listPage =
    root.querySelector(".list-page")

  listPage?.addEventListener(
    "scroll",
    () => {

      if(loading || !hasMore){
        return
      }

      const remaining =
        listPage.scrollHeight -
        listPage.scrollTop -
        listPage.clientHeight

      // Còn dưới 500px thì tải tiếp
      if(remaining < 500){

        loadNextPage()

      }

    }
  )

}


// ========================================
// SEARCH
// ========================================

function handleSearchKeydown(e){

  if(e.key !== "Enter"){
    return
  }

  e.preventDefault()

  handleSearch()
}


async function handleSearch(){

  // Chỉ khi người dùng bấm tìm
  // mới áp dụng giá trị mới
  appliedSearch =
    getSearchValues()

  await resetAndLoad()
}


// ========================================
// RESET
// ========================================

async function resetAndLoad(){

  if(loading){
    return
  }

  rows = []

  loadedOffset = 0

  hasMore = true

  renderEmpty(
    "Đang tải dữ liệu..."
  )

  try{

    await loadNextPage()

  }catch(error){

    console.error(
      "RESET DOCUMENT ITEMS ERROR",
      error
    )

    renderEmpty(
      "Không tải được dữ liệu"
    )

    alert(
      error.message ||
      "Không tải được dữ liệu"
    )

  }

}


// ========================================
// LOAD NEXT PAGE
// ========================================

async function loadNextPage(){

  if(loading || !hasMore){
    return
  }

  loading = true

  setLoading(true)

  try{

    const items =
      await loadItemsPage(
        loadedOffset,
        PAGE_SIZE
      )


    // Nếu ít hơn PAGE_SIZE
    // nghĩa là đã đến cuối
    if(items.length < PAGE_SIZE){

      hasMore = false

    }


    loadedOffset +=
      items.length


    // Không có dữ liệu
    if(!items.length){

      if(!rows.length){

        renderEmpty(
          "Không có dữ liệu"
        )

      }

      return
    }


    // ========================================
    // Chuyển dữ liệu thành row
    // ========================================

    const pageRows =
      items.map(
        item => {

          const doc =
            item.document || {}

          const customer =
            doc.data_customer || {}

          return {

            item,

            doc,

            customer,

            day:
              doc.day || "",

            code:
              String(
                doc.code || ""
              ).toLowerCase(),

            customerName:
              String(
                customer.name || ""
              ).toLowerCase(),

            productName:
              String(
                item.name || ""
              ).toLowerCase()

          }

        }
      )


    rows.push(
      ...pageRows
    )


    // Chỉ append page mới
    appendRows(pageRows)

  }catch(error){

    console.error(
      "LOAD DOCUMENT ITEMS ERROR",
      error
    )

    alert(
      error.message ||
      "Không tải được dữ liệu tra cứu"
    )

  }finally{

    loading = false

    setLoading(false)

  }

}


// ========================================
// LOAD ITEMS
// ========================================

async function loadItemsPage(
  offset,
  size
){

  let query =
    db
      .from("document_items")
      .select(`
        id,
        id_doc,
        id_customer,
        name,
        note,
        tongsoluong,
        dvtGoc,
        dongia,
        thanhtien,
        created_at,

        document!inner(
          id,
          code,
          day,
          type,
          id_customer,

          data_customer!inner(
            id,
            name
          )
        )
      `)


  // ========================================
  // CHỈ PHIẾU BÁN HÀNG
  // ========================================

  query =
    query.eq(
      "document.type",
      "SALE"
    )


  // ========================================
  // SỐ CHỨNG TỪ
  // ========================================

  if(appliedSearch.qCode){

    query =
      query.ilike(
        "document.code",
        `%${appliedSearch.qCode}%`
      )

  }


  // ========================================
  // SẢN PHẨM
  // ========================================

  if(appliedSearch.qProduct){

    query =
      query.ilike(
        "name",
        `%${appliedSearch.qProduct}%`
      )

  }


  // ========================================
  // KHÁCH HÀNG
  // ========================================

  if(appliedSearch.qCustomer){

    query =
      query.ilike(
        "document.data_customer.name",
        `%${appliedSearch.qCustomer}%`
      )

  }


  // ========================================
  // TỪ NGÀY
  // ========================================

  if(appliedSearch.fromDate){

    query =
      query.gte(
        "document.day",
        appliedSearch.fromDate
      )

  }


  // ========================================
  // ĐẾN NGÀY
  // ========================================

  if(appliedSearch.toDate){

    query =
      query.lte(
        "document.day",
        appliedSearch.toDate
      )

  }


  // ========================================
  // SORT + PAGINATION
  // ========================================

  const {
    data,
    error
  } =
    await query
      .order(
        "id",
        {
          ascending:false
        }
      )
      .range(
        offset,
        offset + size - 1
      )


  if(error){
    throw error
  }


  return data || []

}


// ========================================
// RENDER
// ========================================

function render(){

  if(!tbody){
    return
  }

  tbody.innerHTML = ""

  if(!rows.length){

    renderEmpty(
      "Không có dữ liệu"
    )

    return
  }

  appendRows(rows)

}


function appendRows(pageRows){

  if(!tbody){
    return
  }


  // Xóa dòng trạng thái
  const emptyRow =
    tbody
      .querySelector(
        'td[colspan="9"]'
      )
      ?.closest("tr")


  if(emptyRow){

    emptyRow.remove()

  }


  let html = ""


  for(
    const row of pageRows
  ){

    const {
      item,
      doc,
      customer,
      day
    } = row


    html += `

<tr>

  <td data-field="day">
    ${day}
  </td>

  <td data-field="code">

    <a
      href="#"
      class="barcode-link"
      data-id="${doc.id || ""}"
      data-type="${doc.type || ""}"
    >
      ${doc.code || ""}
    </a>

  </td>

  <td data-field="id_customer">
    ${customer.name || ""}
  </td>

  <td data-field="id_product">
    ${item.name || ""}
  </td>

  <td data-field="note">
    ${item.note || ""}
  </td>

  <td data-field="tongsoluong">
    ${formatDecimal(item.tongsoluong)}
  </td>

  <td data-field="dvtGoc">
    ${item.dvtGoc || ""}
  </td>

  <td data-field="dongia">
    ${formatMoney(item.dongia)}
  </td>

  <td data-field="thanhtien">
    ${formatMoney(item.thanhtien)}
  </td>

</tr>

`

  }


  tbody.insertAdjacentHTML(
    "beforeend",
    html
  )

}


// ========================================
// EMPTY / LOADING
// ========================================

function renderEmpty(message){

  if(!tbody){
    return
  }

  tbody.innerHTML = `

<tr>

  <td
    colspan="9"
    style="
      text-align:center;
      padding:20px
    "
  >
    ${message}
  </td>

</tr>

`

}


function setLoading(isLoading){

  if(!tbody){
    return
  }


  // Chỉ hiển thị loading khi
  // chưa có dòng nào
  if(
    isLoading &&
    !rows.length
  ){

    renderEmpty(
      "Đang tải dữ liệu..."
    )

  }

}


// ========================================
// SEARCH VALUES
// ========================================

function getSearchValues(){

  return {

    qCode:
      normalize(
        $("search-code")?.value
      ),

    qCustomer:
      normalize(
        $("search-customer")?.value
      ),

    qProduct:
      normalize(
        $("search-product")?.value
      ),

    fromDate:
      $("from-date")?.value || "",

    toDate:
      $("to-date")?.value || ""

  }

}


// ========================================
// HELPERS
// ========================================

function normalize(value){

  return String(
    value || ""
  )
    .trim()
    .toLowerCase()

}


function formatDate(v){

  if(!v){
    return ""
  }

  return String(v)
    .slice(0,10)

}