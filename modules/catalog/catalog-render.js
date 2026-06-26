export function renderCatalog(
  groups,
  products,
  box,
  selectedIds
){

  const noGroup =
    products.filter(
      p => !p.id_group
    )

  let html = ""

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
                  )
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
                  )
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
  checked = false
){

  const imageUrl =
    p.image_url ||
    "/images/no-image.png"

  return `
    <div
      class="catalog-card"
    >

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

      <div class="price">
        ${formatPrice(
          p.dongia1
        )}
      </div>

    </div>
  `
}

function formatPrice(v){

  return Number(
    v || 0
  ).toLocaleString()

}