import tehanu from 'tehanu'
import { contain, notContain, loadPage, openBrowser, closeBrowser } from './support.js'

const test = tehanu(import.meta.url)

let page

test.before(async () => page = await openBrowser())

test.after(() => process.env.SINGLE_TEST && closeBrowser())

async function waitForContent () {
  await page.waitForFunction(() => {
    const graphviz = document.querySelector('graphviz-script-editor')
    return graphviz && graphviz.shadowRoot.innerHTML !== ''
  })
}

function getContent () {
  return page.evaluate(() =>
    document.querySelector('graphviz-script-editor').shadowRoot.innerHTML)
}

async function expectScript (name) {
  contain(await getContent(),
    `<span class="token keyword">digraph</span> <span class="token class-name">${name}</span>`)
}

test('shows initialized script', async () => {
  await loadPage('script-editor', 'initialized')
  await waitForContent()
  await expectScript('G')
})

test('updates on feature class removal', async () => {
  const classes = await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-script-editor')
    const source = graphviz.shadowRoot.getElementById('source')
    graphviz.classList.remove('rainbow-braces')
    return source.className
  })
  notContain(classes, 'rainbow-braces')
})

test('ignores non-feature classes', async () => {
  const classes = await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-script-editor')
    const source = graphviz.shadowRoot.getElementById('source')
    graphviz.className = `${graphviz.className} test`
    return source.className
  })
  notContain(classes, 'test')
})

test('updates script', async () => {
  await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-script-editor')
    graphviz.value = 'digraph H {}'
  })
  await expectScript('H')
})

test('updates options', async () => {
  await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-script-editor')
    graphviz.tab = '\t'
  })
})

test('resizing disconected element has no effect', async () => {
  await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-script-editor')
    document.body.removeChild(graphviz)
    triggerMouseEvent('mouseover')
    triggerMouseEvent('mousedown')
    triggerMouseMoveEvent(window.innerWidth / 2, window.innerHeight / 2)
    triggerMouseMoveEvent(window.innerWidth / 2 - 1, window.innerHeight / 2 - 1)
    triggerMouseEvent('mouseup')
    triggerMouseEvent('click')
    document.body.appendChild(graphviz)

    function triggerMouseEvent (type) {
      const event = new MouseEvent(type, {
        bubbles: true, cancelable: true, view: window
      })
      graphviz.dispatchEvent(event)
    }

    function triggerMouseMoveEvent (clientX, clientY) {
      const event = new MouseEvent('mousemove', {
        bubbles: true, cancelable: true, view: window, clientX, clientY
      })
      graphviz.dispatchEvent(event)
    }
  })
})

test('resizing element re-renders', async () => {
  await page.evaluate(() => {
    const graphviz = document.querySelector('graphviz-script-editor')
    triggerMouseEvent('mouseover')
    triggerMouseEvent('mousedown')
    triggerMouseMoveEvent(window.innerWidth / 2 - 2, window.innerHeight / 2 - 2)
    triggerMouseMoveEvent(window.innerWidth / 2 - 3, window.innerHeight / 2 - 3)
    graphviz.style.width = `${window.innerWidth / 2 - 3}px`
    graphviz.style.height = `${window.innerHeight / 2 - 3}px`
    triggerMouseEvent('mouseup')
    triggerMouseEvent('click')

    function triggerMouseEvent (type) {
      const event = new MouseEvent(type, {
        bubbles: true, cancelable: true, view: window
      })
      graphviz.dispatchEvent(event)
    }

    function triggerMouseMoveEvent (clientX, clientY) {
      const event = new MouseEvent('mousemove', {
        bubbles: true, cancelable: true, view: window, clientX, clientY
      })
      graphviz.dispatchEvent(event)
    }
  })
})

test('resizing window re-renders', async () => {
  await page.evaluate(async () => {
    triggerResizeEvent()
    await waitForTime(10)
    triggerResizeEvent()
    await waitForTime(350)

    function triggerResizeEvent () {
      const event = new Event('resize', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: window.innerWidth / 2 - 4,
        clientY: window.innerHeight / 2 - 4
      })
      globalThis.dispatchEvent(event)
    }

    function waitForTime (milliseconds) {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
  })
})

// Fails with "DOMException: Failed to execute 'getRangeAt' on 'Selection': 0 is not a valid index.""
// test('typing updates', async () => {
//   await page.evaluate(async () => {
//     const graphviz = document.querySelector('graphviz-script-editor')
//     const source = graphviz.shadowRoot.getElementById('source')
//     triggerKeyboardEvent('keydown')
//     triggerKeyboardEvent('keyup')
//     await waitForTime(100)

//     function triggerKeyboardEvent (type) {
//       const event = new KeyboardEvent(type, {
//         bubbles: true,
//         cancelable: true,
//         char: 'G',
//         key: 'g',
//         shiftKey: true,
//         keyCode: 71
//       })
//       source.dispatchEvent(event)
//     }

//     function waitForTime (milliseconds) {
//       return new Promise(resolve => setTimeout(resolve, milliseconds))
//     }
//   })
// })
