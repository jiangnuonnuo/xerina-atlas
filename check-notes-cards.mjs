import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5174/notes/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Check for card images
    const cardImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('digital-worjspace'));
    });
    
    console.log('Card images with digital-worjspace:', cardImages.length > 0 ? cardImages : 'None found');
    
    // Get full body text to see if card title appears
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasArticleInNotes = bodyText.includes('数字人总体架构');
    console.log('Article in notes listing:', hasArticleInNotes);
    
    if (hasArticleInNotes) {
      const idx = bodyText.indexOf('数字人总体架构');
      console.log('Context around article title:');
      console.log(bodyText.substring(idx - 100, idx + 200));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
