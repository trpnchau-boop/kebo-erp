import {
getAll,
insertMany,
updateRow
} from "../../js/crud.js"

import { schema } from "/js/schema/index.js"

import {
  openSidebarPanel,
  closeSidebarPanel
} from "/js/sidebar-panel.js"

import {
  renderDropdownSelect,
  getDropdownValue,
  bindDropdownSelect
} from "/js/components/dropdown-select.js"

import {
  bindDropdownMenus
} from "/js/components/dropdown-menu.js"

let table = ""
let rows = []
let headers = []
let headerRow = 3


export async function init(params){

table = params.type

const title =
schema[table]?.label || table

document.getElementById("title")
.innerText = "Nạp Excel - " + title

document
.getElementById("btn-map")
.addEventListener("click",()=>{

    if(!rows.length){
        alert("Vui lòng chọn tệp Excel trước");
        return;
    }

    openMap();

});

document.getElementById("header-row").innerHTML =
renderDropdownSelect({

    value:4,

    allowEmpty:false,

    options:Array.from(
        {length:10},
        (_,i)=>({

            value:i+1,
            label:String(i+1)

        })

    )

})

document.getElementById("dup-mode").innerHTML =
renderDropdownSelect({

    value:"skip",

    allowEmpty:false,

    options:[

        {
            value:"skip",
            label:"Bỏ qua dòng trùng code"
        },

        {
            value:"update",
            label:"Cập nhật nếu trùng code"
        }

    ]

})

bindDropdownMenus()
bindDropdownSelect()

document
.getElementById("excel-file")
.addEventListener("change", readFile)

document
.querySelector(
"#header-row .dropdown-select-trigger"
)
.addEventListener("change", ()=>{

headerRow =
Number(
getDropdownValue(
    document.getElementById("header-row")
)
) - 1

buildMap();

renderPreview();

paintMappedColumns();

updateInfo();

})

document
.getElementById("btn-run")
.addEventListener("click", runImport)


}

/* =====================
READ FILE
===================== */

async function readFile(e){

const file = e.target.files[0]
if(!file) return

const buf = await file.arrayBuffer()

const wb = XLSX.read(buf)

const ws = wb.Sheets[wb.SheetNames[0]]

rows = XLSX.utils.sheet_to_json(ws,{
  header:1,
  defval:""
})

document.getElementById("file-name").textContent = file.name

openMap();

renderPreview();

paintMappedColumns();

updateInfo();

}

/* =====================
FIELDS
===================== */

function getFields(){

const fields =
schema[table]?.fields || {}

return Object.entries(fields)
.filter(([k,f])=>
k !== "id" &&
!f.hidden &&
(f.showInList || !f.hidden)
)

}

/* =====================
MAP UI
===================== */

function buildMap(){

headers = rows[headerRow] || []

let html = `
<table class="table">
<tr>
<th>Hệ thống</th>
<th>Cột Excel</th>
</tr>
`

getFields().forEach(([key,f])=>{

    const options = headers.map((h,i)=>({
        value:i,
        label:h
    }))

    html += `
    <tr>

        <td>${f.label || key}</td>

        <td>

        ${renderDropdownSelect({

            className:"map-col",

            field:key,

            value:"",

            emptyText:"-- Bỏ qua --",

            options

        })}

        </td>

    </tr>
    `

})

html += "</table>"

const box = document.getElementById("map-box")

if(!box) return

box.innerHTML = html
bindDropdownSelect()
autoMap()
bindMapColor();
}

/* =====================
AUTO MAP
===================== */

function autoMap(){

document
.querySelectorAll(".map-col")
.forEach(dropdown=>{

    const label =
        dropdown
        .closest("tr")
        .children[0]
        .innerText
        .trim()
        .toLowerCase();

    headers.forEach((h,i)=>{

        const t = String(h).toLowerCase();

        if(
            t.includes(label) ||
            label.includes(t)
        ){

            const trigger =
                dropdown.querySelector(
                    ".dropdown-select-trigger"
                );

            trigger.dataset.value = i;

            trigger.querySelector("span").textContent = headers[i];

            dropdown.classList.remove("empty");

        }

    });

});

}

/* =====================
PREVIEW
===================== */

function renderPreview(){

    const previewRows = rows.slice(
        headerRow,
        headerRow + 100
    );

    let html = `
    <table class="import-preview-table">

        <thead>
            <tr>
                <th class="row-no-head"></th>
    `;

    headers.forEach((h,index)=>{

        html += `
        <th class="excel-col">
          ${getExcelColumnName(index)}
        </th>
        `;

    });

    html += `
            </tr>
        </thead>

        <tbody>
    `;

    previewRows.forEach((r,index)=>{
        const isHeader = index === 0;

        html += `
            <tr class="${isHeader ? 'excel-header-row' : ''}">
                <td class="row-no">${headerRow + 1 + index}</td>
        `;

        headers.forEach((_,col)=>{

            html += `
                <td>${r[col] ?? ""}</td>
            `;

        });

        html += `
            </tr>
        `;

    });

    html += `
        </tbody>

    </table>
    `;

    document.getElementById("preview-box").innerHTML = html;

    paintMappedColumns();

}

/* =====================
RUN IMPORT
===================== */

async function runImport(){

    const map = {};

    document.querySelectorAll(".map-col").forEach(x=>{

        const value = getDropdownValue(x);

        if(value !== ""){
            map[x.dataset.field] = Number(value);
        }

    });

    const data = [];

    for(let i = headerRow + 1; i < rows.length; i++){

        const r = rows[i];
        const obj = {};

        Object.entries(map).forEach(([key,col])=>{

            const value = r[col];

            if(value !== "" && value != null){
                obj[key] = value;
            }

        });

        if(Object.keys(obj).length){
            data.push(obj);
        }

    }

    if(!data.length){
        alert("Không có dữ liệu");
        return;
    }

    const mode = getDropdownValue(
        document.getElementById("dup-mode")
    );

    const result =
        mode === "skip"
            ? await importSkip(data)
            : await importUpdate(data);

    closeSidebarPanel();
    showImportSummary(result);


    if(window.reloadCurrentList){
        window.reloadCurrentList();
    }

}

/* =====================
SKIP DUP CODE
===================== */

async function importSkip(data){

    const old = await getAll(table);

    const codeSet = new Set(
        old.map(x=>x.code).filter(Boolean)
    );

    const insertRows = [];

    const result = {
        inserted:0,
        updated:0,
        skipped:0,
        errors:0
    };

    for(const row of data){

        if(!row.code){

            insertRows.push(row);
            continue;

        }

        if(codeSet.has(row.code)){

            result.skipped++;
            continue;

        }

        codeSet.add(row.code);
        insertRows.push(row);

    }

    if(insertRows.length){

        await insertMany(table,insertRows);

        result.inserted = insertRows.length;

    }

    return result;

}

/* =====================
UPDATE DUP CODE
===================== */

async function importUpdate(data){

    const old = await getAll(table);

    const codeMap = new Map(
        old
            .filter(x=>x.code)
            .map(x=>[x.code,x])
    );

    const insertRows = [];

    const result = {
        inserted:0,
        updated:0,
        skipped:0,
        errors:0
    };

    for(const row of data){

        if(!row.code){

            insertRows.push(row);
            continue;

        }

        const found = codeMap.get(row.code);

        if(found){

            if(found.id){

                await updateRow(
                    table,
                    found.id,
                    row
                );

            }

            Object.assign(found,row);

            result.updated++;

        }else{

            insertRows.push(row);

            codeMap.set(row.code,row);

        }

    }

    if(insertRows.length){

        await insertMany(table,insertRows);

        result.inserted = insertRows.length;

    }

    return result;

}
function updateInfo(){

    document.getElementById("import-info").textContent =
        `${Math.max(rows.length-headerRow-1,0)} dòng • ${headers.length} cột`;

}

function bindMapColor(){

    document
    .querySelectorAll(".map-col")
    .forEach(x=>{

        x.querySelector(".dropdown-select-trigger")
        .addEventListener("change",()=>{

            paintMappedColumns();

        });

    });

}
function paintMappedColumns(){

    document
    .querySelectorAll(".mapped")
    .forEach(x=>x.classList.remove("mapped"));

    document
    .querySelectorAll(".map-col")
    .forEach(sel=>{

        const value = getDropdownValue(sel);
        if(value==="") return;
        const col = Number(value);

        document.querySelectorAll( ".import-preview-table tbody tr")
        .forEach(tr=>{

            tr.children[col + 1]?.classList.add("mapped");

        });

    });

}
function showImportSummary(result){

    document.getElementById("import-summary").innerHTML = `

        <div class="item ok">
            Thêm mới ${result.inserted}
        </div>

        <div class="item">
            Cập nhật ${result.updated}
        </div>

        <div class="item warn">
            Bỏ qua ${result.skipped}
        </div>

        <div class="item error">
            Lỗi ${result.errors}
        </div>

    `;

}
function getExcelColumnName(index){

    let name = "";
    index++;

    while(index > 0){

        const rem = (index - 1) % 26;

        name = String.fromCharCode(65 + rem) + name;

        index = Math.floor((index - 1) / 26);

    }

    return name;

}
function openMap(){

    openSidebarPanel(`
        <div class="import-map-panel">

            <h3>Map cột</h3>

            <div id="map-box"></div>

        </div>
    `);

    buildMap();

}