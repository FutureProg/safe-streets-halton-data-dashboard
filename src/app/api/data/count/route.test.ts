import { CountsQueryParams } from "@/api";
import test, { expect } from "@playwright/test";
import { PagingResponseBody } from "../../utils";

test("Test GET Count from server", async () => {
    const queryParams : CountsQueryParams = {
        endDate: new Date(2024, 4, 5).getTime(),
        startDate: new Date(2024, 7, 5).getTime(),
        groupBy: ["city", "description"]
    }
    const params = new URLSearchParams(Object.entries(queryParams));
    const url = `http://localhost:3002/api/data/count?` + params;
    const response = await (await fetch(url)).json() as PagingResponseBody<any>;
    expect(response).not.toBeNull();
    expect(response.offset).toEqual(0);
});