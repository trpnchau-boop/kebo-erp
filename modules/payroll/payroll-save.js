export function initPayrollSave(ctx){

  ctx.root
  .querySelector("#btn-save")
  ?.addEventListener(

    "click",

    ()=> saveSoft(ctx)

  )

}

function saveSoft(ctx){

  const {

    root,
    monthInput,
    employeeSelect

  } = ctx

  const data = {

    month:
    monthInput.value,

    id_employee:
    employeeSelect.value,

    income:

      [...root.querySelectorAll(
        ".income-formula"
      )]

      .map(
        x => x.value
      ),

    deduct:

      [...root.querySelectorAll(
        ".deduct-formula"
      )]

      .map(
        x => x.value
      ),

    commission:

      root
      .querySelector(
        ".commission-rate"
      )
      ?.value || ""

  }

  const key =

    "payroll_" +

    data.month +

    "_" +

    data.id_employee

  localStorage.setItem(

    key,

    JSON.stringify(
      data
    )

  )

  alert(
    "Đã lưu tạm"
  )

}

export function loadSoft(ctx){

  const {

    root,
    monthInput,
    employeeSelect

  } = ctx

  const key =

    "payroll_" +

    monthInput.value +

    "_" +

    employeeSelect.value

  const raw =

    localStorage.getItem(
      key
    )

  if(
    !raw
  ) return

  const data =

    JSON.parse(
      raw
    )

  /* =====================
     THU NHẬP
  ===================== */

  root
  .querySelectorAll(
    ".income-formula"
  )
  .forEach((inp,i)=>{

    inp.value =

      data.income?.[i]
      ??
      inp.value

    inp.dispatchEvent(

      new Event(
        "input"
      )

    )

  })

  /* =====================
     GIẢM TRỪ
  ===================== */

  root
  .querySelectorAll(
    ".deduct-formula"
  )
  .forEach((inp,i)=>{

    inp.value =

      data.deduct?.[i]
      ??
      inp.value

    inp.dispatchEvent(

      new Event(
        "input"
      )

    )

  })

  /* =====================
     HOA HỒNG
  ===================== */

  const commission =

    root.querySelector(
      ".commission-rate"
    )

  if(

    commission &&
    data.commission

  ){

    commission.value =
    data.commission

    commission.dispatchEvent(

      new Event(
        "change"
      )

    )

  }

}

