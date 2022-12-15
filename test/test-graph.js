/* global describe test expect page */

const { loadPage } = require('./support')

function tryGraph (script) {
  return page.evaluate(script => {
    const graphviz = document.querySelector('graphviz-graph')
    return graphviz.tryGraph(script)
  }, script)
}

async function waitForContent () {
  await page.waitForFunction(() => {
    const graphviz = document.querySelector('graphviz-graph')
    return graphviz && graphviz.shadowRoot.innerHTML !== ''
  })
}

async function waitForRenderEvent () {
  await page.evaluate(() =>
    new Promise(resolve => {
      const graphviz = document.querySelector('graphviz-graph')
      function onRender () {
        graphviz.removeEventListener('render', onRender)
        resolve()
      }
      graphviz.addEventListener('render', onRender)
    }))
}

async function waitForErrorEvent () {
  await page.evaluate(() =>
    new Promise(resolve => {
      const graphviz = document.querySelector('graphviz-graph')
      function onRender () {
        graphviz.removeEventListener('error', onRender)
        resolve()
      }
      graphviz.addEventListener('error', onRender)
    }))
}

function getContent () {
  return page.evaluate(() =>
    document.querySelector('graphviz-graph').shadowRoot.innerHTML)
}

async function expectText (text) {
  expect(await getContent()).toContain(text)
}

function expectSVG () {
  return expectText('<svg')
}

describe('graphviz-graph', () => {
  test('loads local @hpcc-js/wasm', async () => {
    await loadPage('graph', 'delayed')
    await waitForRenderEvent()
    await waitForContent()
    await expectSVG()
  })

  test('updates changed graph', async () => {
    const first = await getContent()
    await page.evaluate(() => {
      return new Promise(resolve => {
        const graphviz = document.querySelector('graphviz-graph')
        function onRender () {
          graphviz.removeEventListener('render', onRender)
          resolve()
        }
        graphviz.addEventListener('render', onRender)
        graphviz.graph = `
digraph G {
  main -> parse -> execute;
  main -> cleanup;
}
`
      })
    })
    const second = await getContent()
    expect(second).toContain('<svg')
    expect(first).not.toBe(second)
  })

  test('does not perform trial update with invalid input', async () => {
    try {
      await tryGraph('invalid')
      expect(false).toBeTruthy()
    } catch {
      await expectSVG()
    }
  })

  test('performs trial update with empty input', async () => {
    await tryGraph('')
    expect(await getContent()).toBe('')
  })

  test('performs trial update with valid input', async () => {
    await tryGraph(`
digraph G {
  main -> parse -> execute;
  main -> cleanup;
}`)
    await expectSVG()
  })

  test('stays empty for empty graph', async () => {
    await page.evaluate(() => {
      document.querySelector('graphviz-graph').graph = ''
    })
    await page.waitForTimeout(100)
    expect(await getContent()).toBe('')
  })

  test('loads @hpcc-js/wasm from other URL', async () => {
    await loadPage('graph', 'other-url')
    await waitForRenderEvent()
    await waitForContent()
    await expectSVG()
  })

  test('changes image scale', async () => {
    const scale = await page.evaluate(() => {
      const graphviz = document.querySelector('graphviz-graph')
      return graphviz.scale
    })
    expect(scale).toBeUndefined()
    const transform = await page.evaluate(() => {
      const graphviz = document.querySelector('graphviz-graph')
      graphviz.scale = '0.8'
      return graphviz.shadowRoot.children[0].style.transform
    })
    expect(transform).toBe('scale(0.8)')
  })

  test('reports typo in graph script', async () => {
    await loadPage('graph', 'graph-error')
    await waitForErrorEvent()
    await waitForContent()
    await expectText('Layout was not done')
  })
})
