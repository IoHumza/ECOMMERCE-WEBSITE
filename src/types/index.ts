export type Role = "customer" | "admin";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  productCount?: number;
};

export type ProductImage = {
  id: number;
  productId: number;
  url: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
};

export type ProductVariant = {
  id: number;
  productId: number;
  color: string;
  size: string;
  sku: string;
  priceOverride: string | null;
  stock: number;
  imageUrl: string | null;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  brand: string | null;
  categoryId: number;
  basePrice: string;
  compareAtPrice: string | null;
  sku: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  avgRating: string;
  reviewCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  category?: Category;
  images: ProductImage[];
  variants?: ProductVariant[];
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProductListResponse = {
  items: Product[];
  pagination: Pagination;
};

export type Review = {
  id: number;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  userName: string;
};

export type CartItem = {
  id: number;
  quantity: number;
  variant: { id: number; color: string; size: string; stock: number; imageUrl: string | null };
  product: { id: number; name: string; slug: string; imageUrl: string | null };
  unitPrice: number;
  lineTotal: number;
};

export type Cart = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};

export type Address = {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
};

export type Order = {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  subtotal: string;
  discount: string;
  shipping: string;
  tax: string;
  total: string;
  couponCode: string | null;
  shippingFullName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number | null;
  variantId: number | null;
  productName: string;
  variantLabel: string;
  imageUrl: string | null;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
};

export type WishlistEntry = {
  wishlistItemId: number;
  addedAt: string;
  product: Product & { imageUrl: string | null };
};
