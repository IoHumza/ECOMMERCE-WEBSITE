import { requireAdmin } from "@/lib/auth/session";
import { getAdminDashboardStats } from "@/server/services/stats.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminDashboardStats();
    return ok(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
