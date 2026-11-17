export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { findByCaseNo } from "@/db/cases";
import { CaseQuerySchema, invalidRequest, paramsToObject } from "../../schemas";
import type { CaseResponseBody } from "@/app/common";

/**
 * GET /api/data/case?caseNo=...
 *
 * Returns `{ data: [...] }` with every incident carrying that case number.
 * The list is empty when none match. Normally there is one incident per case;
 * returning an array keeps the response stable if that ever changes.
 */
export const GET = async (request: NextRequest) => {
  const parsed = CaseQuerySchema.safeParse(
    paramsToObject(request.nextUrl.searchParams, ["caseNo"]),
  );
  if (!parsed.success) return invalidRequest(parsed.error);

  const data = await findByCaseNo(parsed.data.caseNo);
  return Response.json({ data } satisfies CaseResponseBody);
};
