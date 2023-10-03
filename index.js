const { chromium, devices } = require('playwright');

const site =
  'https://playwright.dev/';
const cookieSelector = '';

const requestToIntercept =
  'https://playwright.dev/docs/api/class-route';

let maxIntents = 20;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function reloadPage(page) {
  await page.goto(site);

  if (cookieSelector) {
    //check if cookie selector is present
    if (await page.$(cookieSelector)) {
      await page.waitForSelector(cookieSelector);
      await page.click(cookieSelector);
    }
  }

  await page.evaluate(() => {
    const scroll = setInterval(() => {
      window.scrollBy(0, 500);
    }, 1000);

    setTimeout(() => {
      clearInterval(scroll);
    }, 5000);
  });

  await delay(10000);
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    devtools: true,
    timeout: 0,
    
  });


  const iPhone = devices['iPhone SE'];
  const page = await browser.newPage({
    ...iPhone,
  });

  let requestIntercepted = false;

  await page.route('**/*', (route) => {
    if (route.request().url().includes(requestToIntercept)) {
      requestIntercepted = true;
    }

    //allow CORS and disable cache
    /* Enabling routing disables http cache. */
    route.continue({
      headers: {
        ...route.request().headers(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Requested-With',
      },
    });
  });

  while (!requestIntercepted && maxIntents > 0) {
    maxIntents--;
    await reloadPage(page);
  }
})();