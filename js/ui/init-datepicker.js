export function createDatepicker(
  target,
  selector = null,
  onSelect = null,
  options = {}
){
  const input = selector
    ? target.querySelector(selector)
    : target

  if(!input || input._airdatepicker){
    return
  }

  const { side = "left" } = options

  const viLocale = {
    days:["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"],
    daysShort:["CN","T2","T3","T4","T5","T6","T7"],
    daysMin:["CN","T2","T3","T4","T5","T6","T7"],

    months:[
      "Tháng 1","Tháng 2","Tháng 3","Tháng 4",
      "Tháng 5","Tháng 6","Tháng 7","Tháng 8",
      "Tháng 9","Tháng 10","Tháng 11","Tháng 12"
    ],

    monthsShort:[
      "T1","T2","T3","T4","T5","T6",
      "T7","T8","T9","T10","T11","T12"
    ],

    today:"Hôm nay",
    clear:"Xóa"
  }

  return new AirDatepicker(input,{
    locale: viLocale,
    dateFormat: "yyyy-MM-dd",
    selectedDates: input.value ? [input.value] : [],

    /* QUAN TRỌNG: dùng built-in position string */
    position: side === "right"
      ? "bottom right"
      : "bottom left",

    offset: 8,

    onSelect({ formattedDate }){
      input.dispatchEvent(
        new Event("change",{ bubbles:true })
      )

      onSelect?.({ formattedDate })
    },

    buttons:[
      {
        content:"Hôm nay",
        onClick(dp){
          dp.selectDate(new Date())
        }
      },
      {
        content:"Xóa",
        onClick(dp){
          dp.clear()
        }
      }
    ]
  })
}

export function createMonthpicker(
  target,
 selector = null,
  onSelect = null
){

  const input = selector
    ? target.querySelector(selector)
    : target

  if(
    !input ||
    input._airdatepicker
  ){
    return
  }

  const viLocale = {
    days:["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"],
    daysShort:["CN","T2","T3","T4","T5","T6","T7"],
    daysMin:["CN","T2","T3","T4","T5","T6","T7"],

    months:[
      "Tháng 1","Tháng 2","Tháng 3","Tháng 4",
      "Tháng 5","Tháng 6","Tháng 7","Tháng 8",
      "Tháng 9","Tháng 10","Tháng 11","Tháng 12"
    ],

    monthsShort:[
      "T1","T2","T3","T4","T5","T6",
      "T7","T8","T9","T10","T11","T12"
    ],

    today:"Tháng này",
    clear:"Xóa"
  }

  return new AirDatepicker(
    input,
    {
      locale: viLocale,
      view: "months",
      minView: "months",
      dateFormat: "yyyy-MM",
      autoClose: true,

      selectedDates:
        input.value
          ? [input.value + "-01"]
          : [],

      onSelect({date, formattedDate}){

        if(date){
          const y = date.getFullYear()
          const m = String(
            date.getMonth() + 1
          ).padStart(2,"0")

          input.value = `${y}-${m}`
        }else{
          input.value = ""
        }

        input.dispatchEvent(
          new Event("change",{
            bubbles:true
          })
        )

        onSelect?.({
          formattedDate: input.value
        })
      },

      buttons: [
        {
          content: "Tháng này",
          onClick(dp){
            dp.selectDate(new Date())
          }
        },
        {
          content: "Xóa",
          onClick(dp){
            dp.clear()

            input.value = ""

            input.dispatchEvent(
              new Event("change",{
                bubbles:true
              })
            )
          }
        }
      ]
    }
  )
}