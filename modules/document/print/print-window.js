// modules/document/print/print-window.js

export function openPrintWindow(html){

  const win =
    window.open(
      "",
      "_blank"
    )

  if(!win){

    alert(
      "Popup blocked"
    )

    return
  }

  win.document.open()

  win.document.write(html)

  win.document.close()

  win.focus()

  setTimeout(()=>{

    win.print()

  },300)
}