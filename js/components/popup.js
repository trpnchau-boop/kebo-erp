/* =========================
POPUP
========================= */

function createPopup({

  title = "",

  message = "",

  okText = "OK",

  cancelText = "Hủy",

  showCancel = true,

  checkbox = "",

  storageKey = "",

  days = 30

}){

  let closed = false

  return new Promise(resolve=>{

    const overlay =
      document.createElement("div")

    overlay.className =
      "popup-overlay"

    overlay.innerHTML = `

      <div class="popup">

        <div class="popup-header">

          <div class="popup-title">
            ${title}
          </div>

        </div>

        <div class="popup-body">

          <div class="popup-message">
            ${message.trim()}
          </div>

          ${
            checkbox
            ?
            `
            <label class="popup-check">

              <input
                type="checkbox"
              >

              <span>
                ${checkbox}
              </span>

            </label>
            `
            :
            ""
          }

        </div>

        <div class="popup-footer">

          ${
            showCancel
            ?
            `
            <button
              class="
                popup-btn
                popup-btn-cancel
              "
            >
              ${cancelText}
            </button>
            `
            :
            ""
          }

          <button
            class="
              popup-btn
              popup-btn-ok
            "
          >
            ${okText}
          </button>

        </div>

      </div>

    `

    document.body.appendChild(
      overlay
    )

    const popup =
      overlay.querySelector(
        ".popup"
      )

    const okBtn =
      overlay.querySelector(
        ".popup-btn-ok"
      )

    requestAnimationFrame(()=>{

      okBtn.focus()

    })

    const cancelBtn =
      overlay.querySelector(
        ".popup-btn-cancel"
      )

    const check =
      overlay.querySelector(
        ".popup-check input"
      )

    function close(
      value
    ){

      if(closed){
        return
      }

      closed = true

      if(

        value

        &&

        check?.checked

        &&

        storageKey

      ){

        const until =

          Date.now()

          +

          days

          *

          24

          *

          60

          *

          60

          *

          1000

        localStorage.setItem(

          storageKey,

          until

        )

      }

      document.removeEventListener(

        "keydown",

        onKey

      )

      overlay.style.opacity = 0

      popup.style.transform =
        "scale(.96)"

      setTimeout(()=>{

        overlay.remove()

        resolve(value)

      },150)

    }

    function onKey(e){

      if(
        e.key === "Escape"
      ){

        close(false)

      }

      if(e.key === "Enter"){

        close(true)

  }

    }

    document.addEventListener(

      "keydown",

      onKey

    )

    okBtn.onclick = ()=>{

      close(true)

    }

    cancelBtn?.addEventListener(

      "click",

      ()=>close(false)

    )

    overlay.onclick = e=>{

      if(
        e.target === overlay
      ){

        close(false)

      }

    }

    popup.onclick = e=>{

      e.stopPropagation()

    }

  })

}

/* =========================
API
========================= */

export async function alertPopup({

  title = "Thông báo",

  message = "",

  okText = "OK"

}){

  return await createPopup({

    title,

    message,

    okText,

    showCancel:false

  })

}

export async function confirmPopup({

  title = "Xác nhận",

  message = "",

  okText = "OK",

  cancelText = "Hủy",

  showCancel = true,

  checkbox = "",

  storageKey = "",

  days = 30

}){

  if(storageKey){

    const until =

      Number(

        localStorage.getItem(
          storageKey
        )

      ) || 0

    if(Date.now() < until){

      return true

    }

  }

  return await createPopup({

    title,

    message,

    okText,

    cancelText,

    showCancel,

    checkbox,

    storageKey,

    days

  })

}

/* =========================
SHARE WARNING
========================= */

export async function showShareWarning(){

  return await confirmPopup({

    title:
      "Lưu ý !",

    message:
`Ứng dụng Zalo đôi khi báo gửi thất bại dù phần lớn ảnh đã được gửi thành công.

Nếu gặp thông báo lỗi, hãy kiểm tra cuộc trò chuyện vì thường chỉ thiếu ảnh cuối.`,

    okText:
      "Tiếp tục",

    checkbox:
      "Không nhắc lại",

    storageKey:
      "share-warning",

    days:30,

    showCancel:false

  })

}