export function renderCatalogImage(
  imageUrl,
  ratio = 0.3
){

  return `

    <div
      style="
        position:relative;
        overflow:hidden;
      "
    >

      <img
        src="${
          imageUrl || "/images/no-image.png"
        }"
        crossorigin="anonymous"
        style="
          width:100%;
          height:auto;
          display:block;
        "
      >

      <img
        src="/images/logo.webp"
        alt=""
        style="
          position:absolute;

          right:2%;
          bottom:2%;

          width:${ratio * 100}%;
          height:auto;

          pointer-events:none;
          user-select:none;
        "
      >

    </div>

  `

}