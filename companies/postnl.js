module.exports = async function scrape (query, page) {
  const results = []
  const url = `https://www.postnl.nl/locatiewijzer?q=${encodeURIComponent(query)}&f=23&c=0`
  await page.goto(url)

  try {
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      }),
      page.click('#grantPermissionButton')
    ])
  } catch (err) {
    // Button to accept all cookies not found - this is fine!
  }

  const elements = await page.$$('.result-item')
  for (let element of elements) {
    try {
      await element.click()
      await page.waitFor(500)
      await page.waitForSelector('app-details .lp-list-item-body', {
        visible: true
      })

      const result = await page.$eval('app-details .lp-list-item-body', (element) => ({
        name: element.querySelector('strong').innerText,
        address: element.querySelector('div').innerText.split('\n').join(', ')
      }))
      results.push(result)

      await page.click('.lp-sidebar .lp-sidebar-wrap > button')
      await page.waitFor(500)
      await page.waitForSelector('.result-item', {
        visible: true
      })
    } catch (err) {
      console.error(err)
    }
  }

  return results
}
