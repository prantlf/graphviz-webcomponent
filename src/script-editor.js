import { CodeJar } from './codejar/codejar'
import Prism from './prism/prism-core'
import lightTheme from './prism/prism-light.css'
import lineNumbersStyle from './prism/prism-line-numbers.css'
import matchBracesStyle from './prism/prism-match-braces.css'
import mainStyle from './script-editor.css'
import './prism/prism-line-numbers'
import './prism/prism-match-braces'
import './prism/prism-graphviz'

const features = ['line-numbers', 'match-braces', 'rainbow-braces']
const connectedKey = Symbol('connecte')
const valueKey = Symbol('value')
const tabKey = Symbol('tab')
const classKey = Symbol('class')
const jarKey = Symbol('jar')
const widthKey = Symbol('width')
const heightKey = Symbol('height')
const mousedownKey = Symbol('mousedown')
const mouseupKey = Symbol('mouseup')
let template, pendingAllLineNumbersUpdate

Prism.codeTag = 'div'

function getTemplate () {
  if (!template) {
    template = document.createElement('template')
    template.innerHTML = `<style>
${lightTheme}
${lineNumbersStyle}
${matchBracesStyle}
${mainStyle}
</style>
<pre id=source-wrapper><div id=source></div></pre>`
  }
  return template
}

function triggerEvent (element, type, detail) {
  element.dispatchEvent(new CustomEvent(type, { detail }))
}

function getFeatureClasses (element) {
  return element.className
    .trim()
    .split(/\s+/)
    .filter(feature => features.includes(feature))
    .join(' ')
}

function hasChangedFeatureClass (oldValue, newValue) {
  /* c8 ignore next */
  const oldClasses = oldValue ? oldValue.trim().split(/\s+/) : []
  const newClasses = newValue.trim().split(/\s+/)
  return features.some(feature =>
    oldClasses.includes(feature) !== newClasses.includes(feature))
}

function normalizeLineBreaks (value) {
  return value.replace(/\r?\n/, '\n')
}

function createEditor (element) {
  const ownerRoot = element.shadowRoot
  const source = ownerRoot.getElementById('source')
  const featureClasses = getFeatureClasses(element)
  source.className = `language-graphviz ${featureClasses}`
  const jar = element[jarKey] = CodeJar(source, Prism.highlightElement, { tab: element.tab, ownerRoot })
  updateEditor(element)
  jar.onUpdate(newCode => {
    newCode = normalizeLineBreaks(newCode)
    if (element.value !== newCode) {
      element[valueKey] = newCode
      triggerEvent(element, 'input', newCode)
    }
  })
}

function destroyEditor (element) {
  element[jarKey].destroy()
  element[jarKey] = null
}

function rebuildEditor (element) {
  destroyEditor(element)
  createEditor(element)
}

function updateEditor (element) {
  element[jarKey].updateCode(element.value)
}

function configureEditor (element) {
  element[jarKey].updateOptions({ tab: element.tab })
}

class GraphvizScriptEditorElement extends HTMLElement {
  constructor () {
    super()
    this[valueKey] = ''
    this[tabKey] = '  '
    this[classKey] = ''
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(getTemplate().content.cloneNode(true))
  }

  get value () { return this[valueKey] }
  set value (value) { this.setAttribute('value', value) }

  get tab () { return this[tabKey] }
  set tab (value) { this.setAttribute('tab', value) }

  get className () { return this[classKey] }
  set className (value) { this.setAttribute('class', value) }

  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'value':
        this[valueKey] = normalizeLineBreaks(newValue)
        if (this[connectedKey]) updateEditor(this)
        break
      case 'tab':
        this[tabKey] = newValue
        if (this[connectedKey]) configureEditor(this)
        break
      case 'class':
        this[classKey] = newValue
        if (this[connectedKey] && hasChangedFeatureClass(oldValue, newValue)) rebuildEditor(this)
        break
    }
  }

  connectedCallback () {
    registerEvents(this)
    createEditor(this)
    this[connectedKey] = true
  }

  disconnectedCallback () {
    destroyEditor(this)
    unregisterEvents(this)
    this[connectedKey] = false
  }

  static get observedAttributes () { return ['value', 'tab', 'class'] }
}

function rememberSize (element) {
  element[widthKey] = element.clientWidth
  element[heightKey] = element.clientHeight
}

function updateLineNumbers (element) {
  const newWidth = element.clientWidth
  const newHeight = element.clientHeight
  if (newWidth !== element[widthKey] || newHeight !== element[heightKey]) {
    Prism.plugins.lineNumbers.updateLineNumbers(element.shadowRoot.getElementById('source-wrapper'))
    element[widthKey] = newWidth
    element[heightKey] = newHeight
  }
}

function registerEvents (element) {
  const mousedown = element[mousedownKey] = () => rememberSize(element)
  const mouseup = element[mouseupKey] = () => updateLineNumbers(element)
  element.addEventListener('mousedown', mousedown)
  element.addEventListener('mouseup', mouseup)
}

function unregisterEvents (element) {
  element.removeEventListener('mouseup', element[mouseupKey])
  element.removeEventListener('mousedown', element[mousedownKey])
}

function updateAllLineNumbers () {
  clearTimeout(pendingAllLineNumbersUpdate)
  const editors = document.querySelectorAll('graphviz-script-editor.line-numbers')
  for (const editor of editors) updateLineNumbers(editor)
}

function scheduleUpdateAllLineNumbers () {
  if (pendingAllLineNumbersUpdate) clearTimeout(pendingAllLineNumbersUpdate)
  pendingAllLineNumbersUpdate = setTimeout(updateAllLineNumbers, 300)
}

addEventListener('resize', scheduleUpdateAllLineNumbers)

customElements.define('graphviz-script-editor', GraphvizScriptEditorElement)

export default GraphvizScriptEditorElement
