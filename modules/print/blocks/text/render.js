export function renderTextBlock(block){

  const textAlign =

    block.props?.textAlign ||

    "left"

  const justifyContent =

    textAlign === "center"

      ? "center"

      : textAlign === "right"

        ? "flex-end"

        : "flex-start"

  /* =====================================
  CONTENT
  ===================================== */

  const isField =

    !!block.props?.bind

  let content =

    block.props?.text ||

    "Text"

  if(isField){

    const label =

      block.props?.text ||

      ""

    const bind =
  
      block.props?.bind ||

      ""

    content =

      block.props?.showLabel

        ? `${label}: [${bind}]`

        : `[${bind}]`
  }

  return `

    <div

      style="

        width:100%;
        height:100%;

        font-size:${
          block.props?.fontSize || 14
        }px;

        font-weight:${
          block.props?.bold
            ? "700"
            : "400"
        };

        font-style:${
          block.props?.italic
            ? "italic"
            : "normal"
        };

        text-decoration:${
          block.props?.underline
            ? "underline"
            : "none"
        };

        text-align:${textAlign};

        color:${
          block.props?.color ||
          "#000000"
        };

        background:${
          block.props?.backgroundColor ||
          "transparent"
        };

        display:flex;

        align-items:center;

        justify-content:${justifyContent};

        padding:4px;

        box-sizing:border-box;

        overflow:hidden;

      "

    >

      ${content}

    </div>

  `
}