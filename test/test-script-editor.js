/* global describe test expect page */

const root = 'http://localhost:5000/test/script-editor'

async function loadPage (name) {
  await page.goto(`${root}/${name}.html`, { waitUntil: 'domcontentloaded' })
}

async function waitForContent (name) {
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
  expect(await getContent()).toContain(`<span class="token keyword">digraph</span> <span class="token class-name">${name}</span>`)
}

describe('graphviz-script-editor', () => {
  test('shows initialized script', async () => {
    await loadPage('initialized')
    await waitForContent()
    await expectScript('G')
  })

  test('updates on feature class removal', async () => {
    const classes = await page.evaluate(() => {
      const graphviz = document.querySelector('graphviz-script-editor')
      graphviz.classList.remove('rainbow-braces')
      return graphviz.shadowRoot.children[0].className
    })
    expect(classes).not.toContain('rainbow-braces')
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
      await new Promise(resolve => setTimeout(resolve, 10))
      triggerResizeEvent()
      await new Promise(resolve => setTimeout(resolve, 350))

      function triggerResizeEvent () {
        const event = new Event('resize', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: window.innerWidth / 2 - 4,
          clientY: window.innerHeight / 2 - 4
        })
        window.dispatchEvent(event)
      }
    })
  })

  // test('typing updates', async () => {
  //   await page.evaluate(async () => {
  //     const graphviz = document.querySelector('graphviz-script-editor')
  //     triggerKeyboardEvent('keydown')
  //     triggerKeyboardEvent('keyup')
  //     await new Promise(resolve => setTimeout(resolve, 100))
  //     function triggerKeyboardEvent (type) {
  //       const event = new KeyboardEvent(type, {
  //         bubbles : true,
  //         cancelable : true,
  //         char : 'G',
  //         key : 'g',
  //         shiftKey : true,
  //         keyCode : 71
  //       })
  //       graphviz.shadowRoot.children[0].children[0].dispatchEvent(event)
  //     }
  //   })
  // })
})
