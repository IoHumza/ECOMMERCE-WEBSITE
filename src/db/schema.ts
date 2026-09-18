import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "paid",
  "refunded",
  "failed",
]);
export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "order_update",
  "promotion",
  "system",
  "review",
]);

// ---------------------------------------------------------------------------
// Users & Auth
// ---------------------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("customer"),
    phone: varchar("phone", { length: 32 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
);

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    line1: varchar("line1", { length: 255 }).notNull(),
    line2: varchar("line2", { length: 255 }),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 120 }).notNull(),
    postalCode: varchar("postal_code", { length: 32 }).notNull(),
    country: varchar("country", { length: 120 }).notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("addresses_user_idx").on(table.userId)]
);

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    parentId: integer("parent_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)]
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description").notNull(),
    shortDescription: varchar("short_description", { length: 500 }),
    brand: varchar("brand", { length: 120 }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
    sku: varchar("sku", { length: 64 }).notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    isNewArrival: boolean("is_new_arrival").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    avgRating: numeric("avg_rating", { precision: 3, scale: 2 }).notNull().default("0"),
    reviewCount: integer("review_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("products_slug_idx").on(table.slug),
    uniqueIndex("products_sku_idx").on(table.sku),
    index("products_category_idx").on(table.categoryId),
    index("products_featured_idx").on(table.isFeatured),
    index("products_new_arrival_idx").on(table.isNewArrival),
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altText: varchar("alt_text", { length: 200 }),
    position: integer("position").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
  },
  (table) => [index("product_images_product_idx").on(table.productId)]
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    color: varchar("color", { length: 60 }).notNull().default("Default"),
    size: varchar("size", { length: 60 }).notNull().default("One Size"),
    sku: varchar("sku", { length: 64 }).notNull(),
    priceOverride: numeric("price_override", { precision: 10, scale: 2 }),
    stock: integer("stock").notNull().default(0),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("product_variants_sku_idx").on(table.sku),
    index("product_variants_product_idx").on(table.productId),
  ]
);

// ---------------------------------------------------------------------------
// Cart & Wishlist
// ---------------------------------------------------------------------------
export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestToken: varchar("guest_token", { length: 64 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("carts_user_idx").on(table.userId),
    uniqueIndex("carts_guest_token_idx").on(table.guestToken),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cart_items_cart_variant_idx").on(table.cartId, table.variantId),
  ]
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productId)]
);

// ---------------------------------------------------------------------------
// Orders & Payments
// ---------------------------------------------------------------------------
export const coupons = pgTable(
  "coupons",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 40 }).notNull(),
    description: varchar("description", { length: 255 }),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
    minSubtotal: numeric("min_subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    expiresAt: timestamp("expires_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("coupons_code_idx").on(table.code)]
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
    shipping: numeric("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
    tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull(),
    couponCode: varchar("coupon_code", { length: 40 }),
    shippingAddressId: integer("shipping_address_id").references(() => addresses.id, {
      onDelete: "set null",
    }),
    shippingFullName: varchar("shipping_full_name", { length: 120 }).notNull(),
    shippingPhone: varchar("shipping_phone", { length: 32 }).notNull(),
    shippingLine1: varchar("shipping_line1", { length: 255 }).notNull(),
    shippingLine2: varchar("shipping_line2", { length: 255 }),
    shippingCity: varchar("shipping_city", { length: 120 }).notNull(),
    shippingState: varchar("shipping_state", { length: 120 }).notNull(),
    shippingPostalCode: varchar("shipping_postal_code", { length: 32 }).notNull(),
    shippingCountry: varchar("shipping_country", { length: 120 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 40 }).notNull().default("card"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
    paymentReference: varchar("payment_reference", { length: 120 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    index("orders_user_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: integer("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    productName: varchar("product_name", { length: 200 }).notNull(),
    variantLabel: varchar("variant_label", { length: 120 }).notNull(),
    imageUrl: text("image_url"),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)]
);

// ---------------------------------------------------------------------------
// Reviews & Notifications
// ---------------------------------------------------------------------------
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: varchar("title", { length: 150 }),
    body: text("body").notNull(),
    isApproved: boolean("is_approved").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reviews_user_product_idx").on(table.userId, table.productId),
    index("reviews_product_idx").on(table.productId),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull().default("system"),
    title: varchar("title", { length: 150 }).notNull(),
    message: varchar("message", { length: 500 }).notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("notifications_user_idx").on(table.userId)]
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  wishlistItems: many(wishlistItems),
  notifications: many(notifications),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  cartItems: many(cartItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, { fields: [wishlistItems.userId], references: [users.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
