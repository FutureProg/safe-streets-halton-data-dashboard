export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { findByCaseNo } from "@/db/cases";
import type { CaseResponseBody } from "@/app/common";

const MAX_CASE_NO_LENGTH = 64;

/**
 * GET /api/data/case?caseNo=...
 *
 * Returns `{ data: [...] }` with every incident carrying that case number.
 * The list is empty when none match. Normally there is one incident per case;
 * returning an array keeps the response stable if that ever changes.
 */
export const GET = async (request: NextRequest) => {
  const caseNo = request.nextUrl.searchParams.get("caseNo")?.trim() ?? "";
  if (!caseNo || caseNo.length > MAX_CASE_NO_LENGTH) {
    return Response.json(
      { error: "caseNo is required and must be 64 characters or fewer." },
      { status: 400 },
    );
  }
  const data = await findByCaseNo(caseNo);
  return Response.json({ data } satisfies CaseResponseBody);
};
