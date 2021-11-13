export function randomIndex(data) {
  return Math.floor(Math.random() * data.length)
}

export function cycleYear(index) {
  if (index + 1 === 2) {
    index = 0
  } else {
    index += 1
  }
}

export function firstPosFill(dataset) {
  return dataset.position === 1 ? "#F2C743" : "#A7A693"
}

export function writeGlobalVh() {
  const vh = window.innerHeight
  document.documentElement.style.setProperty("--vh", `${vh}px`)
}

export const cumulativeOffset = function (element) {
  let top = 0,
    left = 0
  do {
    top += element.offsetTop || 0
    left += element.offsetLeft || 0
    element = element.offsetParent
  } while (element)

  return {
    top: top,
    left: left
  }
}
