import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5174/notes/engineering/digital-worjspace-phase1.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    console.log('=== Article Page Check ===');
    console.log('Title:', title);
    console.log('Body text length:', bodyText.length);
    console.log('Has article content:', bodyText.includes('数字化员工'));
    console.log('Has cover image:', bodyText.includes('digital-worjspace-phase1-cover'));
    console.log('\nFirst 500 chars:');
    console.log(bodyText.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
