const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Products with their links
const products = [
  { id: '1', name: 'מעיל טדי', link: 'https://addictonline.co.il/TEDDY_COAT_CORIN_' },
  { id: '2', name: 'סריג אוסטין', link: 'https://addictonline.co.il/AUSTIN_KNIT_CORIN_' },
  { id: '3', name: 'בלייזר אנאבל', link: 'https://addictonline.co.il/ANABELLE_BLAZER_CORIN_' },
  { id: '4', name: 'Philips Sonicare', link: 'https://cpb.co.il/philips-sonicare/' },
  { id: '5', name: 'Philips Lumea IPL 9900', link: 'https://cpb.co.il/product/philips-lumea-ipl-9900-series/' },
  { id: '6', name: 'קרם שיזוף Dove', link: 'https://shop.super-pharm.co.il/' },
  { id: '7', name: 'BOBOT MegaPro', link: 'https://bobot-israel.com/' },
  { id: '8', name: 'Papa Johns', link: 'https://www.papajohns.co.il/shop/' },
  { id: '9', name: 'Ergobaby כיסא', link: 'https://cpb.co.il/product-category/ergobaby/' },
  { id: '10', name: 'Erborian CC', link: 'https://il.erborian.com/' },
  { id: '11', name: 'Wolt', link: 'https://wolt.com/' },
  { id: '12', name: 'אופטיקנה', link: 'https://www.opticana.co.il/' },
];

const outputDir = path.join(__dirname, '..', 'public', 'products');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Fetch HTML and extract og:image
function fetchOgImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000,
    };

    const req = protocol.get(url, options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, url).href;
        console.log(`  Redirecting to: ${redirectUrl}`);
        return fetchOgImage(redirectUrl).then(resolve).catch(reject);
      }

      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        // Try to find og:image
        const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogMatch) {
          resolve(ogMatch[1]);
          return;
        }
        
        // Try alternative format
        const ogMatch2 = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        if (ogMatch2) {
          resolve(ogMatch2[1]);
          return;
        }

        // Try to find first product image
        const imgMatch = html.match(/<img[^>]*src=["']([^"']*(?:product|item)[^"']*)["']/i);
        if (imgMatch) {
          const imgUrl = imgMatch[1].startsWith('http') ? imgMatch[1] : new URL(imgMatch[1], url).href;
          resolve(imgUrl);
          return;
        }

        resolve(null);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Download image
function downloadImage(imageUrl, filename) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
    const filePath = path.join(outputDir, filename);

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 30000,
    };

    const req = protocol.get(imageUrl, options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, filename).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

// Main
async function main() {
  console.log('Fetching product images...\n');
  
  const results = [];

  for (const product of products) {
    console.log(`[${product.id}] ${product.name}`);
    console.log(`  URL: ${product.link}`);
    
    try {
      const ogImage = await fetchOgImage(product.link);
      
      if (ogImage) {
        console.log(`  OG Image: ${ogImage}`);
        
        // Determine file extension
        const ext = ogImage.match(/\.(jpg|jpeg|png|webp|gif)/i)?.[1] || 'jpg';
        const filename = `product-${product.id}.${ext}`;
        
        try {
          await downloadImage(ogImage, filename);
          console.log(`  ✓ Downloaded: ${filename}`);
          results.push({ id: product.id, image: `/products/${filename}` });
        } catch (err) {
          console.log(`  ✗ Download failed: ${err.message}`);
          results.push({ id: product.id, image: null, error: err.message });
        }
      } else {
        console.log('  ✗ No OG image found');
        results.push({ id: product.id, image: null });
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
      results.push({ id: product.id, image: null, error: err.message });
    }
    
    console.log('');
  }

  console.log('\n=== Results ===\n');
  console.log(JSON.stringify(results, null, 2));
  
  // Save results
  fs.writeFileSync(
    path.join(outputDir, 'results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nResults saved to public/products/results.json');
}

main().catch(console.error);
