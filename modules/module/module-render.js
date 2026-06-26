import {
  renderDropdownSelect
} from "/js/components/dropdown-select.js"

export function renderTable(root, tables, groups){

  const tbody = root.querySelector("#table-body")

  tbody.innerHTML = tables.map(t => `
    <tr 
      data-id="${t.id}"
      data-name="${t.name || ""}"
      data-code="${t.module_code || ""}"
      data-secured="${t.is_secured ? "1" : "0"}"
    >
      <td>${t.table_name}</td>

      <td>
        <input class="input-name" value="${t.name || ""}">
      </td>

      <td>
        ${renderDropdownSelect({
          value: t.module_code,
          options: groups.map(g => ({
            value: g.code,
            label: g.name
          })),
          rowId: t.id,
          field: "module_code",
          className: "module-filter",
          emptyText: "-- Chọn group --"
        })}
      </td>

      <td>
        <label class="switch">
        <input type="checkbox" class="input-secured"
            ${t.is_secured ? "checked" : ""}>
          <span></span>
        </label>
      </td>
    </tr>
  `).join("")
}

function renderOptions(groups, selected){
  return groups.map(g => `
    <option value="${g.code}"
      ${g.code === selected ? "selected" : ""}>
      ${g.name}
    </option>
  `).join("")
}