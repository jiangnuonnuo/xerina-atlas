import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5174/notes/engineering/digital-worjspace-phase1.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Check for cover image
    const coverImg = await page.evaluate(() => {
      const img = document.querySelector('img[src*="digital-worjspace-phase1-cover"]');
      return img ? img.src : null;
    });
    
    // Check all images
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('digital-worjspace'));
    });
    
    console.log('Cover image:', coverImg);
    console.log('Digital worjspace images count:', images.length);
    if (images.length > 0) {
      console.log('Sample images:', images.slice(0, 3));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
