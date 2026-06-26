import {getAll} from "../../../js/crud.js";

export async function openBarcodePopup(id){

const rows = await getAll("data_product",{id});
const row = rows[0];
if(!row) return;

const win = window.open(
"",
"barcodePopup",
"width=520,height=700"
);

win.document.write(`
<html>
<head>
<title>${row.code} - Barcode</title>
<style>
body{
font-family:Arial;
margin:0;
padding:20px;
text-align:center;
background:#fff;
}
h2{
margin:0 0 8px;
font-size:18px;
}
.code{
color:#666;
margin-bottom:12px;
}
svg{
max-width:100%;
height:140px;
}
button{
border:none;
background:none;
padding:0;
margin-left:8px;
color:#007aff;
text-decoration:underline;
cursor:pointer;
font-size:16px;
font-family:Arial;
}
button:hover{
opacity:.75;
}
</style>
</head>

<body>

<h2>${row.name}</h2>
<div class="code">${row.code}

<button id="copy-btn">Copy ảnh</button>
</div>
<svg id="barcode"></svg>

</body>
</html>
`);

win.document.close();

window.JsBarcode(
win.document.getElementById("barcode"),
row.barcode,
{
format:"EAN13",
displayValue:true,
fontSize:22,
height:90,
margin:10
}
);

const btn =
win.document.getElementById("copy-btn");

btn.onclick = async ()=>{

try{

const svg =
win.document.getElementById("barcode");

const xml =
new XMLSerializer().serializeToString(svg);

const svgBlob = new Blob(
[xml],
{type:"image/svg+xml;charset=utf-8"}
);

const url = URL.createObjectURL(svgBlob);

const img = new Image();

img.onload = ()=>{

const canvas =
win.document.createElement("canvas");

const scale = 4;

canvas.width = img.width * scale;
canvas.height = img.height * scale;

const ctx = canvas.getContext("2d");

ctx.scale(scale,scale);

ctx.fillStyle = "#ffffff";
ctx.fillRect(0,0,img.width,img.height);

ctx.drawImage(img,0,0);

canvas.toBlob(async(blob)=>{

try{

await win.navigator.clipboard.write([
new win.ClipboardItem({
"image/png": blob
})
]);

btn.innerText = "Đã copy";

}catch(err){

btn.innerText = "Bị chặn";

console.error(err);

}

setTimeout(()=>{
btn.innerText = "Copy ảnh";
},1200);

},"image/png");

URL.revokeObjectURL(url);

};

img.src = url;

}catch(err){

console.error(err);
btn.innerText = "Lỗi";

}
};
win.focus();

}