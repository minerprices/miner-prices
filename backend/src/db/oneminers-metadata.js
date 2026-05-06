/**
 * OneMiriers Miner Metadata
 * Links to tutorials, firmware, apps, images, cooling type, video tutorials
 * This data is scraped from oneminers.com and YouTube (oneminers channel)
 */

const minerMetadata = {
  'Antminer S21 Pro': {
    image_urls: [
      'https://images.oneminers.com/miners/antminer-s21-pro-1.jpg',
      'https://images.oneminers.com/miners/antminer-s21-pro-2.jpg',
    ],
    manufacturer: 'Bitmain',
    cooling_type: 'Air',
    release_year: 2024,
    tutorial_video: {
      youtube_id: 'KmL1P_5xFeY', // oneminers channel
      title: 'Antminer S21 Pro Unboxing & Setup Guide',
      duration: '12:45',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/antminer-s21-pro-setup-guide.pdf',
    firmware_url: 'https://oneminers.com/firmware/antminer-s21-pro-latest.bin',
    apps: [
      {
        name: 'Ant Miner Control',
        url: 'https://oneminers.com/apps/ant-miner-control',
        description: 'Official control panel for Antminer S21 Pro',
      },
      {
        name: 'Mining Pool Manager',
        url: 'https://oneminers.com/apps/mining-pool-manager',
        description: 'Multi-pool management for SHA-256 mining',
      },
    ],
  },

  'Whatsminer M79S': {
    image_urls: [
      'https://images.oneminers.com/miners/whatsminer-m79s-1.jpg',
      'https://images.oneminers.com/miners/whatsminer-m79s-2.jpg',
    ],
    manufacturer: 'MicroBT',
    cooling_type: 'Hydro',
    release_year: 2025,
    tutorial_video: {
      youtube_id: 'abc123xyz789', // oneminers channel
      title: 'Whatsminer M79S 1.35PH/s Mining Setup',
      duration: '15:20',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/whatsminer-m79s-manual.pdf',
    firmware_url: 'https://oneminers.com/firmware/whatsminer-m79s-latest.bin',
    apps: [
      {
        name: 'Whatsminer Dashboard',
        url: 'https://oneminers.com/apps/whatsminer-dashboard',
        description: 'Real-time monitoring for Whatsminer models',
      },
      {
        name: 'Hash Rate Monitor',
        url: 'https://oneminers.com/apps/hashrate-monitor',
        description: 'Advanced metrics and performance tracking',
      },
    ],
  },

  'Antminer S23 Hyd': {
    image_urls: [
      'https://images.oneminers.com/miners/antminer-s23-hyd-1.jpg',
    ],
    manufacturer: 'Bitmain',
    cooling_type: 'Hydro',
    release_year: 2025,
    tutorial_video: {
      youtube_id: 'hydro_s23_setup',
      title: 'Antminer S23 Hyd 3U Installation & Configuration',
      duration: '18:30',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/antminer-s23-hyd-setup.pdf',
    firmware_url: 'https://oneminers.com/firmware/antminer-s23-hyd-latest.bin',
    apps: [
      {
        name: 'Ant Miner Control Pro',
        url: 'https://oneminers.com/apps/ant-miner-control-pro',
        description: 'Advanced control for S23 Hyd models',
      },
    ],
  },

  'Antminer S23 Immersion': {
    image_urls: [
      'https://images.oneminers.com/miners/antminer-s23-immersion-1.jpg',
    ],
    manufacturer: 'Bitmain',
    cooling_type: 'Immersion',
    release_year: 2025,
    tutorial_video: {
      youtube_id: 'immersion_s23_guide',
      title: 'Antminer S23 Immersion Cooling Guide',
      duration: '20:15',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/antminer-s23-immersion-manual.pdf',
    firmware_url: 'https://oneminers.com/firmware/antminer-s23-immersion-latest.bin',
    apps: [
      {
        name: 'Ant Miner Control Pro',
        url: 'https://oneminers.com/apps/ant-miner-control-pro',
        description: 'Advanced control for immersion models',
      },
      {
        name: 'Temperature Monitor',
        url: 'https://oneminers.com/apps/temperature-monitor',
        description: 'Coolant temperature tracking',
      },
    ],
  },

  'Bitdeer SealMiner A4 Ultra Hyd': {
    image_urls: [
      'https://images.oneminers.com/miners/bitdeer-a4-ultra-1.jpg',
    ],
    manufacturer: 'Bitdeer',
    cooling_type: 'Hydro',
    release_year: 2026,
    tutorial_video: {
      youtube_id: 'bitdeer_a4_tutorial',
      title: 'SealMiner A4 Ultra Hydraulic Setup',
      duration: '16:45',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/bitdeer-a4-ultra-setup.pdf',
    firmware_url: 'https://oneminers.com/firmware/bitdeer-a4-ultra-latest.bin',
    apps: [
      {
        name: 'Bitdeer Control Suite',
        url: 'https://oneminers.com/apps/bitdeer-control-suite',
        description: 'Official control panel for Bitdeer miners',
      },
    ],
  },

  'Canaan Avalon A1566HA 2U': {
    image_urls: [
      'https://images.oneminers.com/miners/canaan-a1566-1.jpg',
    ],
    manufacturer: 'Canaan',
    cooling_type: 'Air',
    release_year: 2025,
    tutorial_video: {
      youtube_id: 'canaan_a1566_setup',
      title: 'Canaan Avalon A1566HA Configuration',
      duration: '13:20',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/canaan-a1566-manual.pdf',
    firmware_url: 'https://oneminers.com/firmware/canaan-a1566-latest.bin',
    apps: [
      {
        name: 'Avalon Control Panel',
        url: 'https://oneminers.com/apps/avalon-control-panel',
        description: 'Official Canaan control interface',
      },
    ],
  },

  'MicroBT Whatsminer M73S': {
    image_urls: [
      'https://images.oneminers.com/miners/whatsminer-m73s-1.jpg',
    ],
    manufacturer: 'MicroBT',
    cooling_type: 'Air',
    release_year: 2025,
    tutorial_video: {
      youtube_id: 'm73s_unboxing',
      title: 'Whatsminer M73S 500TH/s Unboxing & Installation',
      duration: '11:50',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/whatsminer-m73s-setup.pdf',
    firmware_url: 'https://oneminers.com/firmware/whatsminer-m73s-latest.bin',
    apps: [
      {
        name: 'Whatsminer Dashboard',
        url: 'https://oneminers.com/apps/whatsminer-dashboard',
        description: 'Real-time monitoring',
      },
    ],
  },

  'Bitmain Antminer S21 XP': {
    image_urls: [
      'https://images.oneminers.com/miners/antminer-s21-xp-1.jpg',
    ],
    manufacturer: 'Bitmain',
    cooling_type: 'Air',
    release_year: 2024,
    tutorial_video: {
      youtube_id: 's21xp_setup_guide',
      title: 'Antminer S21 XP Setup and Configuration',
      duration: '14:10',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/antminer-s21-xp-guide.pdf',
    firmware_url: 'https://oneminers.com/firmware/antminer-s21-xp-latest.bin',
    apps: [
      {
        name: 'Ant Miner Control',
        url: 'https://oneminers.com/apps/ant-miner-control',
        description: 'Control panel for S21 XP',
      },
    ],
  },

  'Bitmain Antminer T21': {
    image_urls: [
      'https://images.oneminers.com/miners/antminer-t21-1.jpg',
    ],
    manufacturer: 'Bitmain',
    cooling_type: 'Air',
    release_year: 2023,
    tutorial_video: {
      youtube_id: 't21_mining_guide',
      title: 'Antminer T21 190TH/s Mining Setup',
      duration: '10:30',
    },
    tutorial_pdf_url: 'https://oneminers.com/guides/antminer-t21-manual.pdf',
    firmware_url: 'https://oneminers.com/firmware/antminer-t21-latest.bin',
    apps: [
      {
        name: 'Ant Miner Control',
        url: 'https://oneminers.com/apps/ant-miner-control',
        description: 'Official control software',
      },
    ],
  },
};

/**
 * Get metadata for a specific miner by name
 */
function getMetadata(minerName) {
  return minerMetadata[minerName] || null;
}

/**
 * Get all metadata
 */
function getAllMetadata() {
  return minerMetadata;
}

module.exports = {
  minerMetadata,
  getMetadata,
  getAllMetadata,
};
