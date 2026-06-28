// quote-share.js

import { state } from "./quote-state.js"

export async function shareQuote(){

  if(!state.items.length){
    alert("Chưa có sản phẩm")
    return
  }

  const root = buildHtml()

  document.body.appendChild(root)

  const canvas = await html2canvas(root,{
    scale:2,
    backgroundColor:"#ffffff"
  })

  root.remove()

  canvas.toBlob(async blob=>{

    const file = new File(
      [blob],
      "Bao-gia.png",
      {
        type:"image/png"
      }
    )

    if(
      navigator.share &&
      navigator.canShare?.({
        files:[file]
      })
    ){

      try{

        await navigator.share({

          title:"Báo giá",

          files:[file]

        })

      }

      catch(err){}

      return
    }

    const a =
      document.createElement("a")

    a.href =
      URL.createObjectURL(blob)

    a.download =
      "Bao-gia.png"

    a.click()

  })

}

/* ========================= */

function buildHtml(){

  const wrap =
    document.createElement("div")

  wrap.style.cssText=`

position:fixed;
left:-99999px;
top:0;
width:900px;
padding:30px;
background:#fff;
font-family:Arial;

`

  wrap.innerHTML=`

<h2 style="
margin:0 0 20px;
text-align:center;
">
BÁO GIÁ
</h2>

<table
style="
width:100%;
border-collapse:collapse;
font-size:15px;
">

<thead>

<tr>

<th>Tên SP</th>

<th>Tính chất</th>

<th>ĐVT gốc</th>

<th>Đơn giá</th>

<th>SL</th>

</tr>

</thead>

<tbody>

${state.items.map(buildRow).join("")}

</tbody>

</table>

`

  wrap.querySelectorAll(
    "th,td"
  ).forEach(td=>{

    td.style.border="1px solid #ddd"
    td.style.padding="8px"

  })

  return wrap

}

/* ========================= */

function buildRow(item){

  return `

<tr>

<td>${item.name||""}</td>

<td>${item.tinhchat||""}</td>

<td>${item.dvtGoc||""}</td>

<td>${formatMoney(item.dongia1)}</td>

<td>${item.qty}</td>

</tr>

`

}

/* ========================= */

function formatMoney(v){

  return Number(v||0)

    .toLocaleString("vi-VN")

}