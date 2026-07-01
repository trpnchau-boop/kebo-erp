export function createTableSelection({

  thead,
  tbody,

  checkAllSelector = "#check-all",
  rowSelector = ".row-checkbox",

  onChange = () => {}

}){

  const checkAll =
    thead?.querySelector(
      checkAllSelector
    )

  const selected =
    new Set()

  function getRows(){

    return [

      ...tbody.querySelectorAll(
        rowSelector
      )

    ]

  }

  function getRowId(row){

    return String(

      row.value ||

      row.dataset.id ||

      row.getAttribute("value") ||

      ""

    )

  }

  function has(id){

    return selected.has(
      String(id)
    )

  }

  function add(id){

    selected.add(
      String(id)
    )

  }

  function remove(id){

    selected.delete(
      String(id)
    )

  }

  function toggle(id){

    id = String(id)

    if(selected.has(id)){

      selected.delete(id)

    }else{

      selected.add(id)

    }

  }

  function getIds(){

    return [...selected]

  }

  function count(){

    return selected.size

  }

  function sync(){

    const rows =
      getRows()

    rows.forEach(row=>{

      const id =
        getRowId(row)

      row.checked =
        selected.has(id)

    })

    const checked =
      rows.filter(
        row=>row.checked
      )

    if(checkAll){

      checkAll.checked =

        rows.length>0 &&

        rows.length===checked.length

      checkAll.indeterminate =

        checked.length>0 &&

        checked.length<rows.length

    }

    onChange({

      ids:getIds(),

      count:selected.size,

      total:rows.length

    })

  }

  function clear(){

    selected.clear()

    sync()

  }

  function checkAllRows(){

    getRows().forEach(row=>{

      selected.add(
        getRowId(row)
      )

    })

    sync()

  }

  function set(ids=[]){

    selected.clear()

    ids.forEach(id=>{

      selected.add(
        String(id)
      )

    })

    sync()

  }

  checkAll?.addEventListener(

    "change",

    ()=>{

      if(checkAll.checked){

        checkAllRows()

      }else{

        clear()

      }

    }

  )

  tbody.addEventListener(

    "change",

    e=>{

      if(

        !e.target.matches(
          rowSelector
        )

      ) return

      const id =
        getRowId(
          e.target
        )

      if(e.target.checked){

        selected.add(id)

      }else{

        selected.delete(id)

      }

      sync()

    }

  )

  return{

    has,

    add,

    remove,

    toggle,

    getIds,

    count,

    sync,

    clear,

    set,

    checkAll:checkAllRows

  }

}