import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { checkoutSchema } from "@/lib/validation";
import { createOrderFromCart, listOrdersForUser } from "@/server/services/order.service";
import { resolveCartId } from "@/server/services/cart.service";
import { created, ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await listOrdersForUser(user.id);
    return ok(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = checkoutSchema.parse(body);
    const cartId = await resolveCartId(user);
    const order = await createOrderFromCart(user.id, cartId, input);
    return created(order);
  } catch (error) {
    return handleApiError(error);
  }
}
