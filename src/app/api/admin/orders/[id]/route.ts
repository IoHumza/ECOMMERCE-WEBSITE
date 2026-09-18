import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { orderStatusSchema } from "@/lib/validation";
import { getOrderDetails, updateOrderStatus } from "@/server/services/order.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const data = await getOrderDetails(Number(id), admin);
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const { status } = orderStatusSchema.parse(body);
    const updated = await updateOrderStatus(Number(id), status);
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
