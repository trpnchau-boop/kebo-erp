export function bindDropdownMenus(
  root = document
){

  if(window.__dropdownBound)
    return

  window.__dropdownBound = true

  document.addEventListener(
    "click",
    e=>{

      const trigger =

        e.target.closest(
          ".dropdown-trigger"
        )

      if(trigger){

        const menu =

          trigger.closest(
            ".dropdown-menu"
          )

        document

          .querySelectorAll(
            ".dropdown-menu.open"
          )

          .forEach(el=>{

            if(el !== menu){

              el.classList.remove(
                "open"
              )

            }

          })

        menu?.classList.toggle(
          "open"
        )

        return
      }

      document

        .querySelectorAll(
          ".dropdown-menu.open"
        )

        .forEach(el=>{

          el.classList.remove(
            "open"
          )

        })

    }
  )

}