import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { addToWishlist, listWishlist } from "@/server/services/wishlist.service";
import { created, ok, handleApiError } from "@/lib/api/response";

const addSchema = z.object({ productId: z.number().int().positive() });

export async function GET() {
  try {
    const user = await requireUser();
    const items = await listWishlist(user.id);
    return ok(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { productId } = addSchema.parse(body);
    const item = await addToWishlist(user.id, productId);
    return created(item);
  } catch (error) {
    return handleApiError(error);
  }
}
