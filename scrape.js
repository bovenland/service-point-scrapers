#!/usr/bin/env node

const fs = require('fs')
const puppeteer = require('puppeteer')
const axios = require('axios')

const companies = {
  dhl: require('./companies/dhl.js'),
  dpd: require('./companies/dpd.js'),
  gls: require('./companies/gls.js'),
  postnl: require('./companies/postnl.js'),
  ups: require('./companies/ups.js')
}

// function sleep (ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }

const CACHE_FILENAME = './postcode-cache.json'
let postcodeCache = {}
try {
  postcodeCache = require(CACHE_FILENAME)
} catch (err) {
  console.error('Cache not found, creating after first run')
}

function writeCacheToFile () {
  console.error('Writing cache to file')
  fs.writeFileSync(CACHE_FILENAME, JSON.stringify(postcodeCache, null, 2))
}

function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }

  return array
}

async function streetForPostcode (postcode) {
  if (postcodeCache[postcode]) {
    return postcodeCache[postcode]
  } else {
    const url = `https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest?q=${postcode}`

    let data
    try {
      const response = await axios.get(url)
      data = response.data
    } catch (err) {
      console.error(url)
      console.error(err.message)
    }

    if (data && data.response && data.response.docs &&
      data.response.docs.length && data.response.docs[0].type === 'postcode') {
      const doc = data.response.docs[0]
      const street = doc.weergavenaam

      postcodeCache[postcode] = street
      return street
    }
  }
}

async function run () {
  const browser = await puppeteer.launch()

  const postcodeBounds = [1011, 9999]
  const postcodes = Array.from({length: postcodeBounds[1] - postcodeBounds[0] + 1})
    .map((_, index) => index + postcodeBounds[0])

  const postcodesShuffled = shuffleArray(postcodes)

  for (let postcode of postcodesShuffled) {
    const query = await streetForPostcode(postcode)

    console.error(postcode, query)

    if (!query) {
      console.error(`Can't find street for postcode ${postcode}`)
      continue
    }

    for (let company in companies) {
      const scrape = companies[company]

      const page = await browser.newPage()

      const companyResults = await scrape(query, page)

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
    if (postcode % 10 === 0) {
      writeCacheToFile()
    }
  }

  await browser.close()
  writeCacheToFile()
}

run()
