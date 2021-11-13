import * as d3 from "d3"

const barHeight = 16

const chartWidth = 320
const chartHeight = barHeight

let x
let w
let dataArea

function makeScale(dataset) {
  const { suit } = dataset

  const total = d3.sum(suit, (d) => d.percentage)

  x = d3.scaleLinear().domain([0, total]).range([0, chartWidth])
  w = d3.scaleLinear().domain([0, 100]).range([0, chartWidth])
}

export function makeBarChart(selector, dataset) {
  const wrapper = d3
    .select(selector)
    .append("svg")
    .attr("width", "100%")
    .attr("height", chartHeight)
    .attr("viewBox", [0, 0, chartWidth, chartHeight])
    .attr("preserveAspectRatio", "none")

  dataArea = wrapper.append("g").attr("class", "stacked_bar")

  makeScale(dataset)
  updateBarChart(dataset)
}

export function updateBarChart(dataset) {
  const { suit } = dataset

  const value = suit.map((c, i, a) => {
    if (i === 0) return c

    return {
      ...c,
      shift: a
        .slice(0, i)
        .map((d) => d.percentage)
        .reduce((prev, curr) => {
          return prev + curr
        })
    }
  })

  dataArea
    .selectAll("rect")
    .data(value, (d, i) => i)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("x", (d) => x(d.shift) || 0)
          .attr("y", 0)
          .attr("width", (d) => w(d.percentage))
          .attr("fill", (d) => d.colour)
          .attr("height", barHeight),
      (update) =>
        update
          .attr("x", (d) => x(d.shift) || 0)
          .attr("fill", (d) => d.colour)
          .attr("width", (d) => w(d.percentage)),
      (exit) => exit.remove()
    )
}
