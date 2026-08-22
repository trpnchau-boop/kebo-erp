import { getAll } from "/js/crud.js"

export async function getCommissionInfo({

  id_employee,
  ym,
  selectedRate = ""

}) {

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
        is_act: true
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
          ).startsWith(ym)

        )

      })

      .reduce(
        (sum, doc) =>

          sum +
          Number(
            doc.tongthanhtoan || 0
          ),

        0
      )

  /* =========================
  MANUAL RATE
  ========================= */

  const isManualRate =
    selectedRate !== ""
    &&
    selectedRate !== null
    &&
    selectedRate !== undefined

  /* =========================
  MANUAL COMMISSION
  ========================= */

  if (isManualRate) {

    const rate =
      Number(
        selectedRate
      )

    const commission =
      Math.round(
        revenue *
        rate /
        100
      )

    return {

      revenue,

      rate,

      commission,

      rateRow: null,

      rateId: null,

      dinhmuc_min: 0,

      dinhmuc_max: 0,

      isManualRate: true

    }

  }

  /* =========================
  TIERED COMMISSION
  ========================= */

  const sortedRates =
    [...rates]
      .sort(
        (a, b) =>
          Number(
            a.dinhmuc_min || 0
          )
          -
          Number(
            b.dinhmuc_min || 0
          )
      )

  let remaining =
    revenue

  let commission =
    0

  let rateRow =
    null

  /* =========================
  CALCULATE EACH TIER
  ========================= */

  for (const row of sortedRates) {

    const min =
      Number(
        row.dinhmuc_min || 0
      )

    const max =
      row.dinhmuc_max === null
      ||
      row.dinhmuc_max === undefined
      ||
      row.dinhmuc_max === ""
        ? Infinity
        : Number(
            row.dinhmuc_max
          )

    if (remaining <= 0)
      break

    if (revenue <= min)
      continue

    const tierRevenue =
      Math.min(
        revenue,
        max
      )
      -
      min

    if (tierRevenue <= 0)
      continue

    const tierRate =
      Number(
        row.rate || 0
      )

    commission +=
      tierRevenue *
      tierRate /
      100

    /* =========================
    CURRENT TIER
    ========================= */

    if (
      revenue > min
      &&
      revenue <= max
    ) {

      rateRow =
        row

    }

  }

  commission =
    Math.round(
      commission
    )

  /* =========================
  CURRENT RATE
  ========================= */

  const rate =
    Number(
      rateRow?.rate || 0
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
      rateRow?.id ||
      null,

    dinhmuc_min:
      Number(
        rateRow?.dinhmuc_min || 0
      ),

    dinhmuc_max:
      Number(
        rateRow?.dinhmuc_max || 0
      ),

    isManualRate: false

  }

}

export function calculateTieredCommission(
  revenue,
  rates
){

  let commission = 0

  const sortedRates =
    [...rates]
      .sort(
        (a, b) =>
          Number(a.dinhmuc_min || 0)
          -
          Number(b.dinhmuc_min || 0)
      )

  for(const row of sortedRates){

    const min =
      Number(
        row.dinhmuc_min || 0
      )

    const max =
      row.dinhmuc_max === null ||
      row.dinhmuc_max === undefined ||
      row.dinhmuc_max === ""
        ? Infinity
        : Number(
            row.dinhmuc_max
          )

    if(revenue <= min)
      continue

    const amount =
      Math.min(
        revenue,
        max
      ) - min

    if(amount <= 0)
      continue

    commission +=
      amount *
      Number(row.rate || 0) /
      100

  }

  return Math.round(
    commission
  )

}