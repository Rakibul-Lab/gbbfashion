// Shared constants for categories and sub-categories
// Fashion e-commerce categories matching gbbfashion.com style

export const subCategoryMap: Record<string, string> = {
  'GBB Exclusive Cow Leather Tote Handbag': 'tote-bag',
  'Elegant Crossbody Bag with Gold Chain': 'cross-body-bag',
  'Luxury Shoulder Bag - Burgundy': 'shoulder-bag',
  'Mini Bag - Rose Pink Edition': 'mini-bag',
  'Premium Leather Hand Bag - Cream': 'hand-bag',
  'Classic Red Leather Handbag': 'hand-bag',
  'Premium Leather Backpack - Dark Brown': 'bag-pack',
  'Leather Messenger Bag - Cognac': 'bag-pack',
  'Long Wallet - Black Premium': 'long-wallet',
  "Kids' Mini Backpack - Pastel": 'kids-bag',
  'Oxford Dress Shoes - Dark Brown': 'man-shoes',
  'High Heel Pumps - Nude Beige': 'women-shoes',
  'Classic Leather Belt - Black': 'male-belt',
  'Elegant Women\'s Belt - Tan': 'female-belt',
  'Leather Key Holder - Brown': 'key-holder',
}

export const categorySubCategories: Record<string, { value: string; label: string }[]> = {
  women: [
    { value: 'hand-bag', label: 'Hand Bag' },
    { value: 'cross-body-bag', label: 'Cross Body Bag' },
    { value: 'shoulder-bag', label: 'Shoulder Bag' },
    { value: 'tote-bag', label: 'Tote Bag' },
    { value: 'mini-bag', label: 'Mini Bag' },
    { value: 'bag-pack', label: 'Bag Pack' },
  ],
  men: [
    { value: 'bag-pack', label: 'Bag Pack Bag' },
    { value: 'long-wallet', label: 'Money Bag / Long Wallet' },
  ],
  shoes: [
    { value: 'man-shoes', label: 'Man Shoes' },
    { value: 'women-shoes', label: 'Women Shoes' },
  ],
  belt: [
    { value: 'male-belt', label: 'Male' },
    { value: 'female-belt', label: 'Female' },
  ],
  kids: [
    { value: 'kids-bag', label: 'Kids Bags' },
  ],
  accessories: [
    { value: 'key-holder', label: 'Key Holder (Leather)' },
  ],
}

export const primeDropBadges = ['Premium', 'Best Seller', 'Popular']
