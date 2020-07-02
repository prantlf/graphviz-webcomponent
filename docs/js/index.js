const source = document.getElementById('source')
const graph = document.getElementById('graph')
const saveSVG = document.getElementById('save-svg')
const savePNG = document.getElementById('save-png')
const saveScript = document.getElementById('save-script')
const svgSizeRegExp = /<svg width="(\d+)pt" height="(\d+)pt"/
let svg, png, lastError, pendingUpdate, runningUpdate, remainingError

graph.setAttribute('graph', source.getAttribute('value'))

function convertSVGToPNG () {
  return new Promise((resolve, reject) => {
    const size = svgSizeRegExp.exec(svg)
    if (!size) throw new Error('Unknown SVG size.')
    const canvas = document.createElement('canvas')
    canvas.width = size[1] / 0.75
    canvas.height = size[2] / 0.75
    const context = canvas.getContext('2d')
    const image = document.createElement('img')
    image.onload = () => {
      try {
        context.drawImage(image, 0, 0)
        canvas.toBlob(resolve)
      } catch (error) {
        reject(error)
      }
    }
    image.onerror = () => reject(new Error('PNG conversion failed.'))
    image.src = `data:image/svg+xml;base64,${btoa(svg)}`
  })
}

async function rememberImage ({ detail }) {
  runningUpdate = false
  lastError = undefined
  svg = detail
  saveSVG.disabled = false
  try {
    png = await convertSVGToPNG()
    savePNG.disabled = false
  } catch ({ message }) {
    alert(message)
  }
}

function forgetImage () {
  svg = png = runningUpdate = lastError = undefined
  saveSVG.disabled = savePNG.disabled = true
}

function downloadFile (blob) {
  const link = document.createElement('a')
  const type = blob.type
  link.download = type === 'image/png' ? 'graph.png'
    : type === 'image/svg+xml' ? 'graph.svg' : 'graph.dot'
  document.body.appendChild(link)
  const url = URL.createObjectURL(blob)
  link.href = url
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function displayError () {
  clearTimeout(remainingError)
  remainingError = undefined
  if (pendingUpdate || runningUpdate || !lastError) return
  graph.graph = source.value
}

function scheduleDisplayError () {
  if (remainingError) clearTimeout(remainingError)
  remainingError = setTimeout(displayError, 300)
}

async function tryUpdateGraph () {
  if (runningUpdate) return scheduleUpdateGraph()
  clearTimeout(pendingUpdate)
  pendingUpdate = undefined
  runningUpdate = true
  lastError = undefined
  const value = source.value
  if (value) {
    try {
      await graph.tryGraph(value)
    } catch (error) {
      runningUpdate = false
      lastError = error
      scheduleDisplayError()
    }
  } else {
    graph.graph = value
    forgetImage()
  }
}

function scheduleUpdateGraph () {
  if (pendingUpdate) clearTimeout(pendingUpdate)
  pendingUpdate = setTimeout(tryUpdateGraph, 300)
}

function saveAsSVG () {
  downloadFile(new Blob([svg], { type: 'image/svg+xml' }))
}

function saveAsPNG () {
  downloadFile(png)
}

function saveAsText () {
  downloadFile(new Blob([graph.graph], { type: 'text/plain' }))
}

source.addEventListener('input', scheduleUpdateGraph)
graph.addEventListener('render', rememberImage)
graph.addEventListener('error', forgetImage)
saveSVG.addEventListener('click', saveAsSVG)
savePNG.addEventListener('click', saveAsPNG)
saveScript.addEventListener('click', saveAsText)
