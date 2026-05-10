import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const products = [
  // Women's Bags
  {
    name: 'GBB Exclusive Cow Leather Tote Handbag',
    description: 'Premium cow leather tote handbag with spacious interior and elegant gold-tone hardware. Perfect for everyday luxury with multiple compartments for organized storage.',
    price: 149.99,
    category: 'women',
    image: '/products/women-tote-bag.png',
    features: 'Genuine cow leather|Spacious interior|Gold-tone hardware|Interior zip pocket|Adjustable strap',
    rating: 4.8,
    inStock: true,
    badge: 'Best Seller',
  },
  {
    name: 'Elegant Crossbody Bag with Gold Chain',
    description: 'Stunning crossbody bag featuring a luxurious gold chain strap and premium leather construction. Ideal for both casual outings and evening events.',
    price: 89.99,
    category: 'women',
    image: '/products/women-crossbody-bag.png',
    features: 'Premium leather|Gold chain strap|Magnetic closure|Interior card slots|Detachable strap',
    rating: 4.7,
    inStock: true,
    badge: 'New',
  },
  {
    name: 'Luxury Shoulder Bag - Burgundy',
    description: 'Sophisticated burgundy shoulder bag crafted from genuine leather with silver hardware. A statement piece that complements any outfit with its rich color and timeless design.',
    price: 129.99,
    category: 'women',
    image: '/products/women-shoulder-bag.png',
    features: 'Genuine leather|Silver hardware|Adjustable shoulder strap|Multiple compartments|Suede lining',
    rating: 4.9,
    inStock: true,
    badge: 'Premium',
  },
  {
    name: 'Mini Bag - Rose Pink Edition',
    description: 'Chic mini bag in rose pink leather with elegant gold clasp. Compact yet functional, perfect for carrying essentials on a night out or brunch date.',
    price: 69.99,
    category: 'women',
    image: '/products/women-mini-bag.png',
    features: 'Premium leather|Gold clasp|Compact design|Interior pocket|Crossbody strap included',
    rating: 4.6,
    inStock: true,
    badge: 'New',
  },
  {
    name: 'Premium Leather Hand Bag - Cream',
    description: 'Elegant cream leather handbag with gold accents and structured silhouette. A versatile piece that transitions effortlessly from office to evening.',
    price: 159.99,
    category: 'women',
    image: '/products/women-hand-bag.png',
    features: 'Full-grain leather|Gold-tone hardware|Structured design|Interior organizer|Protective feet',
    rating: 4.8,
    inStock: true,
    badge: 'Popular',
  },
  {
    name: 'Classic Red Leather Handbag',
    description: 'Bold red leather handbag with gold chain detail. This eye-catching piece adds a pop of color and sophistication to any ensemble.',
    price: 139.99,
    category: 'women',
    image: '/products/women-hand-bag-2.png',
    features: 'Genuine leather|Gold chain detail|Spacious interior|Zip-top closure|Dust bag included',
    rating: 4.7,
    inStock: true,
    badge: 'Best Seller',
  },
  // Men's Bags
  {
    name: 'Premium Leather Backpack - Dark Brown',
    description: 'Sophisticated dark brown leather backpack with brass buckles and padded laptop compartment. Combines style with functionality for the modern professional.',
    price: 199.99,
    category: 'men',
    image: '/products/men-backpack.png',
    features: 'Full-grain leather|Brass buckles|Padded laptop compartment|Water-resistant|Ergonomic straps',
    rating: 4.9,
    inStock: true,
    badge: 'Premium',
  },
  {
    name: 'Leather Messenger Bag - Cognac',
    description: 'Classic cognac leather messenger bag with professional design and brass hardware. Ideal for business meetings and daily commute with organized compartments.',
    price: 169.99,
    category: 'men',
    image: '/products/men-messenger-bag.png',
    features: 'Genuine leather|Brass hardware|Padded shoulder strap|Document compartments|Pen holders',
    rating: 4.7,
    inStock: true,
    badge: 'New',
  },
  {
    name: 'Long Wallet - Black Premium',
    description: 'Sleek black leather long wallet with RFID protection and multiple card slots. A refined accessory for the discerning gentleman who values both security and style.',
    price: 49.99,
    category: 'men',
    image: '/products/men-long-wallet.png',
    features: 'Genuine leather|RFID protection|12 card slots|Bill compartment|Coin pocket',
    rating: 4.5,
    inStock: true,
    badge: null,
  },
  // Shoes
  {
    name: 'Oxford Dress Shoes - Dark Brown',
    description: 'Handcrafted dark brown oxford dress shoes in premium leather. Classic design meets modern comfort with cushioned insoles for all-day wear.',
    price: 129.99,
    category: 'shoes',
    image: '/products/men-shoes.png',
    features: 'Full-grain leather|Handcrafted|Cushioned insole|Leather sole|Goodyear welt',
    rating: 4.8,
    inStock: true,
    badge: 'Best Seller',
  },
  {
    name: 'High Heel Pumps - Nude Beige',
    description: 'Elegant nude beige leather pumps with comfortable block heel. Perfect for the office or a night out, combining timeless style with lasting comfort.',
    price: 99.99,
    category: 'shoes',
    image: '/products/women-shoes.png',
    features: 'Genuine leather|Block heel|Padded insole|Non-slip sole|Pointed toe',
    rating: 4.6,
    inStock: true,
    badge: 'Popular',
  },
  // Belt
  {
    name: 'Classic Leather Belt - Black',
    description: 'Premium black leather belt with silver buckle, crafted from full-grain leather. A wardrobe essential that pairs perfectly with both formal and casual attire.',
    price: 39.99,
    category: 'belt',
    image: '/products/men-belt.png',
    features: 'Full-grain leather|Silver buckle|1.25 inch width|5 hole adjustment|Gift box included',
    rating: 4.5,
    inStock: true,
    badge: null,
  },
  {
    name: "Elegant Women's Belt - Tan",
    description: 'Refined tan leather belt with gold buckle detail. This versatile accessory adds a touch of elegance to dresses, skirts, and high-waisted pants.',
    price: 34.99,
    category: 'belt',
    image: '/products/women-belt.png',
    features: 'Genuine leather|Gold buckle|Slim profile|1 inch width|Adjustable fit',
    rating: 4.4,
    inStock: true,
    badge: 'New',
  },
  // Kids
  {
    name: "Kids' Mini Backpack - Pastel",
    description: 'Adorable pastel mini backpack designed for kids with fun colors and durable construction. Lightweight and spacious enough for school or play dates.',
    price: 29.99,
    category: 'kids',
    image: '/products/kids-backpack.png',
    features: 'Durable nylon|Fun pastel colors|Padded straps|Multiple pockets|Easy-clean material',
    rating: 4.6,
    inStock: true,
    badge: 'New',
  },
  // Accessories
  {
    name: 'Leather Key Holder - Brown',
    description: 'Premium brown leather key holder with brass ring and compact design. A small luxury that keeps your keys organized while adding a touch of elegance to your daily carry.',
    price: 19.99,
    category: 'accessories',
    image: '/products/leather-key-holder.png',
    features: 'Genuine leather|Brass key ring|Holds 4-6 keys|Compact design|Gift box included',
    rating: 4.3,
    inStock: true,
    badge: 'Popular',
  },
]

export async function POST() {
  try {
    // Check if products already exist
    const existing = await db.product.count()
    if (existing > 0) {
      return NextResponse.json({ message: 'Database already seeded', count: existing })
    }

    const created = await db.product.createMany({ data: products })
    return NextResponse.json({ message: 'Database seeded successfully', count: created.count })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
