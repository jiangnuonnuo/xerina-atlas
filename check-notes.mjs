import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5174/notes/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Notes page body text length:', bodyText.length);
    console.log('Has article title:', bodyText.includes('数字人总体架构'));
    console.log('Has cardImage reference:', bodyText.includes('digital-worjspace-phase1-cover'));
    console.log('\nFirst 500 chars of body:');
    console.log(bodyText.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
