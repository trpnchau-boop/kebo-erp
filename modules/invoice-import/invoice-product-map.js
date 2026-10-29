import { db } from "/js/supabase.js";
import { normalizeSupplierName } from "./invoice-parser.js";

const cleanTax = value => String(value || "").replace(/\s/g, "").trim();

async function getInternalProduct(id) {
  const { data, error } = await db
    .from("data_product")
    .select("id,code,name,dvtGoc,dinhluong")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function mapInvoiceProducts(invoice) {
  const tax = cleanTax(invoice?.header?.supplier_tax_code);
  if (!Array.isArray(invoice.items)) return invoice;

  // Preserve the XML item label separately from the internal product label.
  for (const row of invoice.items) {
    row._supplierProductName =
      row._supplierProductName || row.supplier_product_name || row.name || "";
  }

  // Resolve supplier to the existing KEBO customer/supplier record by tax code.
  if (tax && !invoice.header.id_customer) {
    const { data: supplier, error: supplierError } = await db
      .from("data_customer")
      .select("id,mst,name")
      .eq("mst", tax)
      .limit(1)
      .maybeSingle();

    if (supplierError) {
      console.warn("LOOKUP XML SUPPLIER BY TAX CODE", supplierError);
    } else if (supplier?.id) {
      invoice.header.id_customer = supplier.id;
      invoice.header.supplier_name_internal = supplier.name || null;
    }
  }

  if (!tax) return invoice;

  const { data, error } = await db
    .from("product_supplier_map")
    .select("supplier_product_name,normalized_name,id_product")
    .eq("supplier_tax_code", tax);

  if (error) throw error;

  const maps = new Map(
    (data || []).map(m => [
      normalizeSupplierName(m.normalized_name || m.supplier_product_name),
      m
    ])
  );

  for (const row of invoice.items) {
    const key = normalizeSupplierName(row._supplierProductName);
    const mapped = maps.get(key);

    if (mapped?.id_product) {
      row.id_product = mapped.id_product;
      row._mapped = true;

      // Display/save KEBO's internal product name, not supplier's wording.
      const product = await getInternalProduct(mapped.id_product);

      if (product) {
        row.id_product = product.id;
        
        row.name = product.name || row.name || "";

        row.product_code =
          product.code || row.product_code || "";
          
        row.dvtGoc =
          product.dvtGoc || "";

        const dinhluong =
          product.dinhluong == null ||
          product.dinhluong === ""
            ? 1
            : Number(product.dinhluong);
            
        row.dinhluong = dinhluong;
        row.line = dinhluong;

        // Mặc định sử dụng đơn vị gốc
        row.id_unit = "";
        row.unit_name = row.dvtGoc;
        row.ratio = 1;
      }
    } else {
      row.id_product = null;
      row._mapped = false;
    }
  }

  return invoice;
}

/*
 * Upsert without relying on a unique constraint being present in the table.
 * If duplicate historical rows exist, update the first match and keep the map usable.
 */
export async function saveSupplierProductMapping({
  supplierTaxCode,
  supplierProductName,
  idProduct,
  note = null
}) {
  const tax = cleanTax(supplierTaxCode);
  const raw = String(supplierProductName || "").trim();

  if (!tax || !raw || !idProduct) {
    throw new Error("Thiếu MST nhà cung cấp, tên hàng hoặc MASP nội bộ.");
  }

  const normalized = normalizeSupplierName(raw);
  const values = {
    supplier_tax_code: tax,
    supplier_product_name: raw,
    normalized_name: normalized,
    id_product: idProduct,
    note,
    updated_at: new Date().toISOString()
  };

  const { data: found, error: findError } = await db
    .from("product_supplier_map")
    .select("id")
    .eq("supplier_tax_code", tax)
    .eq("normalized_name", normalized)
    .limit(1);

  if (findError) throw findError;

  if (found?.length) {
    const { error } = await db
      .from("product_supplier_map")
      .update(values)
      .eq("id", found[0].id);
    if (error) throw error;
    return;
  }

  const { error } = await db
    .from("product_supplier_map")
    .insert([values]);
  if (error) throw error;
}
