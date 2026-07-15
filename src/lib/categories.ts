// Shared constants for categories, navigation, and collection page heroes

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

export type ShopMode = 'browse' | 'category' | 'new-arrivals' | 'prime-drop'

export interface NavCategory {
  value: string
  label: string
  subcategories: { value: string; label: string }[]
  highlight?: boolean
}

export const navCategories: NavCategory[] = [
  { value: 'new-arrivals', label: 'NEW ARRIVALS', subcategories: [] },
  {
    value: 'women',
    label: 'WOMEN',
    subcategories: categorySubCategories.women,
  },
  {
    value: 'men',
    label: 'MEN',
    subcategories: categorySubCategories.men,
  },
  {
    value: 'shoes',
    label: 'SHOES',
    subcategories: categorySubCategories.shoes,
  },
  {
    value: 'belt',
    label: 'BELT',
    subcategories: categorySubCategories.belt,
  },
  { value: 'kids', label: 'KIDS', subcategories: categorySubCategories.kids },
  {
    value: 'accessories',
    label: 'ACCESSORIES',
    subcategories: categorySubCategories.accessories,
  },
  { value: 'prime-drop', label: 'PRIME DROP', subcategories: [], highlight: true },
]

export interface CategoryPageConfig {
  title: string
  subtitle: string
  description?: string
  heroImageLeft?: string
  heroImageRight?: string
  accentClass?: string
}

const categoryHeroConfig: Record<string, CategoryPageConfig> = {
  'new-arrivals': {
    title: 'NEW ARRIVALS',
    subtitle: 'FRESH STYLES JUST LANDED',
    description: 'Discover the latest drops in bags, shoes, and accessories.',
    heroImageLeft: '/products/women-shoulder-bag.png',
    heroImageRight: '/products/men-shoes.png',
    accentClass: 'text-stone-800',
  },
  'prime-drop': {
    title: 'PRIME DROP',
    subtitle: 'UP TO 50% OFF',
    description: 'Exclusive deals on our most-loved premium pieces.',
    heroImageLeft: '/products/men-shoes.png',
    heroImageRight: '/products/women-hand-bag.png',
    accentClass: 'text-rose-800',
  },
  women: {
    title: 'WOMEN',
    subtitle: 'BAGS & HANDBAGS',
    description: 'Elegant crossbody, shoulder, tote, and mini bags for every occasion.',
    heroImageLeft: '/products/women-crossbody-bag.png',
    heroImageRight: '/products/women-hand-bag-2.png',
  },
  men: {
    title: 'MEN',
    subtitle: 'BAGS & WALLETS',
    description: 'Backpacks, duffle bags, wallets, and travel essentials.',
    heroImageLeft: '/products/men-backpack.png',
    heroImageRight: '/products/men-long-wallet.png',
  },
  shoes: {
    title: 'SHOES',
    subtitle: 'STEP INTO STYLE',
    description: 'Loafers, sneakers, and runner shoes crafted for comfort.',
    heroImageLeft: '/products/men-shoes.png',
    heroImageRight: '/products/women-shoes.png',
  },
  belt: {
    title: 'BELT',
    subtitle: 'REFINED LEATHER BELTS',
    description: 'Classic leather belts for men and women.',
    heroImageLeft: '/products/men-long-wallet.png',
    heroImageRight: '/products/women-hand-bag.png',
  },
  kids: {
    title: 'KIDS',
    subtitle: 'MINI STYLES, BIG PERSONALITY',
    description: 'Fun and functional bags for the little ones.',
    heroImageLeft: '/products/women-mini-bag.png',
    heroImageRight: '/products/men-backpack.png',
  },
  accessories: {
    title: 'ACCESSORIES',
    subtitle: 'FINISHING TOUCHES',
    description: 'Leather key holders and everyday essentials.',
    heroImageLeft: '/products/men-long-wallet.png',
    heroImageRight: '/products/women-mini-bag.png',
  },
}

const subCategoryHeroImages: Record<string, { left?: string; right?: string }> = {
  'cross-body-bag': { left: '/products/women-crossbody-bag.png', right: '/products/women-mini-bag.png' },
  'shoulder-bag': { left: '/products/women-shoulder-bag.png', right: '/products/women-tote-bag.png' },
  'tote-bag': { left: '/products/women-tote-bag.png', right: '/products/women-hand-bag-2.png' },
  'hand-bag': { left: '/products/women-hand-bag.png', right: '/products/women-hand-bag-2.png' },
  'mini-bag': { left: '/products/women-mini-bag.png', right: '/products/women-crossbody-bag.png' },
  'bag-pack': { left: '/products/men-backpack.png', right: '/products/men-messenger-bag.png' },
  'duffle-bag': { left: '/products/men-backpack.png', right: '/products/men-messenger-bag.png' },
  wallet: { left: '/products/men-long-wallet.png', right: '/products/men-long-wallet.png' },
  'cosmetic-bag': { left: '/products/men-messenger-bag.png', right: '/products/women-mini-bag.png' },
  loafers: { left: '/products/men-shoes.png', right: '/products/women-shoes.png' },
  sneakers: { left: '/products/women-shoes.png', right: '/products/men-shoes.png' },
  'runner-shoes': { left: '/products/men-shoes.png', right: '/products/women-shoes.png' },
  'male-belt': { left: '/products/men-long-wallet.png', right: '/products/men-backpack.png' },
  'female-belt': { left: '/products/women-hand-bag.png', right: '/products/women-tote-bag.png' },
  'kids-bag': { left: '/products/women-mini-bag.png', right: '/products/men-backpack.png' },
  'key-holder': { left: '/products/men-long-wallet.png', right: '/products/women-mini-bag.png' },
}

export function getSubCategoryLabel(category: string, subCategory: string): string {
  const subs = categorySubCategories[category] ?? []
  return subs.find((s) => s.value === subCategory)?.label ?? subCategory
}

export function getShopPageConfig(
  shopMode: ShopMode,
  categoryFilter: string,
  subCategoryFilter: string | null
): CategoryPageConfig {
  if (shopMode === 'new-arrivals') return categoryHeroConfig['new-arrivals']
  if (shopMode === 'prime-drop') return categoryHeroConfig['prime-drop']

  const base = categoryHeroConfig[categoryFilter]
  if (!base) {
    return {
      title: 'SHOP COLLECTION',
      subtitle: 'CURATED FOR YOU',
      description: 'Browse our full range of bags, shoes, and accessories.',
      heroImageLeft: '/products/women-crossbody-bag.png',
      heroImageRight: '/products/men-shoes.png',
    }
  }

  if (subCategoryFilter) {
    const images = subCategoryHeroImages[subCategoryFilter]
    return {
      ...base,
      title: getSubCategoryLabel(categoryFilter, subCategoryFilter).toUpperCase(),
      subtitle: `${navCategories.find((c) => c.value === categoryFilter)?.label ?? categoryFilter} COLLECTION`,
      description: `Shop our ${getSubCategoryLabel(categoryFilter, subCategoryFilter).toLowerCase()} selection.`,
      heroImageLeft: images?.left ?? base.heroImageLeft,
      heroImageRight: images?.right ?? base.heroImageRight,
    }
  }

  return base
}

export function resolveShopMode(categoryValue: string): ShopMode {
  if (categoryValue === 'new-arrivals') return 'new-arrivals'
  if (categoryValue === 'prime-drop') return 'prime-drop'
  return 'category'
}
