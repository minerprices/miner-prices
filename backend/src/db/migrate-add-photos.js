/**
 * Migration: Add photo and metadata columns to miners table
 * This runs automatically on server startup
 */

const Database = require('better-sqlite3');
const path = require('path');

function migrateAddPhotos() {
  const dbPath = path.join(__dirname, '../../minerprices.db');
  const db = new Database(dbPath);

  try {
    // Check if columns exist
    const tableInfo = db.pragma('table_info(miners)');
    const hasImageUrl = tableInfo.some(col => col.name === 'image_url');

    if (!hasImageUrl) {
      console.log('🔄 Migrating: Adding photo columns to miners table...');

      // Add missing columns (without CURRENT_TIMESTAMP default to avoid SQLite error)
      db.exec(`
        ALTER TABLE miners ADD COLUMN image_url TEXT;
        ALTER TABLE miners ADD COLUMN manufacturer TEXT;
        ALTER TABLE miners ADD COLUMN cooling_type TEXT;
        ALTER TABLE miners ADD COLUMN tutorial_video_id TEXT;
        ALTER TABLE miners ADD COLUMN tutorial_pdf_url TEXT;
        ALTER TABLE miners ADD COLUMN firmware_url TEXT;
        ALTER TABLE miners ADD COLUMN apps TEXT;
        ALTER TABLE miners ADD COLUMN updated_at DATETIME;
      `);

      console.log('✅ Migration complete: Photo columns added');
      return true;
    } else {
      console.log('ℹ️  Photo columns already exist');
      return false;
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

module.exports = { migrateAddPhotos };
