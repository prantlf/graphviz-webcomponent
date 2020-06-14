const source = document.getElementById('source')
const graph = document.getElementById('graph')
const render = document.getElementById('render')
const saveSVG = document.getElementById('save-svg')
const savePNG = document.getElementById('save-png')
const svgSizeRegExp = new RegExp('<svg width="(\\d+)pt" height="(\\d+)pt"')
let svg, png

graph.graph = source.textContent

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
  render.disabled = false
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
  svg = png = undefined
  saveSVG.disabled = savePNG.disabled = true
  render.disabled = false
}

function downloadFile (blob) {
  const link = document.createElement('a')
  link.download = blob.type === 'image/png' ? 'graph.png' : 'graph.svg'
  document.body.appendChild(link)
  const url = URL.createObjectURL(blob)
  link.href = url
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function updateGraph (event) {
  event.preventDefault()
  const value = source.value.trim()
  if (value) render.disabled = true
  else forgetImage()
  graph.graph = value
}

function saveAsSVG () {
  downloadFile(new Blob([svg], { type: 'image/svg+xml' }))
}

function saveAsPNG () {
  downloadFile(png)
}

graph.addEventListener('render', rememberImage)
graph.addEventListener('error', forgetImage)
render.addEventListener('click', updateGraph)
saveSVG.addEventListener('click', saveAsSVG)
savePNG.addEventListener('click', saveAsPNG)
