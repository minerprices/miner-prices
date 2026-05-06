/**
 * Initialize miner photos on server startup
 * Adds photos to existing miners without deleting data
 */

const { minerPhotos } = require('./miner-photos');

function initializeMinerPhotos(db) {
  try {
    console.log('📸 Initializing miner photos...');
    
    let updated = 0;
    
    // Get all miners
    const miners = db.prepare('SELECT id, name FROM miners').all();
    
    miners.forEach(miner => {
      const metadata = minerPhotos[miner.name];
      
      if (metadata) {
        // Check if already has photo
        const existing = db.prepare('SELECT image_url FROM miners WHERE id = ?').get(miner.id);
        
        if (!existing.image_url) {
          // Add photos
          db.prepare(`
            UPDATE miners 
            SET image_url = ?, 
                manufacturer = COALESCE(manufacturer, ?),
                cooling_type = COALESCE(cooling_type, ?),
                tutorial_video_id = COALESCE(tutorial_video_id, ?),
                tutorial_pdf_url = COALESCE(tutorial_pdf_url, ?),
                firmware_url = COALESCE(firmware_url, ?),
                apps = COALESCE(apps, ?),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(
            metadata.image_url,
            metadata.manufacturer,
            metadata.cooling_type,
            metadata.tutorial_video_id,
            metadata.tutorial_pdf_url,
            metadata.firmware_url,
            JSON.stringify(metadata.apps),
            miner.id
          );
          updated++;
        }
      }
    });
    
    if (updated > 0) {
      console.log(`✅ Added photos to ${updated} miners`);
    } else {
      console.log('ℹ️  All miners already have photos');
    }
    
    return updated;
  } catch (error) {
    console.error('❌ Error initializing photos:', error.message);
    return 0;
  }
}

module.exports = { initializeMinerPhotos };
