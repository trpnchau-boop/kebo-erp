import { getAll } from "/js/crud.js"

export async function getCommissionInfo({

  id_employee,
  ym

}){

  /* =========================
  DOCUMENTS
  ========================= */

  const docs =

    await getAll(
      "document"
    )

  /* =========================
  KPI RATE
  ========================= */

  const rates =

    await getAll(
      "set_ns_rate",
      {
        is_act:true
      }
    )

  /* =========================
  REVENUE
  ========================= */

  const revenue =

    docs

    .filter(doc => {

      return (

        doc.type === "SALE"

        &&

        Number(
          doc.id_employee
        ) ===
        Number(id_employee)

        &&

        String(
          doc.day || ""
        )
        .startsWith(ym)

      )

    })

    .reduce(

      (sum,doc) =>

        sum +

        Number(
          doc.tongthanhtoan || 0
        ),

      0

    )

  /* =========================
  RATE ROW
  ========================= */

  const rateRow =
    rates.find(r =>

      revenue >=

      Number(
        r.dinhmuc_min || 0
      )

      &&

      (
        !r.dinhmuc_max ||

      revenue <=

      Number( r.dinhmuc_max || 0)

    )
)
    ||

    null

  /* =========================
  RATE
  ========================= */

  const rate =

    Number(
      rateRow?.rate || 0
    )

  /* =========================
  COMMISSION
  ========================= */

  const commission =

    Math.round(

      revenue *

      rate /

      100

    )

  /* =========================
  RESULT
  ========================= */

  return {

    revenue,

    rate,

    commission,

    rateRow,

    rateId:
      rateRow?.id || null,

    dinhmuc_min:
      Number(
        rateRow?.dinhmuc_min || 0
      ),

    dinhmuc_max:
      Number(
        rateRow?.dinhmuc_max || 0
      )  

  }

}

