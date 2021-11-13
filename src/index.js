// Needed for the generator functions which are transpiled from your async await keywords
import "regenerator-runtime/runtime"

import { updateVizHeadings } from "./vizHeadings"
import { makeRadarChart, updateRadarChart } from "./radarChart"
import { makePointsBubble, updatePointsBubble } from "./pointsBubble"
import { makeBarChart, updateBarChart } from "./barChart"

import { cumulativeOffset, writeGlobalVh } from "./utils"

import data from "./valentino_rossi-dataset_output.json"

import "./styles.css"

const vizWrapper = document.getElementById("viz-wrapper")
//const vizContent = document.querySelector("#wrapper .viz_area")

const vizTotalSections = data.length
const vizSingleSectionHeight = vizWrapper.offsetHeight / vizTotalSections

let vizSelectedRaceIndex
let vizSelectedRace
let vizLastSectionIndex

// executed once
function initViz() {
  // check scroll once
  checkScroll()

  // set true vh unit (iOS Safari)
  writeGlobalVh()
  window.addEventListener("resize", writeGlobalVh)

  // draw charts once
  updateVizHeadings(vizSelectedRace)
  makeRadarChart("#radar-chart", vizSelectedRace)
  makePointsBubble("#bubble", vizSelectedRace)
  makeBarChart("#bar-chart", vizSelectedRace)

  // init
  window.requestAnimationFrame(checkScroll)
}

function updateViz(index) {
  vizSelectedRaceIndex = index
  vizSelectedRace = data[vizSelectedRaceIndex]
  vizLastSectionIndex = index

  // update views
  updateVizHeadings(vizSelectedRace)
  updateRadarChart(vizSelectedRace)
  updatePointsBubble(vizSelectedRace)
  updateBarChart(vizSelectedRace)
}

function checkScroll() {
  requestAnimationFrame(checkScroll)

  const { scrollY } = window
  const vizHeight = vizWrapper.offsetHeight
  const vizOffsetTop = cumulativeOffset(vizWrapper).top
  const scrollOffsetTop = Math.min(
    vizHeight,
    Math.max(0, scrollY - vizOffsetTop)
  )

  if (scrollY > vizHeight + vizOffsetTop) return

  for (let i = 0; i < vizTotalSections; i++) {
    const sectionTriggerPoint = vizSingleSectionHeight * i

    if (scrollOffsetTop < sectionTriggerPoint) continue

    if (scrollOffsetTop > sectionTriggerPoint + vizSingleSectionHeight) continue

    const currentSectionIndex = Math.min(
      data.length - 1,
      Math.max(0, Math.round(scrollOffsetTop / vizSingleSectionHeight))
    )

    if (vizLastSectionIndex === undefined) {
      vizSelectedRaceIndex = currentSectionIndex
      vizSelectedRace = data[vizSelectedRaceIndex]
      vizLastSectionIndex = currentSectionIndex
    }

    if (vizLastSectionIndex !== currentSectionIndex) {
      updateViz(currentSectionIndex)
    }
  }
}

// Start app
initViz()
