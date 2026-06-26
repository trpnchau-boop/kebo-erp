export function renderLineBlock(block){

  const thickness =

    block.props?.thickness || 2

  const color =

    block.props?.color || "#000000"

  const style =

    block.props?.style || "solid"

  return `

    <div

      style="
        width:100%;
        height:0;

        border-top:
          ${thickness}px
          ${style}
          ${color};
      "

    ></div>

  `
}