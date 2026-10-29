/* File readers. PDF and image reading use browser CDN libraries loaded by invoice-import.html. */
const loadScript = (src, test) => new Promise((resolve,reject)=>{
  if(test()) return resolve();
  const s=document.createElement('script');s.src=src;s.onload=()=>test()?resolve():reject(new Error('Không khởi tạo được thư viện đọc file.'));s.onerror=()=>reject(new Error('Không tải được thư viện đọc file.'));document.head.appendChild(s);
});

export async function readInvoiceFile(file){
  const name=file.name.toLowerCase();
  if(name.endsWith('.xml') || file.type.includes('xml')) return {format:'xml',text:await file.text()};
  if(name.endsWith('.xlsx')||name.endsWith('.xls')||name.endsWith('.csv')){
    await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',()=>!!window.XLSX);
    const bytes=await file.arrayBuffer(); const wb=window.XLSX.read(bytes,{type:'array'});
    const sheets=wb.SheetNames.map(sheet=>({name:sheet,rows:window.XLSX.utils.sheet_to_json(wb.Sheets[sheet],{header:1,defval:''})}));
    return {format:'excel',sheets};
  }
  if(name.endsWith('.pdf')||file.type==='application/pdf'){
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',()=>!!window.pdfjsLib);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdf=await window.pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;let text='';
    for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p);const content=await page.getTextContent();text+=content.items.map(x=>x.str).join(' ')+'\n';}
    if(text.trim()) return {format:'pdf',text};
    return {format:'pdf-image',file};
  }
  if(file.type.startsWith('image/')||/\.(png|jpe?g|webp|bmp|tiff?)$/i.test(name)) return {format:'image',file};
  throw new Error('Định dạng file chưa được hỗ trợ: '+file.name);
}

export async function imageToText(file){
  await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',()=>!!window.Tesseract);
  const result=await window.Tesseract.recognize(file,'vie+eng');
  return result.data.text||'';
}
