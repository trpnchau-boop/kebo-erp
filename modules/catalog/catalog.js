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
  exportImages
}
from "./export-images.js"

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

import { getSession } from "/js/auth.js"

import {

  initCatalogPinch,
  applyCatalogZoom,
  zoomDefault,
  saveSnapshot,
  restoreSnapshot,
  hasSnapshot ,
  isDefaultCatalogWidth

}
from "./catalog-pinch.js"

import {
  openCatalogViewer
}
from "./catalog-viewer.js"

let showHot = false
let lastTap = 0

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

  const btnRefresh =
    root.querySelector(
      "#btn-refresh"
    )  

  const selectedCount =
    root.querySelector(
      "#catalog-selected-count"
    )

  const {
    groups,
    products: initialProducts
  } =
  await getCatalogData()

  let products = initialProducts

  const canViewPrice =
    !!(await getSession())

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

  function getCenterCard(){

  const cards = [
    ...grid.querySelectorAll(".catalog-card")
  ]

  const center =
    window.innerHeight / 2

  let best = null
  let bestDistance = Infinity

  for(const card of cards){

    const rect =
      card.getBoundingClientRect()

    const y =
      rect.top + rect.height / 2

    const d =
      Math.abs(
        y - center
      )

    if(d < bestDistance){

      bestDistance = d
      best = card

    }

  }

  return best

}

function applyFilter(){

  const keyword =
    search.value
      .trim()
      .toLowerCase()

  const filtered =

    products.filter(p=>{

      return (

        !keyword

        ||

        (p.name || "")
          .toLowerCase()
          .includes(keyword)

        ||

        (p.code || "")
          .toLowerCase()
          .includes(keyword)

      )

    })

  renderCatalog(

    groups,
    filtered,
    grid,
    selectedIds,
    showHot,
    canViewPrice

  )

  applyCatalogZoom(grid)

}


  async function refreshCatalog(){

    btnRefresh.disabled = true

    const icon =
      btnRefresh.querySelector("img")

    icon.style.animation =
      "spin .8s linear infinite"

    try{

      const data =
        await getCatalogData()

      products =
        data.products

      search.value = ""  

      const trigger =
        groupSelect.querySelector(
          ".dropdown-select-trigger"
        )

      trigger.dataset.value = ""

      trigger.querySelector("span").textContent =
        "Tất cả nhóm"

      groupSelect.classList.add("empty")

      showHot = false

      btnHot.classList.remove(
        "active"
      )

      selectedIds.clear()

      updateSelectionUI()

      applyFilter()

    }finally{

      icon.style.animation = ""

      btnRefresh.disabled = false

    }

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

    await exportImages(
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

    await exportImages(
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

      if(showHot){

        requestAnimationFrame(()=>{

          document
            .getElementById("catalog-hot")
            ?.scrollIntoView({

              behavior:"smooth",
              block:"start"

            })

        })

      }

    }
  )

  /* =====================
     FILTER EVENTS
  ===================== */

  search.addEventListener(

  "input",

  ()=>{

    if(

      !search.value.trim()

    ){

      applyFilter()

      return

    }

if(

  !hasSnapshot()

){

  const card =
    getCenterCard()

  if(card){

    saveSnapshot({

      id: card.dataset.id,

      keyword: "",

      group:
        getDropdownValue(groupSelect),

      hot: showHot

    })

  }

}

applyFilter()

  }

)

groupSelect.addEventListener(
  "change",
  ()=>{

    showHot = false

    btnHot.classList.remove(
      "active"
    )

    applyFilter()

    const groupId =
      getDropdownValue(groupSelect)

    if(!groupId){
      return
    }

    requestAnimationFrame(()=>{

      document
        .getElementById(
          `catalog-group-${groupId}`
        )
        ?.scrollIntoView({

          behavior:"smooth",

          block:"start"

        })

    })

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

          await exportImages(
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

          await exportImages(
            [product],
            true
          )

        }

        return

      }

        if(

          e.target.closest(

            ".product-check,.btn-download,.btn-share"

          )

        ){
          return
        }

        const card =
          e.target.closest(
            ".catalog-card"
          )

        if(card){

          const now =
            Date.now()

          if(

  now-lastTap<300

){

  lastTap = 0

  if(

    isDefaultCatalogWidth()

  ){

    openCatalogViewer({

      products,

      productId:Number(
        card.dataset.id
      )

    })

  }else{

    zoomDefault(

      grid,

      {

        id: card.dataset.id,

        keyword: search.value,

        group:getDropdownValue(
          groupSelect
        ),

        hot:showHot

      }

    )

  }

  return

}

          lastTap = now

        }

    }
  )


grid.addEventListener(

  "dblclick",

  e=>{

    const card =
      e.target.closest(
        ".catalog-card"
      )

    if(!card){
      return
    }

    if(

      e.target.closest(

        ".product-check,.btn-download,.btn-share"

      )

    ){
      return
    }

    if(

      isDefaultCatalogWidth()

    ){

      openCatalogViewer({

        products,

        productId:Number(
          card.dataset.id
        )

      })

    }else{

      zoomDefault(

        grid,

        {

          id:card.dataset.id,

          keyword:search.value,

          group:getDropdownValue(
            groupSelect
          ),

          hot:showHot

        }

      )

    }

  }

)

/* =====================
   FIRST LOAD
===================== */

btnRefresh.addEventListener(
  "click",
  refreshCatalog
)

function restoreCatalog(){

  search.value = ""

  applyFilter()

}

initCatalogPinch(

  grid,

  {

    restore: restoreCatalog,

    back(){

      restoreSnapshot(
        grid,
        restoreCatalog
      )

    }

  }

)

  applyFilter()
  updateSelectionUI()

}
