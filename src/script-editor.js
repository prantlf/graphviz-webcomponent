import { LitElement, html, css } from 'lit-element'
import { CodeJar } from './codejar/codejar'
import Prism from './prism/prism-core'
import lightTheme from './prism/prism-light.style'
import lineNumbersStyle from './prism/prism-line-numbers.style'
import matchBracesStyle from './prism/prism-match-braces.style'
import './prism/prism-line-numbers'
import './prism/prism-match-braces'
import './prism/prism-graphviz'

const features = ['line-numbers', 'match-braces', 'rainbow-braces']
const renderedKey = Symbol('rendered')
const jarKey = Symbol('jar')
const widthKey = Symbol('width')
const heightKey = Symbol('height')
const mousedownKey = Symbol('mousedown')
const mouseupKey = Symbol('mouseup')
let pendingAllLineNumbersUpdate

Prism.codeTag = 'div'

function triggerEvent (element, type, detail) {
  element.dispatchEvent(new CustomEvent(type, { detail }))
}

function getFeatureClasses (element) {
  return element.class
    .trim()
    .split(/\s+/)
    .filter(feature => features.includes(feature))
    .join(' ')
}

function hasChangedFeatureClass (newValue, oldValue) {
  const newClasses = newValue.trim().split(/\s+/)
  const oldClasses = oldValue ? oldValue.trim().split(/\s+/) : []
  return features.some(feature =>
    newClasses.includes(feature) !== oldClasses.includes(feature))
}

function createJar (element) {
  const ownerRoot = element.shadowRoot
  const source = ownerRoot.children[0].children[0]
  const jar = CodeJar(source, Prism.highlightElement, { tab: element.tab, ownerRoot })
  jar.onUpdate(code => {
    element.value = code
    triggerEvent(element, 'input', code)
  })
  return jar
}

class GraphvizScriptEditorElement extends LitElement {
  constructor () {
    super()
    this.value = ''
    this.tab = '  '
    this.class = ''
  }

  render () {
    const jar = this[jarKey]
    if (jar) jar.destroy()
    return html`<pre id=source-wrapper>
  <div id=source class="language-graphviz ${getFeatureClasses(this)}">${this.value}</div>
</pre>`
  }

  connectedCallback () {
    super.connectedCallback()
    registerEvents(this)
  }

  disconnectedCallback () {
    unregisterEvents(this)
    super.disconnectedCallback()
  }

  shouldUpdate (changedProperties) {
    const rendered = this[renderedKey]
    if (!rendered) return true
    if (changedProperties.has('class')) return true
    if (changedProperties.has('value')) {
      const jar = this[jarKey]
      const newValue = this.value
      if (newValue !== jar.toString()) jar.updateCode(newValue)
    }
    if (changedProperties.has('tab')) {
      this[jarKey].updateOptions({ tab: this.tab })
    }
    return false
  }

  updated () {
    this[jarKey] = createJar(this)
    this[renderedKey] = true
  }

  static get properties () {
    return {
      value: { type: String, reflect: true },
      tab: { type: String, reflect: true },
      class: {
        type: String,
        reflect: true,
        hasChanged (newValue, oldValue) {
          return hasChangedFeatureClass(newValue, oldValue)
        }
      }
    }
  }

  static get styles () {
    return [lightTheme, lineNumbersStyle, matchBracesStyle, css`:host {
  display: block;
  border: 1px black solid;
  border-radius: .5ex;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
  resize: both;
  overflow: auto;
}

#source-wrapper {
  width: calc(100% - 2em - 2px);
  height: calc(100% - 2px);
  padding-top: 0;
  padding-bottom: 0;
  white-space: pre-wrap;
}

#source-wrapper.line-numbers {
  width: calc(100% - 4.8em - 2px);
  margin: 0;
}

#source {
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Ubuntu Mono", "Liberation Mono", "Lucida Console", "Courier New", monospace;
  tab-size: 2;
  overflow-y: visible !important;
}`]
  }
}

function rememberSize (element) {
  element[widthKey] = element.clientWidth
  element[heightKey] = element.clientHeight
}

function updateLineNumbers (element) {
  const newWidth = element.clientWidth
  const newHeight = element.clientHeight
  if (newWidth !== element[widthKey] || newHeight !== element[heightKey]) {
    Prism.plugins.lineNumbers.updateLineNumbers(element.shadowRoot.children[0])
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

window.addEventListener('resize', scheduleUpdateAllLineNumbers)

customElements.define('graphviz-script-editor', GraphvizScriptEditorElement)
