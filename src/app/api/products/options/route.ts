import { getDistinctVariantOptions } from "@/server/services/product.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const options = await getDistinctVariantOptions();
    return ok(options);
  } catch (error) {
    return handleApiError(error);
  }
}
