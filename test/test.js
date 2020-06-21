/* global describe test expect page */

const root = 'http://localhost:5000/test'

async function loadPage (name) {
  await page.goto(`${root}/${name}.html`, { waitUntil: 'domcontentloaded' })
}

async function waitForGraphContent (name) {
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
        graphviz.removeEventListener('render', onRender)
        resolve()
      }
      graphviz.addEventListener('error', onRender)
    }))
}

function getContent () {
  return page.evaluate(() =>
    document.querySelector('graphviz-graph').shadowRoot.innerHTML)
}

async function expectSVG () {
  expect(await getContent()).toContain('<svg')
}

async function expectText (text) {
  expect(await getContent()).toBe(text)
}

describe('graphviz-graph', () => {
  test('loads local @hpcc-js/wasm', async () => {
    await loadPage('local')
    await waitForRenderEvent()
    await waitForGraphContent()
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

  test('stays empty for empty graph', async () => {
    await page.evaluate(() => {
      document.querySelector('graphviz-graph').graph = ''
    })
    await page.waitFor(100)
    expect(await getContent()).toBe('')
  })

  test('updates on re-appending to DOM, not outside DOM', async () => {
    const { contentOutside, contentInside } = await page.evaluate(async () => {
      const graphviz = document.querySelector('graphviz-graph')
      document.body.removeChild(graphviz)
      graphviz.graph = `
digraph G {
  main -> parse -> execute;
  main -> cleanup;
}
`
      await new Promise(resolve => setTimeout(resolve, 100))
      const contentOutside = graphviz.shadowRoot.innerHTML
      return new Promise(resolve => {
        function onRender () {
          graphviz.removeEventListener('render', onRender)
          resolve({ contentOutside, contentInside: graphviz.shadowRoot.innerHTML })
        }
        graphviz.addEventListener('render', onRender)
        document.body.appendChild(graphviz)
      })
    })
    expect(contentOutside).toBe('')
    expect(contentInside).toContain('<svg')
  })

  test('loads remote @hpcc-js/wasm', async () => {
    await loadPage('remote')
    await waitForRenderEvent()
    await waitForGraphContent()
    await expectSVG()
  })

  test('reports typo in graph script', async () => {
    await loadPage('graph.error')
    await waitForErrorEvent()
    await waitForGraphContent()
    await expectText('Layout was not done')
  })

  test('reports invalid WASM location', async () => {
    await loadPage('wasm.error')
    await waitForErrorEvent()
    await waitForGraphContent()
    await expectText('Graphviz not loaded')
  })
})
