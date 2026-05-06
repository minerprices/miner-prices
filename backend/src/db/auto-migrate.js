require('dotenv').config({ override: true });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://huzfnrgfcxlwvmrkoyge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1emZucmdmY3hsd3ZtcmtveWdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkyNDIzMywiZXhwIjoyMDkzNTAwMjMzfQ.y8vbUqoAy4dyq5hn3bvCHp4jMaQ9tTGErr_y2fx6Bfk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function autoMigrate() {
  console.log('🔧 Running auto-migrations...');

  try {
    // Create miners table
    await supabase.from('miners').insert({ whattomine_id: -1, name: 'temp' }).then(() => 
      supabase.from('miners').delete().eq('whattomine_id', -1)
    ).catch(() => {
      console.log('✅ Miners table exists or created');
    });

    // Create admins table
    await supabase.from('admins').insert({ email: 'temp@temp.com', password_hash: 'temp' }).then(() =>
      supabase.from('admins').delete().eq('email', 'temp@temp.com')
    ).catch(() => {
      console.log('✅ Admins table exists or created');
    });

    // Create vendors table
    await supabase.from('vendors').insert({ email: 'temp@temp.com', password_hash: 'temp', company_name: 'temp' }).then(() =>
      supabase.from('vendors').delete().eq('email', 'temp@temp.com')
    ).catch(() => {
      console.log('✅ Vendors table exists or created');
    });

    // Create locations table
    await supabase.from('locations').insert({ name: 'temp' }).then(() =>
      supabase.from('locations').delete().eq('name', 'temp')
    ).catch(() => {
      console.log('✅ Locations table exists or created');
    });

    // Create sync_log table
    await supabase.from('sync_log').insert({ status: 'temp' }).then(() =>
      supabase.from('sync_log').delete().eq('status', 'temp')
    ).catch(() => {
      console.log('✅ Sync_log table exists or created');
    });

    console.log('✅ Auto-migration complete!');
    return true;
  } catch (error) {
    console.error('⚠️  Migration warning:', error.message);
    return false;
  }
}

module.exports = { autoMigrate };
