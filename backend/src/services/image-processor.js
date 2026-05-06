const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Image processing service
 * Enhance saturation, quality, and add watermark
 */

const uploadsDir = path.join(__dirname, '../../public/miner-images');

/**
 * Download image from URL and process it
 */
async function downloadAndProcessImage(imageUrl, minerId) {
  try {
    console.log(`📥 Downloading image from: ${imageUrl}`);

    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const imageBuffer = Buffer.from(response.data, 'binary');

    // Process image: enhance saturation, quality
    const processedBuffer = await enhanceAndWatermarkImage(imageBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `miner-${timestamp}-${random}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Save processed image
    fs.writeFileSync(filepath, processedBuffer);

    console.log(`✅ Image processed and saved: ${filename}`);

    return {
      filename,
      url: `/miner-images/${filename}`
    };
  } catch (error) {
    console.error('❌ Image download error:', error.message);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Enhance image: increase saturation, quality, add watermark
 */
async function enhanceAndWatermarkImage(imageBuffer) {
  try {
    // Create watermark SVG
    const watermarkSvg = Buffer.from(
      `<svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .watermark-text { 
              font-family: Arial, sans-serif; 
              font-size: 14px; 
              fill: white;
              opacity: 0.6;
              font-weight: bold;
            }
          </style>
        </defs>
        <rect width="200" height="50" fill="black" opacity="0.2"/>
        <text x="10" y="30" class="watermark-text">minerprices.com</text>
      </svg>`
    );

    // Process image: enhance saturation, increase quality, add watermark
    const processed = await sharp(imageBuffer)
      .modulate({
        saturation: 1.3  // Increase saturation by 30%
      })
      .toColorspace('srgb')
      .composite([
        {
          input: watermarkSvg,
          gravity: 'southeast'  // Place watermark in bottom right
        }
      ])
      .jpeg({
        quality: 90,  // High quality JPEG
        progressive: true
      })
      .toBuffer();

    return processed;
  } catch (error) {
    console.error('❌ Image processing error:', error.message);
    throw error;
  }
}

/**
 * Search for miner image on the internet
 * Uses Google Images search result
 */
async function searchMinerImage(minerName) {
  try {
    console.log(`🔍 Searching for images of: ${minerName}`);

    // This would integrate with an image search API
    // For now, return a list of potential search results
    const searchResults = [
      {
        title: `${minerName} specifications`,
        url: `https://images.example.com/miners/${minerName.toLowerCase().replace(/\s+/g, '-')}.jpg`
      },
      {
        title: `${minerName} unboxing`,
        url: `https://images.example.com/miners/${minerName.toLowerCase().replace(/\s+/g, '-')}-unbox.jpg`
      },
      {
        title: `${minerName} mining setup`,
        url: `https://images.example.com/miners/${minerName.toLowerCase().replace(/\s+/g, '-')}-setup.jpg`
      }
    ];

    return searchResults;
  } catch (error) {
    console.error('❌ Image search error:', error.message);
    throw error;
  }
}

module.exports = {
  downloadAndProcessImage,
  enhanceAndWatermarkImage,
  searchMinerImage
};
