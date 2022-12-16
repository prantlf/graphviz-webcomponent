import connect from 'connect'
import serve from 'serve-static'
import { launch } from 'puppeteer'
import { mkdir, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { ok } from 'assert'

const __dirname = dirname(fileURLToPath(import.meta.url))
const enableCoverage = !process.env.NO_COVERAGE

const port = 5000
let promise, server, browser, page

export function openBrowser() {
  return promise || (promise = new Promise((resolve, reject) =>
    server = connect()
      .use(serve(join(__dirname, '..'), { etag: false }))
      .listen(port, () => {
        launch({
          headless: true,
          args: process.env.TRAVIS === 'true' ? ['--no-sandbox'] : []
        })
        .then(result => (browser = result).newPage())
        .then(async result => {
          if (enableCoverage) {
            await result.coverage.startJSCoverage({
              resetOnNavigation: false,
              includeRawScriptCoverage: true
            })
          }
          return page = result
        })
        .then(() => resolve(page))
        .catch(reject)
      })
  ))
}

async function writeCoverage(coverage) {
  await mkdir('coverage/tmp', { recursive: true })
  const cwd = process.cwd()
  const urlLength = `http://localhost:${port}/`.length
  const result = coverage.map(({ rawScriptCoverage }) => {
    const { url } = rawScriptCoverage
    const path = url.substring(urlLength)
    rawScriptCoverage.url = `${cwd}/${path}`
    return rawScriptCoverage
  })
  await writeFile(`coverage/tmp/out.json`, JSON.stringify({ result }))
}

export async function closeBrowser() {
  const coverage = enableCoverage && await page.coverage.stopJSCoverage()
  await Promise.all([browser.close(), coverage && await writeCoverage(coverage)])
  return new Promise(resolve => server.close(resolve))
}

const root = 'http://localhost:5000/test'

export function loadPage (group, name) {
  return page.goto(`${root}/${group}/${name}.html`, { waitUntil: 'domcontentloaded' })
}
export function contain(hay, needle) {
  ok(hay && hay.includes(needle), `"${hay}" includes "${needle}"`)
}

export function notContain(hay, needle) {
  ok(hay && !hay.includes(needle), `"${hay}" includes no "${needle}"`)
}

export function waitForTime (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
