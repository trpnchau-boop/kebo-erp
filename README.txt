KEBO ERP - MODULE NAP HOA DON DAU VAO

Trong ZIP nay co module:
- invoice-import.html
- invoice-import.js
- invoice-reader.js
- invoice-parser.js
- invoice-product-map.js

Cach cai:
1) Copy folder invoice-import vao modules/ cua project KEBO ERP.
2) Mo menu Quan ly hoa don > Hoa don dau vao, gan nut "Nap hoa don" de mo tab:

   import { openTab } from "/js/tabs.js";
   await openTab("invoice-import", "Nạp hóa đơn", "invoice-import", {});

3) Chon file tren may. Khi da doc/doi chieu, bam "Mo chung tu de kiem tra".
   Module se mo tab document voi type ISSUE va state header/items duoc chuan bi.
4) Chung tu duoc luu bang flow ISSUE hien co (tax_invoice / tax_invoice_items).

GHI CHU QUAN TRONG:
- Module chi chuan bi du lieu va mo document. Khong tu dong ghi hoa don vao DB va khong cap nhat ton kho.
- PDF text-based duoc doc text; PDF scan va anh su dung OCR Tesseract.js (tai CDN, can internet).
- Excel doc qua SheetJS CDN (can internet).
- Dinh dang hoa don XML cua cac nha cung cap khong dong nhat. XML parser va OCR/text parser co xu ly pho bien nhung can kiem tra voi file thuc te, dac biet hoa don PDF/anh va Excel co mau rieng.
- Doi chieu mapping dua tren MST nha cung cap + normalized_name exact match.
- Neu khong nhan duoc MST, khong co map tu dong.
- State header/items duoc chuyen qua openTab. Luu y module document phai tiep nhan route.state de hien thi dung; hien tai document.js/doc-init.js trong project co xu ly route.state.
