import { db } from "/js/supabase.js"

const DOCUMENT_FIELDS = "id,code,day,type,status,id_customer,tongthanhtoan,note"
const PAYMENT_FIELDS = "id,code,day,type,id_customer,id_employee,amount,note,status"
const ALLOCATION_FIELDS = "id,payment_id,document_id,amount,created_at"

export async function loadEmployees(){
  const { data, error } = await db
    .from("data_employee")
    .select("id,name")
    .order("name")

  if(error){
    console.error("RECEIVABLE EMPLOYEE LOAD", error)
    return []
  }

  return data || []
}

export async function loadReceivableData(){
  const docQuery = db
    .from("document")
    .select(DOCUMENT_FIELDS)
    .eq("type", "SALE")
    .eq("status", "posted")
    .order("day", { ascending: false })
    .order("id", { ascending: false })

  const [docResult, customerResult, paymentResult] = await Promise.all([
    docQuery,

    db
      .from("data_customer")
      .select("id,code,name,phone"),

    db
      .from("payment")
      .select(PAYMENT_FIELDS)
      .eq("type", "RECEIPT")
      .eq("status", "posted")
      .order("day", { ascending: false })
      .order("id", { ascending: false })
  ])

  if(docResult.error) throw docResult.error
  if(customerResult.error) throw customerResult.error
  if(paymentResult.error) throw paymentResult.error

  const payments = paymentResult.data || []

  const allocations =
    await loadAllocationsByPaymentIds(
      payments.map(x => x.id)
    )

  return {
    documents: docResult.data || [],
    customers: customerResult.data || [],
    payments,
    allocations
  }
}

export async function loadCustomerDocuments(customerId){
  const { data, error } = await db
    .from("document")
    .select(DOCUMENT_FIELDS)
    .eq("type", "SALE")
    .eq("status", "posted")
    .eq("id_customer", customerId)
    .order("day", { ascending: false })
    .order("id", { ascending: false })

  if(error){
    console.error("CUSTOMER DOCUMENT LOAD", error)
    throw error
  }

  return data || []
}

export async function loadCustomerPayments(customerId){
  const { data, error } = await db
    .from("payment")
    .select(PAYMENT_FIELDS)
    .eq("id_customer", customerId)
    .eq("type", "RECEIPT")
    .eq("status", "posted")
    .order("day", { ascending: false })
    .order("id", { ascending: false })

  if(error){
    console.error("CUSTOMER PAYMENT LOAD", error)
    throw error
  }

  return data || []
}

export async function loadCustomerAllocations(paymentIds){
  return loadAllocationsByPaymentIds(paymentIds)
}

async function loadAllocationsByPaymentIds(paymentIds){
  if(!paymentIds?.length) return []

  const { data, error } = await db
    .from("payment_allocation")
    .select(ALLOCATION_FIELDS)
    .in("payment_id", paymentIds)

  if(error){
    console.error("RECEIVABLE ALLOCATION LOAD", error)
    throw error
  }

  return data || []
}
export async function loadCustomerDebt(customerId){

  if(!customerId) return 0

  const [
    documents,
    payments
  ] = await Promise.all([
    loadCustomerDocuments(customerId),
    loadCustomerPayments(customerId)
  ])

  const allocations =
    await loadCustomerAllocations(
      payments.map(x => x.id)
    )

  const paymentMap = Object.fromEntries(
    payments.map(x => [
      String(x.id),
      x
    ])
  )

  let debt = 0

  for(const doc of documents){

    const paid = (allocations || [])
      .filter(a =>
        String(a.document_id) === String(doc.id) &&
        paymentMap[String(a.payment_id)]
      )
      .reduce(
        (sum,a) =>
          sum + Number(a.amount || 0),
        0
      )

    debt += Math.max(
      Number(doc.tongthanhtoan || 0) - paid,
      0
    )
  }

  return debt
}