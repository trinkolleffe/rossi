import * as d3 from "d3"
import { firstPosFill } from "./utils"

const maxBubbleWidth = 140
const maxBubbleHeight = 140
const labelPadding = {
  right: 8,
  top: 24
}

let t
let r
let wrapper
let bubbleArea
let labelArea
let captionArea

const transitionDuration = 750

function makeScales(dataset) {
  r = d3.scaleSqrt([1, 400], [1, maxBubbleHeight])
}

export function makePointsBubble(selector, dataset) {
  wrapper = d3
    .select(selector)
    .append("svg")
    .attr("width", maxBubbleWidth)
    .attr("height", maxBubbleHeight)
    .attr("viewBox", [0, 0, maxBubbleWidth, maxBubbleHeight])
    .attr("preserveAspectRatio", "xMidYMid meet")

  t = wrapper.transition().duration(transitionDuration).ease(d3.easeExpOut)

  const g = wrapper.append("g").attr("class", "bubble_area")

  bubbleArea = g.append("circle")
  labelArea = g.append("text")
  captionArea = g.append("text")

  makeScales(dataset)
  updatePointsBubble(dataset)
}

export function updatePointsBubble(dataset) {
  t = wrapper.transition().duration(transitionDuration).ease(d3.easeExpOut)

  bubbleArea
    .datum(dataset, (d) => d.points)
    .join("circle")
    .attr("cx", maxBubbleWidth)
    .attr("cy", 0)
    .transition(t)
    .attr("r", (d) => (d.points ? r(d.points) : 0))
    .attr("fill", firstPosFill(dataset))

  labelArea
    .datum(dataset, (d) => d.points)
    .join("text")
    .attr("font-size", "32px")
    .attr("text-anchor", "end")
    .text((d) => d.points || "–")
    .attr("x", maxBubbleWidth - labelPadding.right)
    .attr("y", 36 + labelPadding.top)

  captionArea
    .datum(dataset, (d) => d.points)
    .join("text")
    .text(`Punti stagione ${dataset.year}`)
    .attr("x", maxBubbleWidth - labelPadding.right)
    .attr("y", labelPadding.top)
    .attr("text-anchor", "end")
}
