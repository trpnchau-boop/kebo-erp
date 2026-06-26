export function getDocType(
  schema,
  state
){
  return (
    state?.docType ||
    state?.header?.type ||
    schema?.docType?.default ||
    schema?.meta?.code ||
    "SALE"
  )
}