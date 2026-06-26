//document-state.js//

export function createDocState(
  initial = {}
){

  return {

    schema:null,

    docType:"",

    header:{},

    items:[],

    draftRow:{},

    ...initial

  }

}