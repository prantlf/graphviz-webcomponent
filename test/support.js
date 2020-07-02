/* global page */

const root = 'http://localhost:5000/test'

async function loadPage (group, name) {
  await page.goto(`${root}/${group}/${name}.html`, { waitUntil: 'domcontentloaded' })
}

module.exports = { loadPage }
