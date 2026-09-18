import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(32),
  line1: z.string().trim().min(3).max(255),
  line2: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(1).max(32),
  country: z.string().trim().min(1).max(120),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const reviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(150).optional().or(z.literal("")),
  body: z.string().trim().min(5, "Review must be at least 5 characters").max(3000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const cartAddSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(50).default(1),
});
export type CartAddInput = z.infer<typeof cartAddSchema>;

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  addressId: z.number().int().positive().optional(),
  address: addressSchema.optional(),
  paymentMethod: z.enum(["card", "cash_on_delivery"]).default("card"),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productVariantSchema = z.object({
  id: z.number().int().positive().optional(),
  color: z.string().trim().min(1).max(60),
  size: z.string().trim().min(1).max(60),
  sku: z.string().trim().min(1).max(64),
  priceOverride: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().min(0),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const productImageSchema = z.object({
  url: z.string().trim().url(),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
  isPrimary: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  description: z.string().trim().min(10),
  shortDescription: z.string().trim().max(500).optional().or(z.literal("")),
  brand: z.string().trim().max(120).optional().or(z.literal("")),
  categoryId: z.number().int().positive(),
  basePrice: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  sku: z.string().trim().min(1).max(64),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isActive: z.boolean().optional(),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ]),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(3000),
});
export type ContactInput = z.infer<typeof contactSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
