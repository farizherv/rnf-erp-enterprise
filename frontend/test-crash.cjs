const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log('BROWSER_LOG:', msg.text());
    }
  });
  page.on('pageerror', error => console.log('BROWSER_PAGE_ERROR:', error.message));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  console.log('Page loaded');
  
  await browser.close();
})();
