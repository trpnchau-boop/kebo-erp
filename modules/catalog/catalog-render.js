export function renderCatalog(
  groups,
  products,
  box,
  selectedIds,
  showHot = false,
  canViewPrice = true
){

  const noGroup =
    products.filter(
      p => !p.id_group
    )

  let html = ""

if(showHot){

  const hotProducts =

    products.filter(
      p=>p.catalog_priority
    )

  if(hotProducts.length){

    const allSelected =

      hotProducts.every(
        p=>selectedIds.has(p.id)
      )

    html += `
      <section class="catalog-group">

        <h2 class="catalog-group-title">

          <label class="group-label">

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

            <span class="star-wrap">

              <img
                src="/images/hot-star.webp"
                class="hot-icon"
                alt=""
              >  

              <span class="hot-text">Hot</span>
            </span>   

          </label>

        </h2>

        <div class="catalog-grid">

          ${
            hotProducts
              .map(p=>

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

  for(const group of groups){

    const groupProducts =
      products.filter(
        p =>
          Number(p.id_group) ===
          Number(group.id)
      )

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
              .map(p=>

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

  if(noGroup.length){

    const noGroupSelected =
      noGroup.every(
        p =>
          selectedIds.has(
            p.id
          )
      )

    html += `
      <section
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
            noGroup
              .map(p=>

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

  box.innerHTML = html

}

function renderCard(
  p,
  checked = false,
  canViewPrice = true
){

  const imageUrl =
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
    >

      ${
        outOfStock
          ? `
            <div class="out-stock-badge">
              Tạm hết
            </div>
          `
          : ""
      }

      ${
        p.catalog_priority
          ? `
            <div class="card-hot">
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
        ${checked ? "checked" : ""}
      >

      <button
        class="btn-download"
        data-id="${p.id}"
        type="button"
      >
        <i class="bi bi-download"></i>
      </button>

      <button
        class="btn-share"
        data-id="${p.id}"
        type="button"
      >
        <i class="bi bi-share"></i>
      </button>

    </div>

      <img
        src="${imageUrl}"
        loading="lazy"
      >

      <div class="name">
        ${p.name || ""}
      </div>

      ${
        canViewPrice
          ? `
            <div class="price">
              ${formatPrice(p.dongia1)}
            </div>
          `
          : ""
      }

    </div>
  `
  }

function formatPrice(v){

  return Number(
    v || 0
  ).toLocaleString()

}