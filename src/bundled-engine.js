import rendererScript from '../dist/renderer.min.js'

let renderer

export default function getRenderer () {
  if (!renderer) {
    const rendererBlob = new Blob([rendererScript], { type: 'application/javascript' })
    const rendererUrl = URL.createObjectURL(rendererBlob)
    renderer = new Worker(rendererUrl)
  }
  return renderer
}
