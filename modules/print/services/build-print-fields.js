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
  FLATTEN FORM FIELDS
  ======================================================= */

  function flattenFields(fields){

    const result = []

    fields.forEach(field=>{

      if(
        field.type === "group" &&
        Array.isArray(field.fields)
      ){

        result.push(
          ...flattenFields(field.fields)
        )

        return
      }

      result.push(field)

    })

    return result
  }

  /* =======================================================
  FORM FIELDS
  ======================================================= */

  const rawFields =

    schema.form?.fields ||

    schema.fields ||

    []

  const flatFields =

    Array.isArray(rawFields)

      ? flattenFields(rawFields)

      : Object.entries(rawFields)

          .map(([key,field])=>({

            ...field,

            key,

            originalKey:key

          }))

  const formFields =

    flatFields.map(field=>({

      ...field,

      key:
        `${schemaKey}.${field.key}`,

      originalKey:
        field.originalKey ||
        field.key

    }))

  /* =======================================================
  TABLE COLUMNS
  ======================================================= */

  const rawColumns =

    schema.table?.columns ||

    []

  const tableColumns =

    rawColumns.map(column=>({

      ...column

    }))

  /* =======================================================
  FORM PRINT FIELDS
  ======================================================= */

  const formPrintFields =

    formFields

      .filter(field=>{

        return field.print?.show

      })

      .map(field=>({

        ...field,

        source:"form",

        blockType:

          field.print?.block ||

          "text"

      }))

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

      .map(column=>({

        ...column,

        source:"table",

        blockType:"table-column"

      }))

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