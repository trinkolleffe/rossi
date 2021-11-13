const yearEl = document.querySelector(".viz-info-year")
const bikeEl = document.querySelector(".viz-info-bike")
const podiumsEl = document.querySelector(".viz-info-podiums-content")

function makePodiumDot(d, p, totalNumber, parent) {
  const podiumDotElement = document.createElement("div")
  podiumDotElement.className = `viz-podium-dot ${p} ${d}`

  if (d === 0) {
    podiumDotElement.innerHTML = totalNumber
  }

  parent.appendChild(podiumDotElement)
}

export function updateVizHeadings(dataset) {
  const { year, bike, podiums } = dataset

  yearEl.innerHTML = year
  bikeEl.innerHTML = bike

  if (podiumsEl.hasChildNodes) {
    const cn = podiumsEl.childNodes
    Array.prototype.slice.call(cn).forEach((n) => podiumsEl.removeChild(n))
  }

  Object.keys(podiums).forEach((p) => {
    const podiumCategoryWrapper = document.createElement("div")
    podiumCategoryWrapper.className = `viz-podium ${p}`
    podiumsEl.appendChild(podiumCategoryWrapper)

    const totalPodiums = podiums[p]
    Array.from(Array(totalPodiums).keys(), (d) =>
      makePodiumDot(d, p, totalPodiums, podiumCategoryWrapper)
    )
  })
}
