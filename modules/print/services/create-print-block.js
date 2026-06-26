//services/create-print-block.js//

/* =========================================================
CREATE PRINT BLOCK
========================================================= */

export function createPrintBlock(

  field,

  options = {}

){

  if(!field){
    return null
  }

  const {

    x = 40,
    y = 40,

    section = "header"

  } = options

  /* =======================================================
  SIZE
  ======================================================= */

  const width =

    field.print?.width ||

    field.width ||

    220

  const height =

    field.print?.height ||

    32

  /* =======================================================
  BLOCK TYPE
  ======================================================= */

  let type = "text"

  if(

    field.blockType ===
    "table-column"

  ){

    type = "table-column"
  }

  if(
    field.type === "textarea"
  ){

    type = "textarea"
  }

  /* =======================================================
  RETURN
  ======================================================= */

  return {

    id:
      crypto.randomUUID(),

    type,

    x,
    y,

    width,
    height,

    props:{

      /* =====================================
      FIELD
      ====================================== */

      fieldKey:
        field.key,

      fieldLabel:
        field.label || "",

      source:
        field.source || "form",

      section,

      /* =====================================
      TEXT
      ====================================== */

      text:
        field.label || "",

      bind:
        field.originalKey || field.key,

      showLabel:true,  

      /* =====================================
      TABLE
      ====================================== */

      columnKey:
        field.key,

      /* =====================================
      DISPLAY
      ====================================== */

      required:
        field.required || false,

      readonly:
        field.readonly || false
    }
  }
}

