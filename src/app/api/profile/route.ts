import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { updateProfile, changePassword } from "@/server/services/user.service";
import { ok, handleApiError } from "@/lib/api/response";

const profileSchema = z.object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().max(32).optional().or(z.literal("")) });

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const input = profileSchema.parse(body);
    const updated = await updateProfile(user.id, { name: input.name, phone: input.phone || null });
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

const passwordSchema = z.object({ newPassword: z.string().min(8).max(72) });

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const { newPassword } = passwordSchema.parse(body);
    await changePassword(user.id, newPassword);
    return ok({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
