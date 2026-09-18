import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { addressSchema } from "@/lib/validation";
import { createAddress, listAddresses } from "@/server/services/address.service";
import { created, ok, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireUser();
    const items = await listAddresses(user.id);
    return ok(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = addressSchema.parse(body);
    const address = await createAddress(user.id, input);
    return created(address);
  } catch (error) {
    return handleApiError(error);
  }
}
