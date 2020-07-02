const graphKey = Symbol('graph')
const scaleKey = Symbol('scale')
const { delayWorkerLoading } = window.graphvizWebComponent || {}
let renderer, rendererUrl, wasmFolder

if (!delayWorkerLoading) getRenderer()

function ensureConfiguration () {
  if (!rendererUrl) {
    ({
      rendererUrl = 'https://unpkg.com/graphviz-webcomponent@0.4.1/dist/renderer.min.js',
      wasmFolder = 'https://unpkg.com/@hpcc-js/wasm@0.3.14/dist'
    } = window.graphvizWebComponent || {})
  }
}

function getRenderer () {
  if (!renderer) {
    ensureConfiguration()
    renderer = new Worker(rendererUrl)
  }
  return renderer
}

function requestRendering (element, script, receiveResult) {
  const renderer = getRenderer()
  renderer.addEventListener('message', receiveResult)
  const localWasmFolder = element.getAttribute('wasmFolder')
  if (localWasmFolder) {
    console.warn('Stop using the deprecated "wasmFolder" attribute. Set the global variable "graphvizWebComponent.wasmFolder" instead.')
    wasmFolder = localWasmFolder
  } else {
    ensureConfiguration()
  }
  renderer.postMessage({ script: script || element.graph, wasmFolder })
  wasmFolder = undefined
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
  const scale = element[scaleKey]
  if (svg && scale) {
    svg.style.transform = `scale(${scale})`
    svg.style.transformOrigin = 'top left'
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
  element.shadowRoot.innerHTML = ''
  if (!element.graph) return
  requestRendering(element, undefined, receiveResult)

  function receiveResult ({ data }) {
    const { svg, error } = data
    closeRendering(receiveResult)
    if (error) {
      error.message = error.message.trim()
      return showError(element, error)
    }
    showImage(element, svg)
  }
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
  }

  get graph () { return this[graphKey] }
  set graph (value) { this.setAttribute('graph', value) }

  get scale () { return this[scaleKey] }
  set scale (value) { this.setAttribute('scale', value) }

  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'graph':
        this[graphKey] = newValue
        updateGraph(this)
        break
      case 'scale':
        this[scaleKey] = newValue
        applyScale(this)
    }
  }

  tryGraph (graph) {
    return tryUpdateGraph(this, graph)
  }

  static get observedAttributes () { return ['graph', 'scale'] }
}

customElements.define('graphviz-graph', GraphvizGraphElement)
