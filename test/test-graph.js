import tehanu from 'tehanu'
import { fail, ok, notStrictEqual, strictEqual } from 'assert'
import { contain, loadPage, openBrowser, closeBrowser, waitForTime } from './support.js'

const test = tehanu(import.meta.url)

let page

test.before(async () => page = await openBrowser())

test.after(() => process.env.SINGLE_TEST && closeBrowser())

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

function getPromise () {
  return page.evaluate(() =>
    document.querySelector('graphviz-graph').graphCompleted)
}

function getContent () {
  return page.evaluate(() =>
    document.querySelector('graphviz-graph').shadowRoot.innerHTML)
}

async function checkTextContent (text) {
  contain(await getContent(), text)
}

function checkSVGContent () {
  return checkTextContent('<svg')
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
