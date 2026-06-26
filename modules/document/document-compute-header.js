//document-compute-header.js//

export function computeHeader(
  schema,
  state
){

  const h =
    state.header

  h.tongtien =

    state.items.reduce(

      (a,b)=>

        a +

        Number(
          b.thanhtien || 0
        ),

      0

    )

  /* =========================================
  TONG TIEN VON
  ========================================= */

  h.tongtienvon =

    state.items.reduce(

      (a,b)=>

        a +

        Number(
          b.tienvon || 0
        ),

      0

    )

  h.tongthanhtoan =

    h.tongtien

    -

    Number(
      h.chietkhau || 0
    )

    +

    Number(
      h.thue || 0
    )

}