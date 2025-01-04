import test, { expect } from "@playwright/test";
import { formatDateHtmlInput } from "./util";

test("Provides correct date in format yyyy-MM-dd", () => {
    expect(formatDateHtmlInput(new Date(2021, 0, 1))).toBe("2021-01-01");
});