import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { cartAddSchema } from "@/lib/validation";
import { addItemToCart, clearCart, getCartDetails, resolveCartId } from "@/server/services/cart.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const cartId = await resolveCartId(user);
    const cart = await getCartDetails(cartId);
    return ok(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const input = cartAddSchema.parse(body);
    const cartId = await resolveCartId(user);
    await addItemToCart(cartId, input.variantId, input.quantity);
    const cart = await getCartDetails(cartId);
    return ok(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    const cartId = await resolveCartId(user);
    await clearCart(cartId);
    const cart = await getCartDetails(cartId);
    return ok(cart);
  } catch (error) {
    return handleApiError(error);
  }
}
