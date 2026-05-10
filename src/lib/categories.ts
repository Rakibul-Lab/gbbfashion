// Shared constants for categories and sub-categories
// Fashion e-commerce categories matching gbbfashion.com / thepatchee.com style

export const subCategoryMap: Record<string, string> = {
  'Croissant Chic Crossbody Bag': 'cross-body-bag',
  'Butterfly Design Shoulder Bag': 'shoulder-bag',
  'New Style Large-Capacity Shoulder Bag': 'shoulder-bag',
  'Elevated Twill Crossbody Bag': 'cross-body-bag',
  'Versatile Dumpling Shoulder Bag': 'shoulder-bag',
  'GBB Exclusive Cow Leather Tote Handbag': 'tote-bag',
  "Men's RFID Smart Pop Up Wallet": 'wallet',
  'Light Weight Fitness Training Gym Duffle Bag': 'duffle-bag',
  'The Luxe Large-Capacity Cosmetic Bag': 'cosmetic-bag',
  'Premium Leather Backpack - Dark Brown': 'bag-pack',
  'Breathable Soft-Sole Fashion Loafers': 'loafers',
  'Urban Lite Low-Top Casual Sneakers': 'sneakers',
  "Men's Suede Finish Slip On Open Back Loafers": 'loafers',
  "Men's Slip-On Moccasin Loafers": 'loafers',
  "Men's Velocity Sport High Runner Shoes": 'runner-shoes',
  "Men's Linen Breathable Fisherman Loafers": 'loafers',
  'Trend Core Urban Style Sneakers': 'sneakers',
  'Fashionable British Style Loafers': 'loafers',
  'Classic Leather Belt - Black': 'male-belt',
  "Elegant Women's Belt - Tan": 'female-belt',
  "Kids' Mini Backpack - Pastel": 'kids-bag',
  'Leather Key Holder - Brown': 'key-holder',
}

export const categorySubCategories: Record<string, { value: string; label: string }[]> = {
  women: [
    { value: 'cross-body-bag', label: 'Cross Body Bag' },
    { value: 'shoulder-bag', label: 'Shoulder Bag' },
    { value: 'tote-bag', label: 'Tote Bag' },
    { value: 'hand-bag', label: 'Hand Bag' },
    { value: 'mini-bag', label: 'Mini Bag' },
  ],
  men: [
    { value: 'bag-pack', label: 'Backpack' },
    { value: 'duffle-bag', label: 'Duffle Bag' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'cosmetic-bag', label: 'Cosmetic Bag' },
  ],
  shoes: [
    { value: 'loafers', label: 'Loafers' },
    { value: 'sneakers', label: 'Sneakers' },
    { value: 'runner-shoes', label: 'Runner Shoes' },
  ],
  belt: [
    { value: 'male-belt', label: 'Men' },
    { value: 'female-belt', label: 'Women' },
  ],
  kids: [
    { value: 'kids-bag', label: 'Kids Bags' },
  ],
  accessories: [
    { value: 'key-holder', label: 'Key Holder (Leather)' },
  ],
}

export const primeDropBadges = ['Premium', 'Best Seller', 'Popular']
