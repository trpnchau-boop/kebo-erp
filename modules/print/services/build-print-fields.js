//services/build-print-fields.js//

/* =========================================================
BUILD PRINT FIELDS
========================================================= */

export function buildPrintFields(
  schema,
  schemaKey = ""
){

  if(!schema){
    return []
  }

  /* =======================================================
  FORM FIELDS
  ======================================================= */

  const rawFields =

    schema.form?.fields ||

    schema.fields ||

    {}

const formFields =

  Array.isArray(rawFields)

    ? rawFields.map(field=>({

        ...field,

        key:
          `${schemaKey}.${field.key}`,

        originalKey:
          field.key
      }))

    : Object.entries(rawFields)

        .map(([key,field])=>({

          ...field,

          key:
            `${schemaKey}.${key}`,

          originalKey:
            key
        }))

  /* =======================================================
  TABLE COLUMNS
  ======================================================= */

  const rawColumns =

    schema.table?.columns ||

    []

  const tableColumns =

    rawColumns.map(column=>{

      return {

        ...column
      }
    })

  /* =======================================================
  FORM PRINT FIELDS
  ======================================================= */

  const formPrintFields =

    formFields

      .filter(field=>{

        return (

          field.print?.show
        )
      })

      .map(field=>{

        return {

          ...field,

          source:"form",

          blockType:

            field.print?.block ||

            "text"
        }
      })

  /* =======================================================
  TABLE PRINT FIELDS
  ======================================================= */

  const tablePrintFields =

    tableColumns

      .filter(column=>{

        return (

          column.showInList ||

          column.print?.show
        )
      })

      .map(column=>{

        return {

          ...column,

          source:"table",

          blockType:"table-column"
        }
      })

  /* =======================================================
  RETURN
  ======================================================= */

  return [

    ...formPrintFields,

    ...(tablePrintFields.length
      ? [{
        type:"divider",
        label:"Chi tiết hàng hóa"
        }]
    : []),

    ...tablePrintFields
  ]
}

