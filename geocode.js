#!/usr/bin/env node

const H = require('highland')
const axios = require('axios')

async function geocode (servicePoint) {
  const address = servicePoint.address
  const url = `https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?fq=type:adres%20AND%20bron:BAG&q=${address}`

  const response = await axios.get(url)

  let geometry
  if (response.data && response.data.response && response.data.response.docs) {
    const doc = response.data.response.docs[0]
    const wktPoint = doc.centroide_ll
    const match = wktPoint.match(/\d+\.\d+/g)

    geometry = {
      type: 'Point',
      coordinates: [parseFloat(match[0]), parseFloat(match[1])]
    }
  }

  return {
    ...servicePoint,
    geometry
  }
}

H(process.stdin)
  .split()
  .compact()
  .map(JSON.parse)
  .flatMap((servicePoint) => H(geocode(servicePoint)))
  .map(JSON.stringify)
  .intersperse('\n')
  .pipe(process.stdout)
