const graphKey = Symbol('graph')
const dirtyKey = Symbol('dirty')

const pendingElements = new Set()
let wasmFolder, renderer

function createLoadError () {
  return new Error('Graphviz not loaded')
}

function triggerEvent (element, type, detail) {
  element.dispatchEvent(new CustomEvent(type, { detail }))
}

function updateGraph (element) {
  if (renderer === undefined) return pendingElements.add(element)
  element[dirtyKey] = false
  if (renderer === false) {
    const error = createLoadError()
    element.shadowRoot.innerHTML = error.message
    return triggerEvent(element, 'error', error)
  }
  element.shadowRoot.innerHTML = ''
  const graph = element.graph
  if (!graph) return
  renderer
    .layout(graph, 'svg')
    .then(svg => {
      element.shadowRoot.innerHTML = svg
      triggerEvent(element, 'render', svg)
    })
    .catch(error => {
      error.message = error.message.trim()
      console.error('Graphviz failed:', error)
      element.shadowRoot.innerHTML = error.message
      triggerEvent(element, 'error', error)
    })
}

function renderPendingGraphs () {
  for (const element of pendingElements) updateGraph(element)
  pendingElements.clear()
}

function enableRenderer () {
  const { wasmFolder: setWasmFolder, graphviz } = window['@hpcc-js/wasm']
  renderer = graphviz
  setWasmFolder(wasmFolder)
  triggerEvent(document, 'GraphvizLoaded', wasmFolder)
  renderPendingGraphs()
}

function disableRenderer () {
  renderer = false
  triggerEvent(document, 'error', createLoadError())
  renderPendingGraphs()
}

function loadRenderer (element) {
  if (wasmFolder) return
  wasmFolder = element.getAttribute('wasmFolder') || 'https://unpkg.com/@hpcc-js/wasm@0.3.14/dist'
  const script = document.createElement('script')
  script.src = `${wasmFolder}/index.min.js`
  script.defer = true
  script.addEventListener('load', enableRenderer)
  script.addEventListener('error', disableRenderer)
  document.head.appendChild(script)
}

class GraphvizElement extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    loadRenderer(this)
  }

  get graph () { return this[graphKey] }
  set graph (value) { this.setAttribute('graph', value) }

  attributeChangedCallback (name, oldValue, newValue) {
    this[graphKey] = newValue
    if (this.isConnected) updateGraph(this)
    else this[dirtyKey] = true
  }

  connectedCallback () {
    if (this[dirtyKey]) updateGraph(this)
  }

  static get observedAttributes () { return ['graph'] }
}

customElements.define('graphviz-graph', GraphvizElement)
