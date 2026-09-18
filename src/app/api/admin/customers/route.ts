import { requireAdmin } from "@/lib/auth/session";
import { listCustomersForAdmin } from "@/server/services/user.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireAdmin();
    const customers = await listCustomersForAdmin();
    return ok(customers);
  } catch (error) {
    return handleApiError(error);
  }
}
