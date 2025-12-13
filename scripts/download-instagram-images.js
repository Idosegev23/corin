#!/usr/bin/env node

/**
 * Download Instagram images from shortcodes
 * Uses instaloader-like approach with direct media URLs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// All shortcodes from corrin-data.ts (posts + recipes)
const shortcodes = [
  // Posts
  'DSFWvS0DbNO', // Dove campaign
  'DRz20p7DcdS', // Cholent
  'DR7Z0uyjTYs', // Going out
  'DRuphn2DRDI', // Full hands
  'DRhvx5PDc3J', // Muffins
  'DRXbvSODcwz', // Greek salad
  // Recipes
  'DIHD8iqN4ui', // Lamb ribs
  'DIazrV1tcZY', // Cheesecake
  'DDaCePJNZkk', // Pizza
  'DKKcknENdAM', // Cheese crumble
  'DG01WAntHLd', // Pareve puree
  'DJo_Qavt4hg', // Coconut chicken
  'DQHiN0LDIHm', // Apple crumble
  'DObgpG-jY8K', // Challah
];

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'instagram');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadImage(shortcode) {
  const outputPath = path.join(OUTPUT_DIR, `${shortcode}.jpg`);
  
  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`✓ ${shortcode}.jpg already exists`);
    return true;
  }

  // Try Instagram media endpoint
  const mediaUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
  
  return new Promise((resolve) => {
    const request = https.get(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.instagram.com/',
      },
      timeout: 15000,
    }, (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
        }, (redirectResponse) => {
          if (redirectResponse.statusCode === 200) {
            const file = fs.createWriteStream(outputPath);
            redirectResponse.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log(`✓ Downloaded ${shortcode}.jpg`);
              resolve(true);
            });
          } else {
            console.log(`✗ Failed ${shortcode} - Status: ${redirectResponse.statusCode}`);
            resolve(false);
          }
        }).on('error', () => {
          console.log(`✗ Failed ${shortcode} - Network error`);
          resolve(false);
        });
        return;
      }
      
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(outputPath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded ${shortcode}.jpg`);
          resolve(true);
        });
      } else {
        console.log(`✗ Failed ${shortcode} - Status: ${response.statusCode}`);
        resolve(false);
      }
    });

    request.on('error', () => {
      console.log(`✗ Failed ${shortcode} - Network error`);
      resolve(false);
    });

    request.on('timeout', () => {
      request.destroy();
      console.log(`✗ Failed ${shortcode} - Timeout`);
      resolve(false);
    });
  });
}

async function main() {
  console.log('📷 Downloading Instagram images...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const shortcode of shortcodes) {
    const result = await downloadImage(shortcode);
    if (result) success++;
    else failed++;
    
    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n✅ Done! ${success} downloaded, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n💡 For failed images, you can manually download from:');
    shortcodes.forEach(sc => {
      const outputPath = path.join(OUTPUT_DIR, `${sc}.jpg`);
      if (!fs.existsSync(outputPath)) {
        console.log(`   https://www.instagram.com/p/${sc}/`);
      }
    });
  }
}

main();
