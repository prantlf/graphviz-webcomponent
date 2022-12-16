import tehanu from 'tehanu'
import { strictEqual } from 'assert'
import { contain, loadPage, openBrowser, closeBrowser } from './support.js'

const test = tehanu(import.meta.url)

let page

test.before(async () => page = await openBrowser())

test.after(() => process.env.SINGLE_TEST && closeBrowser())

function renderScript (script) {
  return page.evaluate(script => {
    return new Promise(resolve => {
      function onMessage ({ data }) {
        if (data.script) return // request for the renderer
        self.removeEventListener('render', onMessage)
        resolve(data)
      }
      self.addEventListener('message', onMessage)
      self.dispatchEvent(new MessageEvent('message', {
        data: { script }
      }))
    })
  }, script)
}

test('renders script', async () => {
  await loadPage('renderer', 'initialized')
  const result = await renderScript('digraph G {}')
  contain(result.svg, '<svg')
})

test('reports invalid script', async () => {
  const result = await renderScript('invalid')
  strictEqual(typeof result.error, 'object')
  contain(result.error.message, 'syntax error')
})
