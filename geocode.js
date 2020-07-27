#!/usr/bin/env node

const fs = require('fs')
const H = require('highland')
const axios = require('axios')

const CACHE_FILENAME = './geocoding-cache.json'
let geocodingCache = {}
try {
  geocodingCache = require(CACHE_FILENAME)
} catch (err) {
  console.error('Cache not found, creating after first run')
}

function writeCacheToFile () {
  console.error('Writing cache to file')
  fs.writeFileSync(CACHE_FILENAME, JSON.stringify(geocodingCache, null, 2))
}

let i = 0
async function geocode (servicePoint) {
  let geometry
  const address = servicePoint.address

  if (geocodingCache[address]) {
    geometry = geocodingCache[address]
  } else {
    const url = `https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?fq=type:adres%20AND%20bron:BAG&q=${encodeURIComponent(address)}`

    let data
    try {
      const response = await axios.get(url)
      data = response.data
    } catch (err) {
      console.error(url)
      console.error(err.message)
    }

    if (data && data.response && data.response.docs) {
      const doc = data.response.docs[0]
      const wktPoint = doc.centroide_ll
      const match = wktPoint.match(/\d+\.\d+/g)

      geometry = {
        type: 'Point',
        coordinates: [parseFloat(match[0]), parseFloat(match[1])]
      }

      geocodingCache[address] = geometry
    }
  }

  if (i && i % 50 === 0) {
    writeCacheToFile()
  }

  i++
  console.error(`Geocoded address #${i}`)

  return {
    ...servicePoint,
    geometry
  }
}

const ndjson = H(process.stdin)
  .split()
  .compact()
  .map(JSON.parse)
  .flatMap((servicePoint) => H(geocode(servicePoint)))
  .map(JSON.stringify)
  .intersperse('\n')

ndjson
  .observe()
  .done(writeCacheToFile)

ndjson
  .pipe(process.stdout)
