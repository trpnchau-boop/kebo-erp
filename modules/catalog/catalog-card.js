export function renderCatalogImage(imageUrl){

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
        crossorigin="anonymous"
        alt=""
        style="
          position:absolute;
          right:12px;
          bottom:12px;

          width:64px;
          height:auto;

          pointer-events:none;
          user-select:none;
        "
      >

    </div>

  `

}