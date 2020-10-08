module.exports = async function scrape (query, page) {
  const url = `https://www.dpd.com/nl/parcelshops/show?searchtext=${encodeURIComponent(query)}`
  await page.goto(url)

  const results = await page.$$eval('.parcelshopitem', (elements) => elements
    .map((element) => ({
      name: element.querySelector('.company').innerText,
      address: element.querySelector('.address').innerText
    })))

  return results
}
