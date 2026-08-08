// catalog-render.js

import {
  renderCatalogImage
}
from "./catalog-image.js"


export function renderCatalog(

  groups,

  products,

  box,

  selectedIds,

  showHot = false,

  canViewPrice = true

){


  /* =====================================================
     NO GROUP
  ===================================================== */

  const noGroup =

    products.filter(

      p => !p.id_group

    )


  let html = ""


  /* =====================================================
     HOT
  ===================================================== */

  if(showHot){

    const hotProducts =

      products.filter(

        p => p.catalog_priority

      )


    if(hotProducts.length){

      const allSelected =

        hotProducts.every(

          p =>
            selectedIds.has(
              p.id
            )

        )


      html += `

        <section
          id="catalog-hot"
          class="catalog-group"
        >

          <h2
            class="catalog-group-title"
          >

            <label
              class="group-label"
            >

              <input
                type="checkbox"
                class="group-check"
                data-group-id="hot"
                ${
                  allSelected
                    ? "checked"
                    : ""
                }
              >

              <span
                class="star-wrap"
              >

                <img
                  src="/images/hot-star.webp"
                  class="hot-icon"
                  alt=""
                >

                <span
                  class="hot-text"
                >
                  Hot
                </span>

              </span>

            </label>

          </h2>


          <div
            class="catalog-grid"
          >

            ${
              hotProducts

                .map(

                  p =>

                    renderCard(

                      p,

                      selectedIds.has(
                        p.id
                      ),

                      canViewPrice

                    )

                )

                .join("")

            }

          </div>

        </section>

      `

    }

  }


  /* =====================================================
     GROUPS
  ===================================================== */

  for(const group of groups){


    let groupProducts =

      products.filter(

        p =>

          Number(
            p.id_group
          )

          ===

          Number(
            group.id
          )

      )


    /*
      Khi Hot đang bật:

      - Hot đã được đưa lên section Hot
      - Không render lại Hot trong group
      - Sản phẩm thường vẫn giữ nguyên
    */

    if(showHot){

      groupProducts =

        groupProducts.filter(

          p =>
            !p.catalog_priority

        )

    }


    if(!groupProducts.length){

      continue

    }


    const allSelected =

      groupProducts.every(

        p =>

          selectedIds.has(
            p.id
          )

      )


    html += `

      <section
        id="catalog-group-${group.id}"
        class="catalog-group"
      >

        <h2
          class="catalog-group-title"
        >

          <label
            class="group-label"
          >

            <input
              type="checkbox"
              class="group-check"
              data-group-id="${group.id}"
              ${
                allSelected
                  ? "checked"
                  : ""
              }
            >

            ${group.name}

          </label>

        </h2>


        <div
          class="catalog-grid"
        >

          ${
            groupProducts

              .map(

                p =>

                  renderCard(

                    p,

                    selectedIds.has(
                      p.id
                    ),

                    canViewPrice

                  )

              )

              .join("")

          }

        </div>

      </section>

    `

  }


  /* =====================================================
     NO GROUP
  ===================================================== */

  let visibleNoGroup = noGroup


  if(showHot){

    visibleNoGroup =

      noGroup.filter(

        p =>
          !p.catalog_priority

      )

  }


  if(visibleNoGroup.length){

    const noGroupSelected =

      visibleNoGroup.every(

        p =>

          selectedIds.has(
            p.id
          )

      )


    html += `

      <section
        id="catalog-group-nogroup"
        class="catalog-group"
      >

        <h2
          class="catalog-group-title"
        >

          <label
            class="group-label"
          >

            <input
              type="checkbox"
              class="group-check"
              data-group-id="nogroup"
              ${
                noGroupSelected
                  ? "checked"
                  : ""
              }
            >

            Khác

          </label>

        </h2>


        <div
          class="catalog-grid"
        >

          ${
            visibleNoGroup

              .map(

                p =>

                  renderCard(

                    p,

                    selectedIds.has(
                      p.id
                    ),

                    canViewPrice

                  )

              )

              .join("")

          }

        </div>

      </section>

    `

  }


  /* =====================================================
     RENDER
  ===================================================== */

  box.innerHTML = html

}


/* =====================================================
   CARD
===================================================== */

function renderCard(

  p,

  checked = false,

  canViewPrice = true

){


  const imageUrl =
    p.image_thumb_url ||
    p.image_url ||
    "/images/no-image.png"

  const outOfStock =

    Number(p.qty) <= 0


  return `

    <div
      class="catalog-card ${
        outOfStock
          ? "out-stock"
          : ""
      }"

      data-id="${p.id}"

      data-name="${
        (p.name || "")
          .toLowerCase()
      }"

      data-code="${
        (p.code || "")
          .toLowerCase()
      }"

      data-group-id="${
        p.id_group ?? ""
      }"

      data-priority="${
        p.catalog_priority
          ? "true"
          : "false"
      }"
    >


      ${
        outOfStock

          ? `

            <div
              class="out-stock-badge"
            >
              Tạm hết
            </div>

          `

          : ""

      }


      ${
        p.catalog_priority

          ? `

            <div
              class="card-hot"
            >

              <img
                src="/images/hot-star.webp"
                class="hot-icon"
                alt=""
              >

            </div>

          `

          : ""

      }


      <div
        class="card-toolbar"
      >

        <input
          type="checkbox"
          class="product-check"
          data-id="${p.id}"
          ${
            checked
              ? "checked"
              : ""
          }
        >


        <button
          class="btn-download"
          data-id="${p.id}"
          type="button"
        >

          <i
            class="bi bi-download"
          ></i>

        </button>


        <button
          class="btn-share"
          data-id="${p.id}"
          type="button"
        >

          <i
            class="bi bi-share"
          ></i>

        </button>

      </div>


      ${renderCatalogImage(imageUrl)}


      <div
        class="name"
      >
        ${p.name || ""}
      </div>


      ${
        p.catalogTinhChat

          ? `

            <div
              class="tinhchat"
            >
              ${p.catalogTinhChat}
            </div>

          `

          : ""

      }


      ${
        canViewPrice

          ? `

            <div
              class="price"
            >
              ${formatPrice(p.dongia3)}
            </div>

          `

          : ""

      }

    </div>

  `

}


/* =====================================================
   PRICE
===================================================== */

function formatPrice(v){

  return Number(

    v || 0

  ).toLocaleString()

}