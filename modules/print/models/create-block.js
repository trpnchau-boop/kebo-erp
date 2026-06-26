export function createBlock(type){

  return {

    id:crypto.randomUUID(),

    type,

    x:0,
    y:0,

    width:120,
    height:40,

    rotate:0,

    visible:true,

    props:{},

    style:{}
  }
}