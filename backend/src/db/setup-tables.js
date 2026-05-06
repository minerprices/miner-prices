require('dotenv').config({ override: true });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://huzfnrgfcxlwvmrkoyge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1emZucmdmY3hsd3ZtcmtveWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkyNDIzMywiZXhwIjoyMDkzNTAwMjMzfQ.y8vbUqoAy4dyq5hn3bvCHp4jMaQ9tTGErr_y2fx6Bfk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTables() {
  console.log('⚙️ Setting up database tables...');

  try {
    // Insert sample miners with all required fields
    const { error: minersError } = await supabase
      .from('miners')
      .insert([
        { whattomine_id: 1, name: 'Antminer S21 Pro 234T', algorithm: 'SHA256', power_consumption: 3290, specs: { hashrate: 234 }, is_active: true },
        { whattomine_id: 2, name: 'Antminer S21 200T', algorithm: 'SHA256', power_consumption: 3080, specs: { hashrate: 200 }, is_active: true },
        { whattomine_id: 3, name: 'Antminer K7 63.5T', algorithm: 'Scrypt', power_consumption: 3348, specs: { hashrate: 63.5 }, is_active: true },
        { whattomine_id: 4, name: 'Antminer L7 9500M', algorithm: 'Scrypt', power_consumption: 3425, specs: { hashrate: 9500 }, is_active: true },
        { whattomine_id: 5, name: 'Antminer Z15 Pro 420K', algorithm: 'Equihash', power_consumption: 1800, specs: { hashrate: 420000 }, is_active: true },
        { whattomine_id: 6, name: 'Whatsminer M53S+ 56T', algorithm: 'SHA256', power_consumption: 3276, specs: { hashrate: 56 }, is_active: true },
        { whattomine_id: 7, name: 'Whatsminer M33S+ 13T', algorithm: 'SHA256', power_consumption: 1900, specs: { hashrate: 13 }, is_active: true },
        { whattomine_id: 8, name: 'Innosilicon A11 Pro 2400M', algorithm: 'Ethereum', power_consumption: 3010, specs: { hashrate: 2400 }, is_active: true },
        { whattomine_id: 9, name: 'Innosilicon A10 1300M', algorithm: 'Ethereum', power_consumption: 2350, specs: { hashrate: 1300 }, is_active: true },
        { whattomine_id: 10, name: 'Canaan AvalonMiner A1246 100T', algorithm: 'SHA256', power_consumption: 3200, specs: { hashrate: 100 }, is_active: true },
        { whattomine_id: 11, name: 'Bitmain Antminer T19 84T', algorithm: 'SHA256', power_consumption: 2800, specs: { hashrate: 84 }, is_active: true },
        { whattomine_id: 12, name: 'MicroBT Whatsminer M50S 112T', algorithm: 'SHA256', power_consumption: 3472, specs: { hashrate: 112 }, is_active: true },
        { whattomine_id: 13, name: 'Ebang Ebit E12+', algorithm: 'SHA256', power_consumption: 2646, specs: { hashrate: 44 }, is_active: true },
        { whattomine_id: 14, name: 'Innosilicon A10 Pro 750M', algorithm: 'Ethereum', power_consumption: 1350, specs: { hashrate: 750 }, is_active: true },
        { whattomine_id: 15, name: 'Goldshell CK5', algorithm: 'Kaspa', power_consumption: 750, specs: { hashrate: 2300 }, is_active: true },
      ], { upsert: true });

    if (minersError && !minersError.message.includes('duplicate')) {
      console.log('⚠️ Miners insert:', minersError.message);
    } else {
      console.log('✅ Miners table populated');
    }

    // Verify
    const { data: miners } = await supabase.from('miners').select('*').limit(1);
    if (miners?.length > 0) {
      console.log(`✅ Database ready! ${miners.length}+ miners available`);
      return true;
    }

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }

  return false;
}

module.exports = { setupTables };
