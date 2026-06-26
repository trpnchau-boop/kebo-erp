export function renderImageBlock(block){

  const src =
    block.props?.src

  if(!src){

    return `
      <div
        style="
          width:100%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:#eee;
          border:1px dashed #bbb;
        "
      >
        Image
      </div>
    `
  }

  return `

    <img

      src="${src}"

      draggable="false"

      style="
        width:100%;
        height:100%;
        object-fit:contain;
        pointer-events:none;
        user-select:none;
      "
    >

  `
}