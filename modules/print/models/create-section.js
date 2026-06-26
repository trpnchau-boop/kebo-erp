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

    x:40,
    y:40,

    width:714,

    minHeight:120,
    height:120,

    autoHeight:true,

    blocks:[]
  }
}
