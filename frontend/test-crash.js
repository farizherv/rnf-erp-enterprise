import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  console.log('Page loaded');
  
  // Try to find the button to open COA
  try {
    const texts = await page.evaluate(() => document.body.innerText);
    console.log('Body length:', texts.length);
  } catch (e) {}

  await browser.close();
})();
