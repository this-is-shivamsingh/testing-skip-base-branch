const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const percySnapshot = require('@percy/selenium-webdriver');
const httpServer = require('http-server');
const path = require('path');

const PORT = process.env.PORT_NUMBER || 8000;
const BASE_URL = `http://localhost:${PORT}`;

async function cleanup({ driver, server, isError = 0 }) {
  driver && (await driver.quit());
  server && server.close();
  process.exit(isError);
}

(async function () {
  // Serve the static pages locally.
  const server = httpServer.createServer({ root: path.join(__dirname, '.static') });
  server.listen(PORT);
  console.log(`Serving static pages on ${BASE_URL}`);

  let driver;
  try {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Snapshot 1
    await driver.get(`${BASE_URL}/p1.html`);
    await percySnapshot(driver, 'Page 1');

    // Snapshot 2
    await driver.get(`${BASE_URL}/p2.html`);
    await percySnapshot(driver, 'Page 2');

    await cleanup({ driver, server, isError: 0 });
  } catch (err) {
    console.error(err);
    await cleanup({ driver, server, isError: 1 });
  }
})();
