import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5174/notes/engineering/digital-worjspace-phase1.html', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Get ALL images on the page
    const allImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height,
        className: img.className,
        parentClass: img.parentElement?.className || ''
      }));
    });
    
    console.log('=== ALL IMAGES ON ARTICLE PAGE ===');
    console.log(`Total: ${allImages.length}`);
    allImages.forEach((img, i) => {
      console.log(`\n[${i + 1}] src: ${img.src.split('/').pop()}`);
      console.log(`     alt: ${img.alt}`);
      console.log(`     size: ${img.width}x${img.height}`);
      console.log(`     class: ${img.className}`);
      console.log(`     parentClass: ${img.parentClass.substring(0, 80)}`);
    });
    
    // Check page structure - look for hero/header area
    const heroInfo = await page.evaluate(() => {
      const heroCandidates = [];
      // Look for common hero/header patterns
      const selectors = [
        '.hero', '.header', '.cover', '.feature', '.page-header',
        '.vp-hero', '.teek-hero', '.article-header', '.note-header'
      ];
      
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          heroCandidates.push({ selector: sel, text: el.innerText.substring(0, 200), hasImg: !!el.querySelector('img') });
        }
      }
      
      // Also check the first img on the page
      const firstImg = document.querySelector('img');
      const firstImgInfo = firstImg ? {
        src: firstImg.src,
        x: firstImg.getBoundingClientRect().x,
        y: firstImg.getBoundingClientRect().y,
        w: firstImg.width,
        h: firstImg.height
      } : null;
      
      return { heroCandidates, firstImgInfo };
    });
    
    console.log('\n=== HERO/HEADER CANDIDATES ===');
    heroInfo.heroCandidates.forEach(h => {
      console.log(`${h.selector}: hasImg=${h.hasImg}, text="${h.text.substring(0, 100)}"`);
    });
    
    if (heroInfo.firstImgInfo) {
      console.log(`\nFirst img: y=${heroInfo.firstImgInfo.y}, size=${heroInfo.firstImgInfo.w}x${heroInfo.firstImgInfo.h}`);
      console.log(`  src: ${heroInfo.firstImgInfo.src.split('/').pop()}`);
    }
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
})();
