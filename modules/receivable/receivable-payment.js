import { db } from "/js/supabase.js"

function today(){
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}

async function generatePaymentCode(day){
  const key = `PT${String(day || today()).replaceAll("-","")}`

  const { data, error } = await db
    .from("payment")
    .select("code")
    .like("code", `${key}-%`)
    .order("code", { ascending:false })
    .limit(1)

  if(error){
    throw error
  }

  let next = 1

  const last = data?.[0]?.code || ""
  const match = last.match(/-(\d+)$/)

  if(match){
    next = Number(match[1]) + 1
  }

  return `${key}-${String(next).padStart(4,"0")}`
}

export async function createReceipt({
  day,
  idCustomer,
  idEmployee,
  amount,
  note,
  allocations
}){
  const {
    data: {
      session
    }
  } = await db.auth.getSession()

  console.log(
    "RECEIPT AUTH:",
    {
      role: session?.user?.role,
      userId: session?.user?.id,
      email: session?.user?.email,
      hasAccessToken: !!session?.access_token
    }
  )
  const total = Number(amount || 0)

  if(!idCustomer){
    throw new Error("Thiếu khách hàng")
  }

  if(!(total > 0)){
    throw new Error("Số tiền thu phải lớn hơn 0")
  }

  if(!Array.isArray(allocations) || !allocations.length){
    throw new Error("Phải có ít nhất một khoản phân bổ")
  }

  const normalized = allocations
    .map(x=>({
      document_id: Number(x.document_id),
      amount: Number(x.amount || 0)
    }))
    .filter(x=>x.document_id && x.amount > 0)

  const allocationTotal = normalized.reduce(
    (sum,x)=>sum+x.amount,
    0
  )

  if(Math.abs(allocationTotal-total) > 0.005){
    throw new Error("Tổng phân bổ phải bằng số tiền thu")
  }

  const documentIds = normalized.map(x=>x.document_id)

  if(new Set(documentIds).size !== documentIds.length){
    throw new Error("Không được phân bổ trùng chứng từ")
  }

  const { data: documents, error: docError } = await db
    .from("document")
    .select("id,code,type,status,id_customer,tongthanhtoan")
    .in("id", documentIds)

  if(docError) throw docError

  const byId = Object.fromEntries(
    (documents || []).map(x=>[x.id,x])
  )

  for(const item of normalized){
    const doc = byId[item.document_id]

    if(!doc){
      throw new Error(`Không tìm thấy chứng từ ${item.document_id}`)
    }

    if(doc.type !== "SALE"){
      throw new Error(`Chứng từ ${doc.code} không phải bán hàng`)
    }

    if(doc.status !== "posted"){
      throw new Error(`Chứng từ ${doc.code} chưa ghi sổ`)
    }

    if(Number(doc.id_customer) !== Number(idCustomer)){
      throw new Error(`Khách hàng của ${doc.code} không khớp`)
    }
  }

  const { data: oldAllocations, error: oldError } = await db
    .from("payment_allocation")
    .select("document_id,amount,payment:payment_id(type,status)")
    .in("document_id", documentIds)

  if(oldError) throw oldError

  const alreadyPaid = {}

  for(const row of oldAllocations || []){
    const payment = row.payment
    if(payment?.type !== "RECEIPT" || payment?.status !== "posted") continue

    alreadyPaid[row.document_id] =
      Number(alreadyPaid[row.document_id] || 0) + Number(row.amount || 0)
  }

  for(const item of normalized){
    const doc = byId[item.document_id]
    const due = Math.max(
      Number(doc.tongthanhtoan || 0) - Number(alreadyPaid[item.document_id] || 0),
      0
    )

    if(item.amount > due + 0.005){
      throw new Error(`Phân bổ vượt công nợ ${doc.code}`)
    }
  }

  const paymentCode = await generatePaymentCode(day)

  const { data: payment, error: paymentError } = await db
    .from("payment")
    .insert([{
      code: paymentCode,
      day: day || today(),
      type: "RECEIPT",
      id_customer: idCustomer,
      id_employee: idEmployee || null,
      amount: total,
      note: note || null,
      status: "posted"
    }])
    .select()
    .single()

  if(paymentError) throw paymentError

  try{
    const rows = normalized.map(item=>({
      payment_id: payment.id,
      document_id: item.document_id,
      amount: item.amount
    }))

    const { error: allocationError } = await db
      .from("payment_allocation")
      .insert(rows)

    if(allocationError){
      throw allocationError
    }

    // =====================================
    // CẬP NHẬT ĐÃ THANH TOÁN / CÒN NỢ
    // =====================================

    for(const item of normalized){

      const { data: allocations, error } = await db
        .from("payment_allocation")
        .select(`
          amount,
          payment:payment_id(type,status)
        `)
        .eq("document_id", item.document_id)

      if(error) throw error

      const tien_tt = (allocations || [])
        .filter(x =>
          x.payment?.type === "RECEIPT" &&
          x.payment?.status === "posted"
        )
        .reduce(
          (sum, x) => sum + Number(x.amount || 0),
          0
        )

      const { error: updateError } = await db
        .from("document")
        .update({
          tien_tt
        })
        .eq("id", item.document_id)

      if(updateError) throw updateError
    }

  }catch(error){
    await db
      .from("payment")
      .delete()
      .eq("id", payment.id)

    throw error
  }

  return payment
}
