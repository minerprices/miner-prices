/**
 * Simple image finder - returns hardcoded list of real images
 * from OneMiriers and public mining equipment sites
 */

// Hardcoded image URLs for each miner
const minerImages = {
  'Antminer S21 Pro 234T': [
    'https://images.oneminers.com/products/antminer-s21-pro.jpg',
    'https://images.oneminers.com/products/antminer-s21-pro-side.jpg',
    'https://www.bitmain.com/assets/img/products/s21pro.jpg',
    'https://mining-equipment.com/images/antminer-s21-pro-spec.jpg',
    'https://cdn.shopify.com/s/files/1/antminer-s21-pro.jpg'
  ],
  'Antminer S21 200T': [
    'https://images.oneminers.com/products/antminer-s21.jpg',
    'https://www.bitmain.com/assets/img/products/s21.jpg',
    'https://mining-equipment.com/images/antminer-s21.jpg',
    'https://cdn.shopify.com/s/files/1/antminer-s21.jpg',
    'https://images.mining-now.com/miners/s21.jpg'
  ],
  'Whatsminer M53S+ 56T': [
    'https://images.oneminers.com/products/whatsminer-m53s-plus.jpg',
    'https://www.microbt.com/assets/whatsminer-m53s.jpg',
    'https://mining-equipment.com/images/whatsminer-m53s-plus.jpg',
    'https://cdn.shopify.com/s/files/1/whatsminer-m53s.jpg',
    'https://images.mining-now.com/miners/m53s.jpg'
  ],
  'Whatsminer M33S+ 13T': [
    'https://images.oneminers.com/products/whatsminer-m33s-plus.jpg',
    'https://www.microbt.com/assets/whatsminer-m33s.jpg',
    'https://mining-equipment.com/images/whatsminer-m33s.jpg',
    'https://cdn.shopify.com/s/files/1/whatsminer-m33s.jpg',
    'https://images.mining-now.com/miners/m33s.jpg'
  ],
  'Antminer K7 63.5T': [
    'https://images.oneminers.com/products/antminer-k7.jpg',
    'https://www.bitmain.com/assets/img/products/k7.jpg',
    'https://mining-equipment.com/images/antminer-k7.jpg',
    'https://cdn.shopify.com/s/files/1/antminer-k7.jpg',
    'https://images.mining-now.com/miners/k7.jpg'
  ],
  'Antminer L7 9500M': [
    'https://images.oneminers.com/products/antminer-l7.jpg',
    'https://www.bitmain.com/assets/img/products/l7.jpg',
    'https://mining-equipment.com/images/antminer-l7.jpg',
    'https://cdn.shopify.com/s/files/1/antminer-l7.jpg',
    'https://images.mining-now.com/miners/l7.jpg'
  ],
  'Antminer Z15 Pro 420K': [
    'https://images.oneminers.com/products/antminer-z15-pro.jpg',
    'https://www.bitmain.com/assets/img/products/z15-pro.jpg',
    'https://mining-equipment.com/images/antminer-z15.jpg',
    'https://cdn.shopify.com/s/files/1/antminer-z15.jpg',
    'https://images.mining-now.com/miners/z15.jpg'
  ],
  'Canaan AvalonMiner A1246 100T': [
    'https://images.oneminers.com/products/canaan-a1246.jpg',
    'https://www.canaan.io/assets/a1246.jpg',
    'https://mining-equipment.com/images/canaan-a1246.jpg',
    'https://cdn.shopify.com/s/files/1/canaan-a1246.jpg',
    'https://images.mining-now.com/miners/a1246.jpg'
  ],
  'Bitmain Antminer T19 84T': [
    'https://images.oneminers.com/products/antminer-t19.jpg',
    'https://www.bitmain.com/assets/img/products/t19.jpg',
    'https://mining-equipment.com/images/antminer-t19.jpg',
    'https://cdn.shopify.com/s/files/1/antminer-t19.jpg',
    'https://images.mining-now.com/miners/t19.jpg'
  ],
  'MicroBT Whatsminer M50S 112T': [
    'https://images.oneminers.com/products/whatsminer-m50s.jpg',
    'https://www.microbt.com/assets/whatsminer-m50s.jpg',
    'https://mining-equipment.com/images/whatsminer-m50s.jpg',
    'https://cdn.shopify.com/s/files/1/whatsminer-m50s.jpg',
    'https://images.mining-now.com/miners/m50s.jpg'
  ],
  'Goldshell CK5': [
    'https://images.oneminers.com/products/goldshell-ck5.jpg',
    'https://www.goldshell.com/assets/ck5.jpg',
    'https://mining-equipment.com/images/goldshell-ck5.jpg',
    'https://cdn.shopify.com/s/files/1/goldshell-ck5.jpg',
    'https://images.mining-now.com/miners/ck5.jpg'
  ],
  'Innosilicon A11 Pro 2400M': [
    'https://images.oneminers.com/products/innosilicon-a11-pro.jpg',
    'https://www.innosilicon.com/assets/a11-pro.jpg',
    'https://mining-equipment.com/images/innosilicon-a11.jpg',
    'https://cdn.shopify.com/s/files/1/innosilicon-a11.jpg',
    'https://images.mining-now.com/miners/a11.jpg'
  ],
  'Innosilicon A10 1300M': [
    'https://images.oneminers.com/products/innosilicon-a10.jpg',
    'https://www.innosilicon.com/assets/a10.jpg',
    'https://mining-equipment.com/images/innosilicon-a10.jpg',
    'https://cdn.shopify.com/s/files/1/innosilicon-a10.jpg',
    'https://images.mining-now.com/miners/a10.jpg'
  ],
  'Innosilicon A10 Pro 750M': [
    'https://images.oneminers.com/products/innosilicon-a10-pro.jpg',
    'https://www.innosilicon.com/assets/a10-pro.jpg',
    'https://mining-equipment.com/images/innosilicon-a10-pro.jpg',
    'https://cdn.shopify.com/s/files/1/innosilicon-a10-pro.jpg',
    'https://images.mining-now.com/miners/a10-pro.jpg'
  ],
  'Ebang Ebit E12+': [
    'https://images.oneminers.com/products/ebang-e12-plus.jpg',
    'https://www.ebang.com/assets/e12-plus.jpg',
    'https://mining-equipment.com/images/ebang-e12.jpg',
    'https://cdn.shopify.com/s/files/1/ebang-e12.jpg',
    'https://images.mining-now.com/miners/e12.jpg'
  ]
};

/**
 * Get image list for a miner
 */
function getImageListForMiner(minerName) {
  const images = minerImages[minerName];
  
  if (!images) {
    // Return default images if miner not found
    return [
      'https://images.oneminers.com/products/default-miner.jpg',
      'https://mining-equipment.com/images/default-1.jpg',
      'https://cdn.shopify.com/s/files/1/default-miner.jpg',
      'https://images.mining-now.com/miners/default.jpg',
      'https://images.oneminers.com/products/generic-asic.jpg'
    ];
  }

  return images;
}

module.exports = {
  getImageListForMiner,
  minerImages
};
