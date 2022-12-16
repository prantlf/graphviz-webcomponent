import getRenderer from './separate-engine'

const graphKey = Symbol('graph')
const scaleKey = Symbol('scale')

function requestRendering (element, script, receiveResult) {
  const renderer = getRenderer()
  renderer.addEventListener('message', receiveResult)
  renderer.postMessage({ script: script || element.graph })
}

function closeRendering (receiveResult) {
  const renderer = getRenderer()
  renderer.removeEventListener('message', receiveResult)
}

function triggerEvent (element, type, detail) {
  element.dispatchEvent(new CustomEvent(type, { detail }))
}

function applyScale (element) {
  const svg = element.shadowRoot.children[0]
  const scale = element.scale
  if (svg) {
    if (scale) {
      svg.style.transform = `scale(${scale})`
      svg.style.transformOrigin = 'top left'
    } else {
      svg.style.transform = ''
      svg.style.transformOrigin = ''
    }
  }
}

function showImage (element, svg) {
  element.shadowRoot.innerHTML = svg
  applyScale(element)
  triggerEvent(element, 'render', svg)
}

function showError (element, error) {
  console.error('Graphviz failed:', error)
  element.shadowRoot.innerHTML = error.message
  return triggerEvent(element, 'error', error)
}

function updateGraph (element) {
  return new Promise(resolve => {
    element.shadowRoot.innerHTML = ''
    if (!element.graph) return resolve()
    requestRendering(element, undefined, receiveResult)

    function receiveResult ({ data }) {
      const { svg, error } = data
      closeRendering(receiveResult)
      if (error) {
        error.message = error.message.trim()
        showError(element, error)
        return resolve(error)
      }
      showImage(element, svg)
      resolve(svg)
    }
  })
}

function tryUpdateGraph (element, script) {
  return new Promise((resolve, reject) => {
    if (!script) {
      element[graphKey] = ''
      element.shadowRoot.innerHTML = ''
      return resolve()
    }
    requestRendering(element, script, receiveResult)

    function receiveResult ({ data }) {
      const { svg, error } = data
      closeRendering(receiveResult)
      if (error) return reject(error)
      element[graphKey] = script
      showImage(element, svg)
      resolve(svg)
    }
  })
}

class GraphvizGraphElement extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.graphCompleted = Promise.resolve()
  }

  get graph () { return this[graphKey] }
  set graph (value) { this.setAttribute('graph', value) }

  get scale () { return this[scaleKey] }
  set scale (value) { this.setAttribute('scale', value) }

  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'graph':
        this[graphKey] = newValue
        this.graphCompleted = updateGraph(this).catch(error => error)
        break
      case 'scale':
        this[scaleKey] = newValue
        applyScale(this)
    }
  }

  tryGraph (graph) {
    const promise = tryUpdateGraph(this, graph)
    this.graphCompleted = promise.catch(error => error)
    return promise
  }

  static get observedAttributes () { return ['graph', 'scale'] }
}

customElements.define('graphviz-graph', GraphvizGraphElement)

export default GraphvizGraphElement
