import {
  updateRow
}
from "/js/crud.js"

import {
  getCatalogData
}
from "./catalog-api.js"

import {
  renderCatalog
}
from "./catalog-render.js"

import {
  exportCatalogJpg
}
from "./export-catalog.js"

import {
  exportCatalogPdf
}
from "./export-catalog-pdf.js"

import {
  renderDropdownSelect,
  getDropdownValue,
  bindDropdownSelect
}
from "/js/components/dropdown-select.js"

import {
  bindDropdownMenus
}
from "/js/components/dropdown-menu.js"

let showHot = false

export async function init(
  params,
  root
){

  const grid =
    root.querySelector(
      "#catalog-grid"
    )

  const btnHot =
    root.querySelector(
      "#btn-new-products"
    )

  const search =
    root.querySelector(
      "#catalog-search"
    )

  const groupSelect =
    root.querySelector(
      "#catalog-group"
    )

  const checkAll =
    root.querySelector(
      "#catalog-check-all"
    )

  const btnExportSelected =
    root.querySelector(
      "#btn-export-selected"
    )

  const btnPdfSelected =
    root.querySelector(
      "#btn-pdf-selected"
    )

  const btnShareSelected =
    root.querySelector(
      "#btn-share-selected"
    )

  const selectedCount =
    root.querySelector(
      "#catalog-selected-count"
    )

  const {
    groups,
    products
  } =
  await getCatalogData()

  const now = new Date()

for(const p of products){

  if(

    p.catalog_priority

    &&

    p.catalog_priority_until

    &&

    new Date(
      p.catalog_priority_until
    ) < now

  ){

    p.catalog_priority = false

    p.catalog_priority_until = null

    await updateRow(

      "data_product",

      p.id,

      {

        catalog_priority:false,

        catalog_priority_until:null

      }

    )

  }

}

  const selectedIds =
    new Set()

  /* =====================
     GROUP OPTIONS
  ===================== */

groupSelect.innerHTML =
renderDropdownSelect({

  value:"",

  allowEmpty:false,

  className:"stock-filter",

  options:[

    {
      value:"",
      label:"Tất cả nhóm"
    },

    ...groups.map(g=>({

      value:g.id,
      label:g.name

    }))

  ]

})

  bindDropdownMenus()
  bindDropdownSelect()

  /* =====================
     HELPERS
  ===================== */

  function getSelectedProducts(){

    return products.filter(
      p =>
        selectedIds.has(
          p.id
        )
    )

  }

  function updateSelectionUI(){

    selectedCount.textContent =

      `${
        selectedIds.size
      }`

    checkAll.checked =

      selectedIds.size > 0

      &&

      selectedIds.size ===
      products.length

  }

  function applyFilter(){

    const keyword =
      search.value
        .trim()
        .toLowerCase()

    const groupId =
      getDropdownValue(
        groupSelect
      )

    const filtered =
      products.filter(p=>{

        const matchKeyword =

          !keyword

          ||

          (p.name || "")
            .toLowerCase()
            .includes(keyword)

          ||

          (p.code || "")
            .toLowerCase()
            .includes(keyword)

        const matchGroup =

          !groupId

          ||

          Number(
            p.id_group
          ) === Number(
            groupId
          )

        return (
          matchKeyword
          &&
          matchGroup
        )

      })


    renderCatalog(
      groups,
      filtered,
      grid,
      selectedIds,
      showHot
    )

  }

  /* =====================
     EXPORT BUTTONS
  ===================== */

  btnExportSelected.onclick =
  async ()=>{

    const items =
      getSelectedProducts()

    if(!items.length){

      alert(
        "Chưa chọn sản phẩm"
      )

      return

    }

    await exportCatalogJpg(
      items
    )

  }

  btnPdfSelected.onclick =
  async ()=>{

    const items =
      getSelectedProducts()

    if(!items.length){

      alert(
        "Chưa chọn sản phẩm"
      )

      return

    }

    await exportCatalogPdf(
      items
    )

  }

  btnShareSelected.onclick =
  async ()=>{

    const items =
      getSelectedProducts()

    if(!items.length){

      alert(
        "Chưa chọn sản phẩm"
      )

      return

    }

    await exportCatalogJpg(
      items,
      true
    )

  }

  btnHot.addEventListener(
    "click",
    ()=>{

      showHot = !showHot

      btnHot.classList.toggle(
        "active",
        showHot
      )  

      applyFilter()

    }
  )

  /* =====================
     FILTER EVENTS
  ===================== */

  search.addEventListener(
    "input",
    applyFilter
  )

  groupSelect.addEventListener(
    "change",
    ()=>{
      showHot = false
      btnHot.classList.remove(
        "active"
      )  
      applyFilter()
     }  
  )

  /* =====================
     CHECK ALL
  ===================== */

  checkAll.addEventListener(
    "change",
    ()=>{

      if(
        checkAll.checked
      ){

        products.forEach(
          p =>
            selectedIds.add(
              p.id
            )
        )

      }else{

        selectedIds.clear()

      }

      updateSelectionUI()

      applyFilter()

    }
  )

  /* =====================
     GRID EVENTS
  ===================== */

  grid.addEventListener(
    "change",
    e=>{

      /* GROUP CHECK */

      if(
        e.target.classList.contains(
          "group-check"
        )
      ){

        const groupId =
          e.target.dataset.groupId

        let groupProducts

      if(groupId === "hot"){

        const hotProducts =

          products.filter(
            p=>p.catalog_priority
          )

        if(e.target.checked){

          hotProducts.forEach(
            p=>selectedIds.add(
              p.id
            )
          )

        }else{

          hotProducts.forEach(
            p=>selectedIds.delete(
              p.id
            )
          )

        }

        updateSelectionUI()

        applyFilter()

        return

      }

        if(
          groupId === "nogroup"
        ){

          groupProducts =
            products.filter(
              p =>
                !p.id_group
            )

        }else{

          groupProducts =
            products.filter(
              p =>

                Number(
                  p.id_group
                )

                ===

                Number(
                  groupId
                )
            )

        }

        if(
          e.target.checked
        ){

          groupProducts.forEach(
            p=>
              selectedIds.add(
                p.id
              )
          )

        }else{

          groupProducts.forEach(
            p=>
              selectedIds.delete(
                p.id
              )
          )

        }

        updateSelectionUI()

        applyFilter()

        return

      }

      /* PRODUCT CHECK */

      if(
        !e.target.classList.contains(
          "product-check"
        )
      ){
        return
      }

      const id =
        Number(
          e.target.dataset.id
        )

      if(
        e.target.checked
      ){

        selectedIds.add(
          id
        )

      }else{

        selectedIds.delete(
          id
        )

      }

      updateSelectionUI()

    }
  )

  /* =====================
     CARD BUTTONS
  ===================== */

  grid.addEventListener(
    "click",
    async e=>{

      const downloadBtn =
        e.target.closest(
          ".btn-download"
        )

      if(downloadBtn){

        const id =
          Number(
            downloadBtn.dataset.id
          )

        const product =
          products.find(
            p =>
              p.id === id
          )

        if(product){

          await exportCatalogJpg(
            [product]
          )

        }

        return

      }

      const shareBtn =
        e.target.closest(
          ".btn-share"
        )

      if(shareBtn){

        const id =
          Number(
            shareBtn.dataset.id
          )

        const product =
          products.find(
            p =>
              p.id === id
          )

        if(product){

          await exportCatalogJpg(
            [product],
            true
          )

        }

      }

    }
  )

  /* =====================
     FIRST LOAD
  ===================== */

  applyFilter()

  updateSelectionUI()

}