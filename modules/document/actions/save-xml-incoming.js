import { db } from "/js/supabase.js";
import { saveSupplierProductMapping } from "../../invoice-import/invoice-product-map.js";

const cleanTax = value => String(value || "").replace(/\s/g, "").trim();
const num = value => {
  if (value === "" || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

function buildHeader(state) {
  const h = state.header || {};
  const tax = cleanTax(h.supplier_tax_code || h.mst || h.mst_ncc);

  if (!h.id_customer) {
    throw new Error("Thiếu NCC");
  }
  if (!h.code) throw new Error("Hóa đơn XML chưa có số hóa đơn.");

  const subtotal = num(h.tongtien) ?? 0;
  const discount = num(h.chietkhau) ?? 0;
  const taxAmount = num(h.thue) ?? 0;

  return {
    code: String(h.code).trim(),
    type: "XML_IN",
    day: h.day || new Date().toISOString().slice(0, 10),
    id_customer: h.id_customer,
    id_employee: h.id_employee || null,
    note: h.note || null,
    tongtien: subtotal,
    chietkhau: discount,
    thue: taxAmount,
    tongthanhtoan: num(h.tongthanhtoan) ?? subtotal - discount + taxAmount,
    tien_tt: num(h.tien_tt) ?? 0,
    tongtienvon: num(h.tongtienvon) ?? 0,
    status: "draft",
    phathanh: false,
    is_act: true,
    ref: h.ref || null
  };
}

async function getInternalProduct(id) {
  const { data, error } = await db
    .from("data_product")
    .select("id,code,name,dvtGoc,tinhchat,parent_id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`Không tìm thấy sản phẩm nội bộ ID ${id}.`);
  return data;
}

function buildItem(row, header, docId, product) {
  const qty = num(row.qty ?? row.soluong) ?? 0;
  const amount = num(row.thanhtien) ?? 0;
  const price = num(row.dongia) ?? (qty ? amount / qty : 0);

  return {
    id_doc: docId,
    id_product: product.id,
    id_warehouse: row.id_warehouse || null,
    name: product.name, // Always persist KEBO internal product name.
    parent_id: product.parent_id || row.parent_id || null,
    tongsoluong: num(row.tongsoluong) ?? qty,
    dvtGoc: row.dvtGoc || product.dvtGoc || null,
    dongia: price,
    thanhtien: amount,
    tienvon: num(row.tienvon) ?? 0,
    vat_amount: num(row.vatAmount) ?? 0,
    cost_alloc: num(row.cost_alloc) ?? 0,
    note: row.note || null,
    line: num(row.line) ?? null,
    is_act: true,
    qty,
    id_unit: row.id_unit || null,
    dongiavon: num(row.dongiavon) ?? 0,
    id_customer: header.id_customer,
    tinhchat: row.tinhchat || product.tinhchat || null
  };
}

export async function saveXmlIncoming({ state }) {
  if (!state?.header) throw new Error("Không có dữ liệu hóa đơn XML.");
  const header = buildHeader(state);
  const rows = Array.isArray(state.items) ? state.items : [];

  if (!rows.length) throw new Error("Hóa đơn XML chưa có dòng hàng.");
  const unresolved = rows.filter(row => !row.id_product);
  if (unresolved.length) {
    throw new Error(`Còn ${unresolved.length} dòng hàng chưa ghép sản phẩm nội bộ. Hãy ghép đủ MASP trước khi lưu.`);
  }

  // Prevent duplicate invoice records: same supplier, invoice number, date and XML_IN type updates.
  const { data: foundRows, error: findError } = await db
    .from("tax_invoice")
    .select("id,code")
    .eq("type", "XML_IN")
    .eq("id_customer", header.id_customer)
    .eq("code", header.code)
    .eq("day", header.day)
    .limit(1);

  if (findError) throw findError;
  const existing = foundRows?.[0] || null;

  let savedHeader;
  if (existing?.id) {
    const { data, error } = await db
      .from("tax_invoice")
      .update(header)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    savedHeader = data;

    const { error: deleteError } = await db
      .from("tax_invoice_items")
      .delete()
      .eq("id_doc", savedHeader.id);
    if (deleteError) throw deleteError;
  } else {
    const { data, error } = await db
      .from("tax_invoice")
      .insert([header])
      .select()
      .single();
    if (error) throw error;
    savedHeader = data;
  }

  const prepared = [];
  for (const row of rows) {
    const product = await getInternalProduct(row.id_product);
    prepared.push({ row, product });
  }

  const itemPayload = prepared.map(({ row, product }) =>
    buildItem(row, header, savedHeader.id, product)
  );

  const { data: savedItems, error: itemError } = await db
    .from("tax_invoice_items")
    .insert(itemPayload)
    .select();

  if (itemError) throw itemError;

  // Persist the supplier's original label only in product_supplier_map.
  const mapErrors = [];
  const supplierTaxCode = cleanTax(
    state.header.supplier_tax_code || state.header.mst || state.header.mst_ncc
  );

  for (const { row, product } of prepared) {
    const supplierProductName =
      row._supplierProductName || row.supplier_product_name || row.name;

    if (
      !supplierTaxCode ||
      !supplierProductName ||
      !product.id
    ) {
      continue;
    }

    try {
      await saveSupplierProductMapping({
        supplierTaxCode,
        supplierProductName,
        idProduct: product.id,
        note: `Tên nội bộ: ${product.name}`
      });
    } catch (error) {
      mapErrors.push(error);
      console.error("SAVE SUPPLIER PRODUCT MAP", error);
    }
  }

  state.header.id = savedHeader.id;

  return {
    header: savedHeader,
    items: savedItems || [],
    mapWarnings: mapErrors.length
  };
}
