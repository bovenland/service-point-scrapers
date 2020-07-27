#!/usr/bin/env node

const puppeteer = require('puppeteer')

const companies = {
  dhl: require('./companies/dhl.js'),
  dpd: require('./companies/dpd.js'),
  gls: require('./companies/gls.js'),
  postnl: require('./companies/postnl.js'),
  ups: require('./companies/ups.js')
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run () {
  const browser = await puppeteer.launch()

  for (let postcode = 1011; postcode <= 9999; postcode++) {
    for (let company in companies) {
      const scrape = companies[company]

      const page = await browser.newPage()

      const companyResults = await scrape(postcode, page)

      if (companyResults && companyResults.length) {
        const results = companyResults.map((item) => ({
          query: postcode,
          company,
          ...item
        }))

        console.log(results.map(JSON.stringify).join('\n'))
      }

      await page.close()
    }

    await sleep(2000)
  }

  await browser.close()
}

run()
