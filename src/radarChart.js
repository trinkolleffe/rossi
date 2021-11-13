import * as d3 from "d3"

import { firstPosFill } from "./utils"
import { COLOURS, RACE_SYMBOLS } from "./const"

const ChartWidth = 640
const ChartHeight = 640

const innerRadius = 50
const outerRadius = ChartHeight / 2 - 60

// scales
let x
let y
let area

// selections
let wrapper
let centerPoint
let path
let dataArea
let areasWrapper
let axisWrapper
let axisLabelsWrapper

// options
let transitionOptions
const transitionDuration = 750
const pointOffsetOptions = { additionalOffset: 0 }

function dataDotRadius(datum) {
  return 16
}

function dataDotFill(datum) {
  switch (datum.race_position) {
    case 1:
      return COLOURS.podium.gold
    case 2:
      return COLOURS.podium.silver
    case 3:
      return COLOURS.podium.bronze
    default:
      return "white"
  }
}

function dataDotStroke(datum) {
  const pos = datum.race_position
  if (typeof pos !== "number") return "black"

  return "black"
}

function textFill(datum) {
  if (typeof datum.race_position !== "number") return "black"

  switch (datum.race_position) {
    case 1:
      return "black"
    case 2:
      return "white"
    case 3:
      return "white"
    default:
      return "black"
  }
}

function textContent(d) {
  if (typeof d.race_position !== "number") {
    return RACE_SYMBOLS[d.race_position]
  }
  return d.race_position
}

function textSize(d) {
  if (typeof d.race_position !== "number") {
    return "28px"
  }
  return "28px"
}

function getPointCoordinate(
  coord,
  datum,
  options = {
    additionalOffset: 0
  }
) {
  return () => {
    const { additionalOffset } = options

    const xCoord = coord === "x"

    const fn = xCoord ? Math.sin : Math.cos
    const multiplier = xCoord ? 1 : -1

    const noPosition = typeof datum.race_position !== "number"

    const offset = noPosition
      ? innerRadius
      : y(datum.race_position) + additionalOffset

    return multiplier * offset * fn(x(datum.track.order))
  }
}

const getXCoord = (d) => getPointCoordinate("x", d, pointOffsetOptions)(d)
const getYCoord = (d) => getPointCoordinate("y", d, pointOffsetOptions)(d)

function computeScales(dataset) {
  x = d3.scaleLinear(
    [1, d3.max(dataset, (d) => d.track.order) + 1],
    [0, 2 * Math.PI]
  )

  y = d3.scaleLinear([1, 22], [outerRadius / 1.2, innerRadius])

  area = d3
    .areaRadial()
    .curve(d3.curveLinearClosed)
    //.defined((d) => typeof d.race_position === "number")
    .angle((d) => x(d.track.order))
    .innerRadius(innerRadius)
    .outerRadius((d) => {
      const nonPosition = typeof d.race_position !== "number"

      if (nonPosition) return innerRadius
      return y(d.race_position)
    })(dataset)

  return { x, y, area }
}

function makeAxis(index, numElements, fn) {
  return outerRadius * fn(((Math.PI * 2) / numElements) * index - Math.PI / 2)
}

export function makeRadarChart(selector, dataset) {
  computeScales(dataset.races)

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", ChartWidth)
    //.attr("height", ChartHeight)
    .attr("viewBox", [0, 0, ChartWidth, ChartHeight])
    .attr("preserveAspectRatio", "xMidYMid meet")

  wrapper = svg

  transitionOptions = wrapper
    .transition()
    .duration(transitionDuration)
    .ease(d3.easeExpOut)

  centerPoint = wrapper
    .append("g")
    .attr("class", "chart_area")
    .attr("transform", `translate(${ChartWidth / 2},${ChartHeight / 2})`)

  path = centerPoint.append("g").attr("class", "path_area").append("path")

  centerPoint
    .append("circle")
    .attr("class", "center_badge")
    .attr("fill", "#ffffff")
    .attr("r", innerRadius)

  // layer 0
  areasWrapper = centerPoint.append("g").attr("class", "axis_grid")

  // layer 1
  axisWrapper = centerPoint.append("g").attr("class", "races_axes")

  // layer 2
  const championshipBadge = centerPoint
    .append("g")
    .attr("class", "championship_position")
  championshipBadge
    .append("circle")
    .attr("class", "championship_position_badge")
  championshipBadge.append("text").attr("class", "championship_position_text")

  // layer 3
  dataArea = centerPoint.append("g").attr("class", "data_area")

  // layer 4
  axisLabelsWrapper = centerPoint.append("g").attr("class", "axis_labels")

  areasWrapper
    .selectAll(".levels")
    .data(d3.range(1, 22))
    .join("circle")
    .attr("class", "grid_circle")
    .attr("r", (d) => y(d))
    .style("fill", "transparent")
    .style("stroke", "#93959860")

  updateRadarChart(dataset)
}

export function updateRadarChart(dataset) {
  const { races } = dataset

  computeScales(races)
  transitionOptions = wrapper
    .transition()
    .duration(transitionDuration)
    .ease(d3.easeExpOut)

  function seasonPositionText(d) {
    return !!d.position ? `${d.position}\u00B0` : "\u2013\u00B0"
  }

  centerPoint
    .selectAll(".championship_position_text")
    .datum(dataset)
    .join("text")
    .attr("id", "championship_position_indicator")
    .attr("font-size", "42px")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .attr("fill", "black")
    .text(seasonPositionText)

  centerPoint
    .selectAll(".championship_position_badge")
    .datum(dataset)
    .join("circle")
    .attr("id", "championship_position_indicator_bg")
    .attr("r", 40)
    .attr("fill", firstPosFill(dataset))

  path
    .datum([races])
    .join("path")
    .transition(transitionOptions)
    .attr("d", area)
    .attr("opacity", 1)
    .attr("fill", firstPosFill(dataset))

  dataArea
    .selectAll("circle")
    .data(races, (d) => d.track.order)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("opacity", 0)
          .attr("r", dataDotRadius)
          .attr("fill", dataDotFill)
          .attr("stroke", dataDotStroke)
          .attr("stroke-width", "0.5px")
          .attr("cx", getXCoord)
          .attr("cy", getYCoord)
          .call((enter) =>
            enter.transition(transitionOptions).attr("opacity", 1)
          ),
      (update) =>
        update
          .attr("r", dataDotRadius)
          .attr("opacity", 1)
          .attr("fill", dataDotFill)
          .attr("stroke", dataDotStroke)
          .call((update) =>
            update
              .transition(transitionOptions)
              .attr("fill", dataDotFill)
              .attr("cx", getXCoord)
              .attr("cy", getYCoord)
          ),
      (exit) =>
        exit
          .attr("opacity", 1)
          .call((exit) =>
            exit
              .transition(transitionOptions)
              .attr("opacity", 0)
              .attr("r", 0)
              .remove()
          )
    )

  dataArea
    .selectAll("text")
    .data(races, (d) => d.track.order)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("opacity", 0)
          .attr("fill", textFill)
          .attr("font-size", textSize)
          .attr("x", getXCoord)
          .attr("y", getYCoord)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "central")
          .text(textContent)
          .call((enter) =>
            enter
              .transition(transitionOptions)
              .attr("opacity", 1)
              .attr("y", getYCoord)
          ),
      (update) =>
        update
          .text(textContent)
          .attr("opacity", 1)
          .call((update) =>
            update
              .transition(transitionOptions)
              .attr("fill", textFill)
              .attr("font-size", textSize)
              .attr("x", getXCoord)
              .attr("y", getYCoord)
          ),
      (exit) =>
        exit
          .attr("opacity", 1)
          .call((exit) =>
            exit.transition(transitionOptions).attr("opacity", 0).remove()
          )
    )

  function axisLabelTextContent(d, i) {
    if (i === 0) return `GP ${d.track.name}`

    return d.track.name
  }

  function axisLabelFontSize(_, i) {
    if (i === 0) return "24px"
    return "18px"
  }

  function axisLabelElevation(_, i) {
    if (i === 0) return "-16px"
  }

  axisLabelsWrapper
    .selectAll("text")
    .data(races, (d) => d.track.order)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("opacity", 0)
          .attr("text-anchor", "middle")
          .attr("font-size", axisLabelFontSize)
          .attr("dy", axisLabelElevation)
          .attr(
            "transform",
            (_, i) =>
              `translate(${makeAxis(
                i,
                dataset.races.length,
                Math.cos
              )},${makeAxis(i, dataset.races.length, Math.sin)})`
          )
          .attr("alignment-baseline", "central")
          .text(axisLabelTextContent)
          .call(
            (enter) => enter.transition(transitionOptions).attr("opacity", 1)
            //.attr("y", (_, i) => makeAxis(i, dataset.races.length, Math.sin))
          ),
      (update) =>
        update.call((update) =>
          update
            .text(axisLabelTextContent)
            .attr("opacity", 1)
            .transition(transitionOptions)
            .attr(
              "transform",
              (_, i) =>
                `translate(${makeAxis(
                  i,
                  dataset.races.length,
                  Math.cos
                )},${makeAxis(i, dataset.races.length, Math.sin)})`
            )
        ),
      (exit) =>
        exit
          .transition(transitionOptions)
          .attr("opacity", 0)
          .call((exit) => exit.remove())
    )

  axisWrapper
    .selectAll("line")
    .data(d3.range(0, dataset.races.length).reverse())
    .join(
      (enter) =>
        enter
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", (_, i) => makeAxis(i, dataset.races.length, Math.cos))
          .attr("y2", (_, i) => makeAxis(i, dataset.races.length, Math.sin))
          .style("stroke", "#93959860"),
      (update) =>
        update
          .attr("x1", 0)
          .attr("y1", 0)
          .call((update) =>
            update
              .transition(transitionOptions)
              .attr("x2", (_, i) => makeAxis(i, dataset.races.length, Math.cos))
              .attr("y2", (_, i) => makeAxis(i, dataset.races.length, Math.sin))
          ),
      (exit) => exit.remove()
    )

  /*   axisWrapper
    .selectAll(".race_axis")
    .data(races, (d) => d.track.symbol)
    .join("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (_, i) => makeAxis(i, dataset.races.length, Math.cos))
    .attr("y2", (_, i) => makeAxis(i, dataset.races.length, Math.sin))
    .style("stroke", "#939598")
 */
}
