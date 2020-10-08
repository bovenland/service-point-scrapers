module.exports = async function scrape (query, page) {
  const url = `https://www.dhlparcel.nl/nl/consument/vind-dhl-punt?op=Vind%20DHL%20punt&q=${encodeURIComponent(query)}`

  await page.goto(url)

  try {
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      }),
      page.click('button.agree-button')
    ])
  } catch (err) {
    // Button to accept all cookies not found - this is fine!
  }

  const results = await page.$$eval('.md-list-item', (elements) => elements
    .map((element) => ({
      name: element.querySelector('.md-tile-text--primary').innerText.split(' - ')[0],
      address: element.querySelector('.md-tile-text--secondary').innerText.split('\n').join(', ')
    })))

  return results
}
