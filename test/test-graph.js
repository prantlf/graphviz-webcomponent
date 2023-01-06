import tehanu from 'tehanu'
import { fail, notStrictEqual, strictEqual } from 'assert'
import { contain, loadPage, openBrowser, closeBrowser } from './support.js'

const test = tehanu(import.meta.url)

let page

test.before(async () => page = await openBrowser())

test.after(() => process.env.SINGLE_TEST && closeBrowser())

function tryGraph (script, id) {
  return page.evaluate((script, id) => {
    const graphviz = document.querySelector(id ? `#${id}` : 'graphviz-graph')
    return graphviz.tryGraph(script)
  }, script, id)
}

async function waitForContent (id) {
  await page.waitForFunction(id => {
    const graphviz = document.querySelector(id ? `#${id}` : 'graphviz-graph')
    return graphviz && graphviz.shadowRoot.innerHTML !== ''
  }, id)
}

async function waitForRenderEvent (id) {
  await page.evaluate(id =>
    new Promise(resolve => {
      const graphviz = document.querySelector(id ? `#${id}` : 'graphviz-graph')
      function onRender () {
        graphviz.removeEventListener('render', onRender)
        resolve()
      }
      graphviz.addEventListener('render', onRender)
    }), id)
}

async function waitForErrorEvent (id) {
  await page.evaluate(id =>
    new Promise(resolve => {
      const graphviz = document.querySelector(id ? `#${id}` : 'graphviz-graph')
      function onRender () {
        graphviz.removeEventListener('error', onRender)
        resolve()
      }
      graphviz.addEventListener('error', onRender)
    }), id)
}

function getPromise (id) {
  return page.evaluate(id =>
    document.querySelector(id ? `#${id}` : 'graphviz-graph').graphCompleted, id)
}

function getContent (id) {
  return page.evaluate(id =>
    document.querySelector(id ? `#${id}` : 'graphviz-graph').shadowRoot.innerHTML, id)
}

async function checkTextContent (text, id) {
  contain(await getContent(id), text)
}

function checkSVGContent (id) {
  return checkTextContent('<svg', id)
}

test('loads local @hpcc-js/wasm', async () => {
  await loadPage('graph', 'delayed')
  await waitForRenderEvent()
  await waitForContent()
  await checkSVGContent()
  await getPromise()
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
  contain(second, '<svg')
  notStrictEqual(first, second)
})

test('updates changed graph with promise', async () => {
  const first = await getContent()
  await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-graph')
    graphviz.graph = `
digraph G {
main -> cleanup;
}
`
  })
  contain(await getPromise(), '<svg')
  const second = await getContent()
  contain(second, '<svg')
  notStrictEqual(first, second)
})

test('does not perform trial update with invalid input', async () => {
  try {
    await tryGraph('invalid')
    fail('invalid input')
  } catch {
    await checkSVGContent()
  }
})

test('updates changed graph with invalid content', async () => {
  await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-graph')
    graphviz.graph = 'invalid'
  })
  strictEqual((await getPromise()).message, 'syntax error in line 1 near \'invalid\'')
  await checkTextContent('syntax error in line 1 near \'invalid\'')
})

test('performs trial update with empty input', async () => {
  await tryGraph('')
  strictEqual(await getContent(), '')
})

test('performs trial update with valid input', async () => {
  await tryGraph(`
digraph G {
main -> parse -> execute;
main -> cleanup;
}`)
  await checkSVGContent()
})

test('stays empty for empty graph', async () => {
  await page.evaluate(() => {
    document.querySelector('graphviz-graph').graph = ''
  })
  await page.waitForTimeout(100)
  strictEqual(await getContent(), '')
})

test('loads local @hpcc-js/wasm on a page with two graphs', async () => {
  await loadPage('graph', 'two')
  await Promise.all([waitForRenderEvent('g1'), waitForRenderEvent('g2')])
  await Promise.all([waitForContent('g1'), waitForContent('g2')])
  await Promise.all([checkSVGContent('g1'), checkSVGContent('g2')])
  await Promise.all([getPromise('g1'), getPromise('g2')])
})

test('updates boths graphs independently', async () => {
  const [first, second] = await Promise.all([getContent('g1'), getContent('g2')])
  notStrictEqual(first, second)
  const [first2, second2] = await page.evaluate(() => {
    const g1 = document.getElementById('g1')
    g1.graph = `
digraph G {
main -> cleanup;
}
`
    const g2 = document.getElementById('g2')
    document.getElementById('g2').graph = `
digraph H {
main -> execute;
}
`
    return Promise.all([g1.graphCompleted, g2.graphCompleted])
  })
  contain(first2, '<svg')
  contain(second2, '<svg')
  notStrictEqual(first2, second2)
  notStrictEqual(first, first2)
  notStrictEqual(second, second2)
})

test('updates boths graphs independently using tryGraph', async () => {
  const [first, second] = await page.evaluate((script1, script2) => Promise.all([
    document.getElementById('g1').tryGraph(script1),
    document.getElementById('g2').tryGraph(script2)
  ]), `
digraph I {
main -> start;
}
`, `
digraph J {
main -> end;
}
`)
  contain(first, '<svg')
  contain(second, '<svg')
  notStrictEqual(first, second)
})

test('loads @hpcc-js/wasm from other URL', async () => {
  await loadPage('graph', 'other-url')
  await waitForRenderEvent()
  await waitForContent()
  await checkSVGContent()
  await getPromise()
})

test('loads bundled @hpcc-js/wasm', async () => {
  await loadPage('graph', 'bundled')
  await waitForRenderEvent()
  await waitForContent()
  await checkSVGContent()
  await getPromise()
})

test('changes image scale', async () => {
  const scale = await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-graph')
    return graphviz.scale
  })
  strictEqual(scale, undefined)
  const transform = await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-graph')
    graphviz.scale = '0.8'
    return graphviz.shadowRoot.children[0].style.transform
  })
  strictEqual(transform, 'scale(0.8)')
})

test('reports typo in graph script', async () => {
  await loadPage('graph', 'graph-error')
  await waitForErrorEvent()
  await waitForContent()
  await checkTextContent('Layout was not done')
  strictEqual((await getPromise()).message, 'Layout was not done')
})

test('reports worker failure', async () => {
  await loadPage('graph', 'unpkg')
  const result = await getPromise()
  strictEqual(typeof result, 'object')
  contain(result.stack, 'Error: Failed to construct \'Worker\'')
})

test('reports delayedworker failure', async () => {
  await loadPage('graph', 'unpkg-delayed')
  const result = await getPromise()
  strictEqual(typeof result, 'object')
  contain(result.stack, 'Error: Failed to construct \'Worker\'')
})
