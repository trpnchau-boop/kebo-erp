export function createSection(
  type = "normal"
){

  return {

    id:crypto.randomUUID(),

    name:
      type === "header"
        ? "Header"
        : type === "body"
        ? "Body"
        : type === "footer"
        ? "Footer"
        : "Section",

    type,

    x:20,
    y:40,

    width:764,

    minHeight:120,
    height:120,

    autoHeight:true,

    blocks:[]
  }
}
