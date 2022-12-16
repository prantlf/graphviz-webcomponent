import connect from 'connect'
import serve from 'serve-static'
import { launch } from 'puppeteer'
import { mkdir, writeFile } from 'fs/promises'
// import coverageConverter from 'puppeteer-to-istanbul'
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
  // try {
  //   coverageConverter.write(coverage, { includeHostname: false, storagePath: 'coverage' })
  // } catch (err) {
  //   console.error(err)
  // }
  // for (const entry of coverage) {
  //   entry.url = entry.url.replace('http://localhost:5000', process.cwd())
  // }
  await mkdir('coverage/tmp', { recursive: true })
  // coverage = coverage.map(({ rawScriptCoverage }) => rawScriptCoverage)
  // await Promise.all(coverage.map(({ rawScriptCoverage }, idx) => {
  //   rawScriptCoverage.url = rawScriptCoverage.url.replace('http://localhost:5000', process.cwd())
  //   return writeFile(`coverage/tmp/coverage-${Date.now()}-${idx}.json`,
  //     JSON.stringify({ result: [rawScriptCoverage] }, null, 2))
  // }))
  // const rawCoverage = []
  // for (const { rawScriptCoverage } of coverage) {
  //   const { url } = rawScriptCoverage
  //   const path = url.substring('http://localhost:5000/'.length)
  //   rawScriptCoverage.url = `${process.cwd()}/${path}`
  //   rawCoverage.push(rawScriptCoverage)
  // }
  const cwd = process.cwd()
  const urlLength = `http://localhost:${port}/`.length
  const result = coverage.map(({ rawScriptCoverage }) => {
    const { url } = rawScriptCoverage
    const path = url.substring(urlLength)
    rawScriptCoverage.url = `${cwd}/${path}`
    return rawScriptCoverage
  })
  await writeFile(`coverage/tmp/out.json`, JSON.stringify({ result }))
  // setTimeout(async () => {
  //   let totalBytes = 0, usedBytes = 0
  //   for (const entry of coverage) {
  //     totalBytes += entry.text.length
  //     for (const range of entry.ranges) usedBytes += range.end - range.start - 1
  //   }
  //   console.log(`Test code coverage: ${((usedBytes / totalBytes) * 100).toFixed(2)}%`);
  // }, 50)
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
