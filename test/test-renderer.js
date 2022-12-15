/* global describe test expect page */

const { loadPage } = require('./support')

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

describe('renderer', () => {
  test('renders script', async () => {
    await loadPage('renderer', 'initialized')
    const result = await renderScript('digraph G {}')
    expect(result.svg).toContain('<svg')
  })

  test('reports invalid script', async () => {
    const result = await renderScript('invalid')
    expect(typeof result.error).toBe('object')
    expect(result.error.message).toContain('syntax error')
  })
})
