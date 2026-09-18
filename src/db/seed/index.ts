/**
 * Development seed script.
 *
 * Usage: npx tsx src/db/seed/index.ts
 *
 * This populates the database with realistic demo data: categories,
 * products with multiple variants, users (including one admin), reviews,
 * coupons, and a couple of sample orders. All passwords below are
 * DEVELOPMENT-ONLY placeholders — never reuse them in production.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db";
import {
  addresses,
  cartItems,
  carts,
  categories,
  coupons,
  notifications,
  orderItems,
  orders,
  productImages,
  productVariants,
  products,
  reviews,
  users,
  wishlistItems,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

type SeedVariant = { color: string; size: string; sku: string; stock: number; priceOverride?: number };
type SeedProduct = {
  name: string;
  slug: string;
  categorySlug: string;
  brand: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  compareAtPrice?: number;
  sku: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  images: string[];
  variants: SeedVariant[];
};

const CATEGORIES = [
  { name: "Men's Clothing", slug: "mens-clothing", description: "Everyday essentials and statement pieces for men.", imageUrl: "https://images.pexels.com/photos/19461584/pexels-photo-19461584.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { name: "Women's Clothing", slug: "womens-clothing", description: "Modern silhouettes and timeless fabrics for women.", imageUrl: "https://images.pexels.com/photos/8125856/pexels-photo-8125856.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { name: "Footwear", slug: "footwear", description: "Sneakers, boots, and running shoes for every step.", imageUrl: "https://images.pexels.com/photos/27988921/pexels-photo-27988921.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { name: "Electronics", slug: "electronics", description: "Audio, cameras, and gadgets for modern living.", imageUrl: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { name: "Accessories", slug: "accessories", description: "Bags, eyewear, and finishing touches.", imageUrl: "https://images.pexels.com/photos/12877069/pexels-photo-12877069.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { name: "Home & Living", slug: "home-living", description: "Decor and essentials for a beautiful home.", imageUrl: "https://images.pexels.com/photos/14781780/pexels-photo-14781780.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { name: "Beauty", slug: "beauty", description: "Skincare and self-care staples.", imageUrl: "https://images.pexels.com/photos/20382236/pexels-photo-20382236.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
  { name: "Watches", slug: "watches", description: "Timepieces for every occasion.", imageUrl: "https://images.pexels.com/photos/13273982/pexels-photo-13273982.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
];

const img = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900`;

const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: "Premium Pullover Hoodie",
    slug: "premium-pullover-hoodie",
    categorySlug: "mens-clothing",
    brand: "Luxora Basics",
    description: "Our best-selling hoodie made from heavyweight brushed cotton fleece for all-day comfort. Ribbed cuffs and a kangaroo pocket complete the classic silhouette.",
    shortDescription: "Heavyweight brushed cotton fleece hoodie.",
    basePrice: 59.99,
    compareAtPrice: 79.99,
    sku: "MC-HOOD-001",
    isFeatured: true,
    images: [img("19461584"), img("19461583")],
    variants: [
      { color: "Black", size: "S", sku: "MC-HOOD-001-BLK-S", stock: 18 },
      { color: "Black", size: "M", sku: "MC-HOOD-001-BLK-M", stock: 22 },
      { color: "Black", size: "L", sku: "MC-HOOD-001-BLK-L", stock: 4 },
      { color: "Gray", size: "S", sku: "MC-HOOD-001-GRY-S", stock: 12 },
      { color: "Gray", size: "M", sku: "MC-HOOD-001-GRY-M", stock: 0 },
      { color: "Gray", size: "L", sku: "MC-HOOD-001-GRY-L", stock: 9 },
    ],
  },
  {
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    categorySlug: "mens-clothing",
    brand: "Luxora Denim Co.",
    description: "A timeless denim jacket cut from mid-weight rigid denim that softens beautifully with wear. Button-through front and chest pockets.",
    shortDescription: "Mid-weight rigid denim jacket.",
    basePrice: 89.99,
    sku: "MC-JACK-002",
    images: [img("3649765"), img("7202986")],
    variants: [
      { color: "Indigo", size: "S", sku: "MC-JACK-002-IND-S", stock: 10 },
      { color: "Indigo", size: "M", sku: "MC-JACK-002-IND-M", stock: 15 },
      { color: "Indigo", size: "L", sku: "MC-JACK-002-IND-L", stock: 8 },
      { color: "Indigo", size: "XL", sku: "MC-JACK-002-IND-XL", stock: 3 },
    ],
  },
  {
    name: "Everyday Crewneck Tee",
    slug: "everyday-crewneck-tee",
    categorySlug: "mens-clothing",
    brand: "Luxora Basics",
    description: "A soft, breathable everyday tee made from combed cotton jersey. Pre-shrunk for a lasting fit.",
    shortDescription: "Combed cotton jersey crewneck tee.",
    basePrice: 24.99,
    sku: "MC-TEE-003",
    isNewArrival: true,
    images: [img("4295985")],
    variants: [
      { color: "White", size: "S", sku: "MC-TEE-003-WHT-S", stock: 30 },
      { color: "White", size: "M", sku: "MC-TEE-003-WHT-M", stock: 28 },
      { color: "White", size: "L", sku: "MC-TEE-003-WHT-L", stock: 20 },
      { color: "Black", size: "S", sku: "MC-TEE-003-BLK-S", stock: 25 },
      { color: "Black", size: "M", sku: "MC-TEE-003-BLK-M", stock: 5 },
      { color: "Black", size: "L", sku: "MC-TEE-003-BLK-L", stock: 17 },
    ],
  },
  {
    name: "Relaxed Fit Joggers",
    slug: "relaxed-fit-joggers",
    categorySlug: "mens-clothing",
    brand: "Luxora Basics",
    description: "Relaxed-fit joggers with an elastic waistband and tapered ankle cuffs, perfect for lounging or errands.",
    shortDescription: "Tapered fleece joggers.",
    basePrice: 44.99,
    sku: "MC-JOG-004",
    images: [img("20248582")],
    variants: [
      { color: "Charcoal", size: "S", sku: "MC-JOG-004-CHR-S", stock: 14 },
      { color: "Charcoal", size: "M", sku: "MC-JOG-004-CHR-M", stock: 19 },
      { color: "Charcoal", size: "L", sku: "MC-JOG-004-CHR-L", stock: 11 },
    ],
  },
  {
    name: "Women's Wrap Midi Dress",
    slug: "womens-wrap-midi-dress",
    categorySlug: "womens-clothing",
    brand: "Luxora Atelier",
    description: "An elegant wrap dress in a fluid crepe fabric with a flattering V-neckline and adjustable waist tie.",
    shortDescription: "Fluid crepe wrap dress.",
    basePrice: 69.99,
    compareAtPrice: 94.99,
    sku: "WC-DRSS-005",
    isFeatured: true,
    images: [img("8125856")],
    variants: [
      { color: "Red", size: "S", sku: "WC-DRSS-005-RED-S", stock: 9 },
      { color: "Red", size: "M", sku: "WC-DRSS-005-RED-M", stock: 12 },
      { color: "Red", size: "L", sku: "WC-DRSS-005-RED-L", stock: 6 },
      { color: "Navy", size: "S", sku: "WC-DRSS-005-NVY-S", stock: 10 },
      { color: "Navy", size: "M", sku: "WC-DRSS-005-NVY-M", stock: 2 },
      { color: "Navy", size: "L", sku: "WC-DRSS-005-NVY-L", stock: 7 },
    ],
  },
  {
    name: "Silk Button-Up Blouse",
    slug: "silk-button-up-blouse",
    categorySlug: "womens-clothing",
    brand: "Luxora Atelier",
    description: "A lustrous silk blouse with mother-of-pearl buttons and a relaxed, drapey fit that pairs with everything.",
    shortDescription: "100% mulberry silk blouse.",
    basePrice: 54.99,
    sku: "WC-BLSE-006",
    images: [img("8125856")],
    variants: [
      { color: "Ivory", size: "XS", sku: "WC-BLSE-006-IVR-XS", stock: 6 },
      { color: "Ivory", size: "S", sku: "WC-BLSE-006-IVR-S", stock: 13 },
      { color: "Ivory", size: "M", sku: "WC-BLSE-006-IVR-M", stock: 10 },
      { color: "Ivory", size: "L", sku: "WC-BLSE-006-IVR-L", stock: 4 },
    ],
  },
  {
    name: "Pleated Midi Skirt",
    slug: "pleated-midi-skirt",
    categorySlug: "womens-clothing",
    brand: "Luxora Atelier",
    description: "A fluid pleated midi skirt with a comfortable elastic waistband, designed to move beautifully.",
    shortDescription: "Fluid pleated midi skirt.",
    basePrice: 49.99,
    sku: "WC-SKRT-007",
    images: [img("39340297")],
    variants: [
      { color: "Black", size: "S", sku: "WC-SKRT-007-BLK-S", stock: 11 },
      { color: "Black", size: "M", sku: "WC-SKRT-007-BLK-M", stock: 8 },
      { color: "Black", size: "L", sku: "WC-SKRT-007-BLK-L", stock: 5 },
    ],
  },
  {
    name: "Studio Yoga Leggings",
    slug: "studio-yoga-leggings",
    categorySlug: "womens-clothing",
    brand: "Luxora Active",
    description: "High-waisted leggings with four-way stretch fabric and a hidden waistband pocket for on-the-go essentials.",
    shortDescription: "Four-way stretch yoga leggings.",
    basePrice: 39.99,
    sku: "WC-LEGG-008",
    isNewArrival: true,
    images: [img("8125856")],
    variants: [
      { color: "Black", size: "XS", sku: "WC-LEGG-008-BLK-XS", stock: 20 },
      { color: "Black", size: "S", sku: "WC-LEGG-008-BLK-S", stock: 25 },
      { color: "Black", size: "M", sku: "WC-LEGG-008-BLK-M", stock: 17 },
      { color: "Black", size: "L", sku: "WC-LEGG-008-BLK-L", stock: 3 },
    ],
  },
  {
    name: "Classic Canvas Sneakers",
    slug: "classic-canvas-sneakers",
    categorySlug: "footwear",
    brand: "Luxora Footwear",
    description: "Low-top canvas sneakers with a vulcanized rubber sole for everyday comfort and durability.",
    shortDescription: "Vulcanized rubber-sole canvas sneakers.",
    basePrice: 64.99,
    sku: "FW-SNKR-009",
    images: [img("27988921"), img("27988920")],
    variants: [
      { color: "White", size: "7", sku: "FW-SNKR-009-WHT-7", stock: 14 },
      { color: "White", size: "8", sku: "FW-SNKR-009-WHT-8", stock: 16 },
      { color: "White", size: "9", sku: "FW-SNKR-009-WHT-9", stock: 9 },
      { color: "White", size: "10", sku: "FW-SNKR-009-WHT-10", stock: 2 },
    ],
  },
  {
    name: "UrbanTrail Running Shoes",
    slug: "urbantrail-running-shoes",
    categorySlug: "footwear",
    brand: "Luxora Athletics",
    description: "Lightweight running shoes with responsive cushioning and a breathable knit upper for long-distance comfort.",
    shortDescription: "Breathable knit running shoes.",
    basePrice: 84.99,
    compareAtPrice: 109.99,
    sku: "FW-RUN-010",
    isFeatured: true,
    images: [img("27988922"), img("27988921")],
    variants: [
      { color: "Black", size: "8", sku: "FW-RUN-010-BLK-8", stock: 12 },
      { color: "Black", size: "9", sku: "FW-RUN-010-BLK-9", stock: 15 },
      { color: "Black", size: "10", sku: "FW-RUN-010-BLK-10", stock: 6 },
      { color: "Gray", size: "8", sku: "FW-RUN-010-GRY-8", stock: 10 },
      { color: "Gray", size: "9", sku: "FW-RUN-010-GRY-9", stock: 0 },
      { color: "Gray", size: "10", sku: "FW-RUN-010-GRY-10", stock: 8 },
    ],
  },
  {
    name: "Leather Chelsea Boots",
    slug: "leather-chelsea-boots",
    categorySlug: "footwear",
    brand: "Luxora Footwear",
    description: "Handcrafted leather Chelsea boots with elastic side panels and a durable stacked heel.",
    shortDescription: "Handcrafted leather Chelsea boots.",
    basePrice: 129.99,
    sku: "FW-BOOT-011",
    images: [img("27988920")],
    variants: [
      { color: "Brown", size: "8", sku: "FW-BOOT-011-BRN-8", stock: 7 },
      { color: "Brown", size: "9", sku: "FW-BOOT-011-BRN-9", stock: 9 },
      { color: "Brown", size: "10", sku: "FW-BOOT-011-BRN-10", stock: 4 },
      { color: "Brown", size: "11", sku: "FW-BOOT-011-BRN-11", stock: 3 },
    ],
  },
  {
    name: "AeroSound Wireless Headphones",
    slug: "aerosound-wireless-headphones",
    categorySlug: "electronics",
    brand: "Luxora Audio",
    description: "Over-ear wireless headphones with active noise cancellation, 30-hour battery life, and plush memory-foam ear cushions.",
    shortDescription: "ANC wireless over-ear headphones.",
    basePrice: 129.99,
    compareAtPrice: 159.99,
    sku: "EL-HEAD-012",
    isFeatured: true,
    images: [img("3394650"), img("3394653")],
    variants: [
      { color: "Black", size: "One Size", sku: "EL-HEAD-012-BLK", stock: 24 },
      { color: "White", size: "One Size", sku: "EL-HEAD-012-WHT", stock: 16 },
    ],
  },
  {
    name: "PulseFit Smart Earbuds",
    slug: "pulsefit-smart-earbuds",
    categorySlug: "electronics",
    brand: "Luxora Audio",
    description: "True wireless earbuds with heart-rate sensing, sweat resistance, and a compact charging case.",
    shortDescription: "True wireless fitness earbuds.",
    basePrice: 79.99,
    sku: "EL-BUD-013",
    isNewArrival: true,
    images: [img("3394651")],
    variants: [
      { color: "Black", size: "One Size", sku: "EL-BUD-013-BLK", stock: 30 },
    ],
  },
  {
    name: "TravelCam Instant Camera",
    slug: "travelcam-instant-camera",
    categorySlug: "electronics",
    brand: "Luxora Optics",
    description: "A compact instant camera with automatic exposure and a built-in flash for spontaneous memories.",
    shortDescription: "Compact automatic instant camera.",
    basePrice: 99.99,
    sku: "EL-CAM-014",
    images: [img("33037170")],
    variants: [{ color: "Black", size: "One Size", sku: "EL-CAM-014-BLK", stock: 13 }],
  },
  {
    name: "Heritage Leather Tote Bag",
    slug: "heritage-leather-tote-bag",
    categorySlug: "accessories",
    brand: "Luxora Leather Co.",
    description: "A full-grain leather tote with an interior laptop sleeve, magnetic closure, and reinforced handles.",
    shortDescription: "Full-grain leather laptop tote.",
    basePrice: 119.99,
    sku: "AC-TOTE-015",
    isFeatured: true,
    images: [img("12877069")],
    variants: [
      { color: "Tan", size: "One Size", sku: "AC-TOTE-015-TAN", stock: 11 },
      { color: "Black", size: "One Size", sku: "AC-TOTE-015-BLK", stock: 8 },
    ],
  },
  {
    name: "Aviator Sunglasses",
    slug: "aviator-sunglasses",
    categorySlug: "accessories",
    brand: "Luxora Eyewear",
    description: "Classic aviator sunglasses with polarized UV400 lenses and a lightweight titanium frame.",
    shortDescription: "Polarized titanium aviator sunglasses.",
    basePrice: 49.99,
    sku: "AC-SUNG-016",
    images: [img("29811437")],
    variants: [
      { color: "Gold", size: "One Size", sku: "AC-SUNG-016-GLD", stock: 20 },
      { color: "Black", size: "One Size", sku: "AC-SUNG-016-BLK", stock: 18 },
    ],
  },
  {
    name: "Woven Leather Belt",
    slug: "woven-leather-belt",
    categorySlug: "accessories",
    brand: "Luxora Leather Co.",
    description: "A hand-woven leather belt with a polished brass buckle, versatile enough for casual or formal wear.",
    shortDescription: "Hand-woven leather belt.",
    basePrice: 34.99,
    sku: "AC-BELT-017",
    images: [img("12877069")],
    variants: [
      { color: "Brown", size: "M", sku: "AC-BELT-017-BRN-M", stock: 15 },
      { color: "Brown", size: "L", sku: "AC-BELT-017-BRN-L", stock: 9 },
    ],
  },
  {
    name: "Nordic Ceramic Vase Set",
    slug: "nordic-ceramic-vase-set",
    categorySlug: "home-living",
    brand: "Luxora Home",
    description: "A set of two hand-glazed ceramic vases in complementary neutral tones, perfect for dried or fresh arrangements.",
    shortDescription: "Set of two hand-glazed ceramic vases.",
    basePrice: 34.99,
    sku: "HL-VASE-018",
    images: [img("14781780"), img("39340297")],
    variants: [{ color: "Natural", size: "One Size", sku: "HL-VASE-018-NAT", stock: 22 }],
  },
  {
    name: "Aromatic Soy Candle Trio",
    slug: "aromatic-soy-candle-trio",
    categorySlug: "home-living",
    brand: "Luxora Home",
    description: "Three hand-poured soy candles in warm, comforting scents with 40+ hour burn times each.",
    shortDescription: "Hand-poured soy candle set of three.",
    basePrice: 29.99,
    sku: "HL-CNDL-019",
    isNewArrival: true,
    images: [img("14593892")],
    variants: [{ color: "Vanilla & Amber", size: "One Size", sku: "HL-CNDL-019-VAN", stock: 26 }],
  },
  {
    name: "Minimalist Ceramic Table Lamp",
    slug: "minimalist-ceramic-table-lamp",
    categorySlug: "home-living",
    brand: "Luxora Home",
    description: "A soft-glow table lamp with a hand-thrown ceramic base and a linen drum shade.",
    shortDescription: "Ceramic base linen shade table lamp.",
    basePrice: 59.99,
    sku: "HL-LAMP-020",
    images: [img("5754116")],
    variants: [{ color: "White", size: "One Size", sku: "HL-LAMP-020-WHT", stock: 10 }],
  },
  {
    name: "Hydrating Vitamin C Serum",
    slug: "hydrating-vitamin-c-serum",
    categorySlug: "beauty",
    brand: "Luxora Skin",
    description: "A brightening serum with 15% vitamin C and hyaluronic acid to visibly even skin tone and boost hydration.",
    shortDescription: "15% vitamin C brightening serum.",
    basePrice: 32.99,
    sku: "BT-SRUM-021",
    isFeatured: true,
    images: [img("20382236")],
    variants: [{ color: "30ml", size: "One Size", sku: "BT-SRUM-021-30", stock: 40 }],
  },
  {
    name: "Nourishing Lip Oil Set",
    slug: "nourishing-lip-oil-set",
    categorySlug: "beauty",
    brand: "Luxora Skin",
    description: "A trio of glossy, nourishing lip oils infused with jojoba and vitamin E for soft, healthy-looking lips.",
    shortDescription: "Set of three nourishing lip oils.",
    basePrice: 19.99,
    sku: "BT-LIP-022",
    images: [img("31251024")],
    variants: [{ color: "Set of 3", size: "One Size", sku: "BT-LIP-022-SET", stock: 35 }],
  },
  {
    name: "Renewal Overnight Cream",
    slug: "renewal-overnight-cream",
    categorySlug: "beauty",
    brand: "Luxora Skin",
    description: "A rich overnight cream with peptides and ceramides that works while you sleep to restore skin's barrier.",
    shortDescription: "Peptide & ceramide overnight cream.",
    basePrice: 42.99,
    sku: "BT-CRM-023",
    images: [img("16329382")],
    variants: [{ color: "50ml", size: "One Size", sku: "BT-CRM-023-50", stock: 18 }],
  },
  {
    name: "Heritage Chronograph Watch",
    slug: "heritage-chronograph-watch",
    categorySlug: "watches",
    brand: "Luxora Timepieces",
    description: "A precision chronograph movement housed in a stainless steel case with a genuine leather strap.",
    shortDescription: "Stainless steel chronograph watch.",
    basePrice: 189.99,
    compareAtPrice: 229.99,
    sku: "WT-CHRN-024",
    isFeatured: true,
    images: [img("13273982"), img("13273980")],
    variants: [{ color: "Brown Leather", size: "One Size", sku: "WT-CHRN-024-BRN", stock: 9 }],
  },
  {
    name: "Minimalist Steel Watch",
    slug: "minimalist-steel-watch",
    categorySlug: "watches",
    brand: "Luxora Timepieces",
    description: "A clean, minimalist watch with a sunburst dial and a brushed stainless steel bracelet.",
    shortDescription: "Sunburst dial steel bracelet watch.",
    basePrice: 149.99,
    sku: "WT-MIN-025",
    images: [img("13273983")],
    variants: [
      { color: "Black", size: "One Size", sku: "WT-MIN-025-BLK", stock: 14 },
      { color: "Silver", size: "One Size", sku: "WT-MIN-025-SLV", stock: 2 },
    ],
  },
  {
    name: "Rose Gold Bracelet Watch",
    slug: "rose-gold-bracelet-watch",
    categorySlug: "watches",
    brand: "Luxora Timepieces",
    description: "An elegant bracelet watch finished in warm rose gold tones with a mother-of-pearl dial.",
    shortDescription: "Rose gold mother-of-pearl watch.",
    basePrice: 169.99,
    sku: "WT-ROSE-026",
    isNewArrival: true,
    images: [img("30746010")],
    variants: [{ color: "Rose Gold", size: "One Size", sku: "WT-ROSE-026-RSG", stock: 11 }],
  },
];

async function main() {
  console.log("Seeding database...");

  // Wipe existing data (development only) in FK-safe order.
  await db.delete(notifications);
  await db.delete(wishlistItems);
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(reviews);
  await db.delete(productVariants);
  await db.delete(productImages);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(addresses);
  await db.delete(coupons);
  await db.delete(users);

  const categoryRows = await db.insert(categories).values(CATEGORIES).returning();
  const categoryBySlug = new Map(categoryRows.map((c) => [c.slug, c]));

  const variantIndex = new Map<string, number>();

  for (const seedProduct of SEED_PRODUCTS) {
    const category = categoryBySlug.get(seedProduct.categorySlug);
    if (!category) throw new Error(`Unknown category slug: ${seedProduct.categorySlug}`);

    const [product] = await db
      .insert(products)
      .values({
        name: seedProduct.name,
        slug: seedProduct.slug,
        description: seedProduct.description,
        shortDescription: seedProduct.shortDescription,
        brand: seedProduct.brand,
        categoryId: category.id,
        basePrice: seedProduct.basePrice.toFixed(2),
        compareAtPrice: seedProduct.compareAtPrice ? seedProduct.compareAtPrice.toFixed(2) : null,
        sku: seedProduct.sku,
        isFeatured: seedProduct.isFeatured ?? false,
        isNewArrival: seedProduct.isNewArrival ?? false,
      })
      .returning();

    await db.insert(productImages).values(
      seedProduct.images.map((url, index) => ({
        productId: product.id,
        url,
        altText: seedProduct.name,
        position: index,
        isPrimary: index === 0,
      }))
    );

    const insertedVariants = await db
      .insert(productVariants)
      .values(
        seedProduct.variants.map((variant) => ({
          productId: product.id,
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          stock: variant.stock,
          priceOverride: variant.priceOverride ? variant.priceOverride.toFixed(2) : null,
        }))
      )
      .returning();

    insertedVariants.forEach((v, i) => variantIndex.set(`${product.slug}:${i}`, v.id));
    productsBySlug.set(product.slug, { product, variants: insertedVariants });
  }

  // Users
  const adminPasswordHash = await hashPassword("Admin123!");
  const customerPasswordHash = await hashPassword("Customer123!");

  const [admin] = await db
    .insert(users)
    .values({ name: "Alex Morgan", email: "admin@luxora.dev", passwordHash: adminPasswordHash, role: "admin" })
    .returning();

  const [jane] = await db
    .insert(users)
    .values({ name: "Jane Doe", email: "jane@example.com", passwordHash: customerPasswordHash, role: "customer", phone: "+1-555-0100" })
    .returning();

  const [mike] = await db
    .insert(users)
    .values({ name: "Mike Chen", email: "mike@example.com", passwordHash: customerPasswordHash, role: "customer", phone: "+1-555-0101" })
    .returning();

  // Addresses
  const [janeAddress] = await db
    .insert(addresses)
    .values({
      userId: jane.id,
      fullName: "Jane Doe",
      phone: "+1-555-0100",
      line1: "221B Baker Street",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "United States",
      isDefault: true,
    })
    .returning();

  await db.insert(addresses).values({
    userId: mike.id,
    fullName: "Mike Chen",
    phone: "+1-555-0101",
    line1: "500 Market Ave",
    city: "Seattle",
    state: "WA",
    postalCode: "98101",
    country: "United States",
    isDefault: true,
  });

  // Coupons
  await db.insert(coupons).values([
    { code: "WELCOME10", description: "10% off your first order", discountType: "percentage", discountValue: "10", minSubtotal: "0" },
    { code: "SAVE20", description: "$20 off orders over $150", discountType: "fixed", discountValue: "20", minSubtotal: "150" },
  ]);

  // Reviews
  const hoodie = productsBySlug.get("premium-pullover-hoodie")!;
  const headphones = productsBySlug.get("aerosound-wireless-headphones")!;
  const sneakers = productsBySlug.get("classic-canvas-sneakers")!;

  await db.insert(reviews).values([
    { productId: hoodie.product.id, userId: jane.id, rating: 5, title: "So cozy!", body: "This hoodie is incredibly soft and warm. Runs true to size." },
    { productId: hoodie.product.id, userId: mike.id, rating: 4, title: "Great quality", body: "Solid construction, though I wish there were more colors." },
    { productId: headphones.product.id, userId: mike.id, rating: 5, title: "Amazing sound", body: "Noise cancellation is fantastic for my commute." },
    { productId: sneakers.product.id, userId: jane.id, rating: 4, title: "Comfortable daily wear", body: "Great for walking around the city all day." },
  ]);

  for (const p of [hoodie, headphones, sneakers]) {
    const productReviews = await db.select().from(reviews).where(eq(reviews.productId, p.product.id));
    const avg = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
    await db
      .update(products)
      .set({ avgRating: avg.toFixed(2), reviewCount: productReviews.length })
      .where(eq(products.id, p.product.id));
  }

  // Sample orders for Jane
  const hoodieVariant = hoodie.variants[1]; // Black / M
  const sneakerVariant = sneakers.variants[0];

  const order1Subtotal = Number(hoodie.product.basePrice) * 1 + Number(sneakers.product.basePrice) * 1;
  const [order1] = await db
    .insert(orders)
    .values({
      orderNumber: "ORD-DEMO0001",
      userId: jane.id,
      status: "delivered",
      subtotal: order1Subtotal.toFixed(2),
      discount: "0.00",
      shipping: "0.00",
      tax: (order1Subtotal * 0.08).toFixed(2),
      total: (order1Subtotal * 1.08).toFixed(2),
      shippingAddressId: janeAddress.id,
      shippingFullName: janeAddress.fullName,
      shippingPhone: janeAddress.phone,
      shippingLine1: janeAddress.line1,
      shippingCity: janeAddress.city,
      shippingState: janeAddress.state,
      shippingPostalCode: janeAddress.postalCode,
      shippingCountry: janeAddress.country,
      paymentMethod: "card",
      paymentStatus: "paid",
    })
    .returning();

  await db.insert(orderItems).values([
    {
      orderId: order1.id,
      productId: hoodie.product.id,
      variantId: hoodieVariant.id,
      productName: hoodie.product.name,
      variantLabel: `${hoodieVariant.color} / ${hoodieVariant.size}`,
      unitPrice: hoodie.product.basePrice,
      quantity: 1,
      lineTotal: hoodie.product.basePrice,
    },
    {
      orderId: order1.id,
      productId: sneakers.product.id,
      variantId: sneakerVariant.id,
      productName: sneakers.product.name,
      variantLabel: `${sneakerVariant.color} / ${sneakerVariant.size}`,
      unitPrice: sneakers.product.basePrice,
      quantity: 1,
      lineTotal: sneakers.product.basePrice,
    },
  ]);

  const order2Subtotal = Number(headphones.product.basePrice);
  const [order2] = await db
    .insert(orders)
    .values({
      orderNumber: "ORD-DEMO0002",
      userId: jane.id,
      status: "shipped",
      subtotal: order2Subtotal.toFixed(2),
      discount: "0.00",
      shipping: "9.99",
      tax: (order2Subtotal * 0.08).toFixed(2),
      total: (order2Subtotal * 1.08 + 9.99).toFixed(2),
      shippingAddressId: janeAddress.id,
      shippingFullName: janeAddress.fullName,
      shippingPhone: janeAddress.phone,
      shippingLine1: janeAddress.line1,
      shippingCity: janeAddress.city,
      shippingState: janeAddress.state,
      shippingPostalCode: janeAddress.postalCode,
      shippingCountry: janeAddress.country,
      paymentMethod: "card",
      paymentStatus: "paid",
    })
    .returning();

  await db.insert(orderItems).values({
    orderId: order2.id,
    productId: headphones.product.id,
    variantId: headphones.variants[0].id,
    productName: headphones.product.name,
    variantLabel: `${headphones.variants[0].color} / ${headphones.variants[0].size}`,
    unitPrice: headphones.product.basePrice,
    quantity: 1,
    lineTotal: headphones.product.basePrice,
  });

  await db.insert(notifications).values([
    { userId: jane.id, type: "order_update", title: "Order delivered", message: `Your order ${order1.orderNumber} was delivered.` },
    { userId: jane.id, type: "order_update", title: "Order shipped", message: `Your order ${order2.orderNumber} has shipped.` },
    { userId: jane.id, type: "promotion", title: "Welcome to Luxora!", message: "Use code WELCOME10 for 10% off your first order." },
  ]);

  // Wishlist sample
  const tote = productsBySlug.get("heritage-leather-tote-bag")!;
  await db.insert(wishlistItems).values({ userId: jane.id, productId: tote.product.id });

  console.log("Seed complete.");
  console.log("----------------------------------------");
  console.log("Admin login:    admin@luxora.dev / Admin123!");
  console.log("Customer login: jane@example.com / Customer123!");
  console.log("Customer login: mike@example.com / Customer123!");
  console.log("----------------------------------------");
}

const productsBySlug = new Map<string, { product: typeof products.$inferSelect; variants: (typeof productVariants.$inferSelect)[] }>();

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
