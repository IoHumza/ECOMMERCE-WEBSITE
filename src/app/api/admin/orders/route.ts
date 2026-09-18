import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listAllOrdersForAdmin } from "@/server/services/order.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = request.nextUrl.searchParams;
    const orders = await listAllOrdersForAdmin({
      status: params.get("status") ?? undefined,
      page: params.get("page") ? Number(params.get("page")) : 1,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : 20,
    });
    return ok(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
