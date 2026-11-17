export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import * as v from "valibot";

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
  const parsed = v.safeParse(
    CaseQuerySchema,
    paramsToObject(request.nextUrl.searchParams, ["caseNo"]),
  );
  if (!parsed.success) return invalidRequest(parsed.issues);

  const data = await findByCaseNo(parsed.output.caseNo);
  return Response.json({ data } satisfies CaseResponseBody);
};
