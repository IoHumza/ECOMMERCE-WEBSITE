import { listCategories } from "@/server/services/category.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const categories = await listCategories();
    return ok(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
