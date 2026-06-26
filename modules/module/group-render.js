export function renderGroupOnly(root, groups, tables){

  const el = root.querySelector("#group-body")

  if(!el){
    console.warn("❌ group.html thiếu #group-body")
    return
  }

  // map group -> tables
  const map = {}

  tables.forEach(t => {

    const key = t.module_code || "_no_group"

    if(!map[key]){
      map[key] = []
    }

    map[key].push(t)
  })

  el.innerHTML = groups.map(g => {

    const children = map[g.code] || []

    return `
      <div class="group-item">

        <div class="group-title ${children.length ? "has-child" : ""}">

          ${children.length
            ? `<span class="arrow">▸</span>`
            : `<span class="dot">•</span>`
          }

          ${g.name}

        </div>

        <div class="group-children" style="display:none">

          ${children.map(t => `

            <div
              class="child-item"
              data-table="${t.table_name}"
              data-module="${t.module_code || ""}"
            >
              └─ ${t.name || t.table_name}
            </div>

          `).join("")}

        </div>

      </div>
    `

  }).join("")
}