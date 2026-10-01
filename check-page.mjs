import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push({ type, text });
    if (type === 'error') {
      console.error('CONSOLE ERROR:', text);
    }
  });
  
  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    await page.goto('http://localhost:5174/notes/engineering/digital-worjspace-phase1.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const title = await page.title();
    const content = await page.content();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('\n=== Page Info ===');
    console.log('Title:', title);
    console.log('Body text length:', bodyText.length);
    console.log('Body text (first 200 chars):', bodyText.substring(0, 200));
    console.log('\n=== Console Errors ===');
    consoleLogs.filter(l => l.type === 'error').forEach(l => console.log(l.text));
    console.log('\n=== Page Errors ===');
    pageErrors.forEach(e => console.log(e));
    console.log('\n=== All Console Logs ===');
    consoleLogs.forEach(l => console.log(`[${l.type}] ${l.text}`));
  } catch (e) {
    console.error('Navigation error:', e.message);
  }
  
  await browser.close();
})();
