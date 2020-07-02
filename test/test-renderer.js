/* global describe test expect page */

const { loadPage } = require('./support')

function renderScript (script, wasmFolder) {
  return page.evaluate(async (script, wasmFolder) => {
    return new Promise(resolve => {
      function onMessage ({ data }) {
        if (data.script) return // request for the renderer
        self.removeEventListener('render', onMessage)
        resolve(data)
      }
      self.addEventListener('message', onMessage)
      self.dispatchEvent(new MessageEvent('message', {
        data: { script, wasmFolder }
      }))
    })
  }, script, wasmFolder)
}

describe('renderer', () => {
  test('fails without wasmFolder', async () => {
    await loadPage('renderer', 'initialized')
    const result = await renderScript('digraph G {}')
    expect(typeof result.error).toBe('object')
    expect(result.error.message).toContain('fetching of the wasm failed')
  })

  test('cannot recover from fatal failure', async () => {
    const result = await renderScript('digraph G {}', '../../node_modules/@hpcc-js/wasm/dist')
    expect(typeof result.error).toBe('object')
    expect(result.error.message).toContain('fetching of the wasm failed')
  })

  test('renders script', async () => {
    await page.reload()
    const result = await renderScript('digraph G {}', '../../node_modules/@hpcc-js/wasm/dist')
    expect(result.svg).toContain('<svg')
  })

  test('reports invalid script', async () => {
    const result = await renderScript('invalid')
    expect(typeof result.error).toBe('object')
    expect(result.error.message).toContain('syntax error')
  })
})
