import {getAll} from "../../js/crud.js"

let thead
let tbody

let roles = []
let permissions = []
let rolePermissions = []

export async function init(params, root){

thead = root.querySelector("#thead")
tbody = root.querySelector("#tbody")

await render()

}

async function render(){

[
roles,
permissions,
rolePermissions
] = await Promise.all([

getAll("roles"),

getAll("permissions"),

getAll("role_permissions")

])

buildHead()
buildBody()

}

function buildHead(){

let html = "<tr>"

html += `
<th class="sticky-col">
Permission
</th>
`

for(const role of roles){

html += `
<th>
${role.name}
</th>
`

}

html += "</tr>"

thead.innerHTML = html

}