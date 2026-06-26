import {
  renderTextBlock
}
from "/modules/print/blocks/text/render.js"

import {
  renderImageBlock
}
from "/modules/print/blocks/image/render.js"

import {
  renderTableBlock
}
from "/modules/print/blocks/table/render.js"

import {
  renderLineBlock
}
from "/modules/print/blocks/line/render.js"

export const BLOCK_REGISTRY = {

  text:{
    render:
      renderTextBlock
  },

  textarea:{
    render:
      renderTextBlock
  },

  image:{
    render:
      renderImageBlock
  },

  table:{
    render:
      renderTableBlock
  },

  line:{
    render:
      renderLineBlock
  }
}