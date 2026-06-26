//document-payload.js//

/* =========================================================
BUILD PAYLOAD
========================================================= */

export function buildDocumentPayload({
  schema,
  header,
  items
}){

  const headerFields =
    flattenFields(
      schema.form?.fields || []
    )

  return {

    header:

      extractFields(
        headerFields,
        header
      ),

    items:

      (items || []).map(
        row=>

          extractFields(
            schema.table?.columns || [],
            row
          )
      )

  }

}

/* =========================================================
EXTRACT FIELDS
========================================================= */

export function extractFields(
  fields = [],
  row = {}
){

  const data = {}

  fields.forEach(field=>{

    /* ===============================================
    SKIP
    =============================================== */

    if(
      field.persist === false
    ){
      return
    }

    if(
      !field.key
    ){
      return
    }

    if(
      field.type === "group"
    ){
      return
    }

    /* ===============================================
    VALUE
    =============================================== */

    let value =
      row[field.key]

    /* ===============================================
    EMPTY STRING
    =============================================== */

    if(
      value === ""
      ||
      value === undefined
    ){
      value = null
    }

    /* ===============================================
    NULLABLE NUMBER
    =============================================== */

    if(
      field.nullable
      &&
      value !== null
    ){
      const numberValue =
        Number(value)

      value =
        Number.isNaN(numberValue)
          ? null
          : numberValue
    }

    /* ===============================================
    SAVE
    =============================================== */

    data[field.key] =
      value

  })

  return data

}

/* =========================================================
FLATTEN FIELDS
========================================================= */

function flattenFields(
  fields = []
){

  const result = []

  fields.forEach(field=>{

    if(
      field.type === "group"
      &&
      Array.isArray(field.fields)
    ){
      result.push(
        ...flattenFields(
          field.fields
        )
      )
      return
    }

    result.push(field)

  })

  return result

}