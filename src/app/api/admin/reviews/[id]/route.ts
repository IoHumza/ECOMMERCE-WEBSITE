import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { deleteReview, setReviewApproval } from "@/server/services/review.service";
import { ok, handleApiError } from "@/lib/api/response";

const schema = z.object({ isApproved: z.boolean() });

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const { isApproved } = schema.parse(body);
    await setReviewApproval(Number(id), isApproved);
    return ok({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    await deleteReview(Number(id), admin);
    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
