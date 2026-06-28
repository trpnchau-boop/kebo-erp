//quote.js

import { state, loadData } from "./quote-state.js"

import {
  buildHeader,
  render
}
from "./quote-render.js"

import {
  bindEvents
}
from "./quote-events.js"

let root

export async function init(
  params={},
  pageRoot
){

  root = pageRoot

  state.root = root

  state.toolbar =
    root.querySelector("#toolbar")

  state.thead =
    root.querySelector("#thead")

  state.tbody =
    root.querySelector("#tbody")

  await loadData()    

  buildHeader()

  bindEvents()

  render()

}