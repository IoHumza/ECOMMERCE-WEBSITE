import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { cartUpdateSchema } from "@/lib/validation";
import { getCartDetails, removeCartItem, resolveCartId, updateCartItemQuantity } from "@/server/services/cart.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    const body = await request.json();
    const input = cartUpdateSchema.parse(body);
    const cartId = await resolveCartId(user);
    await updateCartItemQuantity(cartId, Number(id), input.quantity);
    const cart = await getCartDetails(cartId);
    return ok(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser();
    const cartId = await resolveCartId(user);
    await removeCartItem(cartId, Number(id));
    const cart = await getCartDetails(cartId);
    return ok(cart);
  } catch (error) {
    return handleApiError(error);
  }
}
