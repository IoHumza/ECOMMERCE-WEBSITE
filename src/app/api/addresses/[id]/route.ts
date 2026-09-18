import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { addressSchema } from "@/lib/validation";
import { deleteAddress, updateAddress } from "@/server/services/address.service";
import { ok, handleApiError } from "@/lib/api/response";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const body = await request.json();
    const input = addressSchema.parse(body);
    const address = await updateAddress(user.id, Number(id), input);
    return ok(address);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    await deleteAddress(user.id, Number(id));
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
