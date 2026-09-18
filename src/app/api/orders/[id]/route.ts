import { requireUser } from "@/lib/auth/session";
import { getOrderDetails } from "@/server/services/order.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const data = await getOrderDetails(Number(id), user);
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}
