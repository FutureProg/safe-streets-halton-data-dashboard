import { describe, expect, test } from "vite-plus/test";
import {
  clusterColours,
  clusterIconHtml,
  clusterIntensity,
} from "./clusterStyle";

const CAP = 6600;

const saturationOf = (count: number, cap = CAP) =>
  Number(/hsl\(28 ([\d.]+)%/.exec(clusterColours(count, cap).fill)?.[1]);

describe("clusterIntensity", () => {
  test("grows with the incident count and stops at 1 at the cap", () => {
    expect(clusterIntensity(1, CAP)).toBe(0);
    expect(clusterIntensity(5, CAP)).toBeLessThan(clusterIntensity(50, CAP));
    expect(clusterIntensity(CAP, CAP)).toBe(1);
    expect(clusterIntensity(CAP * 2, CAP)).toBe(1);
  });

  test("copes with tiny caps", () => {
    expect(clusterIntensity(2, 1)).toBe(1);
    expect(clusterIntensity(1, 0)).toBe(0);
  });
});

describe("clusterColours", () => {
  test("is more saturated the more incidents there are", () => {
    expect(saturationOf(2)).toBeLessThan(saturationOf(20));
    expect(saturationOf(20)).toBeLessThan(saturationOf(200));
  });

  test("is fully saturated at the cap, whatever the cap is", () => {
    expect(saturationOf(CAP)).toBe(100);
    expect(saturationOf(40, 40)).toBe(100);
  });

  test("keeps the count readable across the scale", () => {
    for (const count of [1, 2, 10, 50, 200, 1000, CAP]) {
      expect(clusterColours(count, CAP).contrast).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("clusterIconHtml", () => {
  test("shows the incident count", () => {
    expect(clusterIconHtml(37, CAP)).toContain("<span>37</span>");
    expect(clusterIconHtml(1200, CAP)).toContain(">1200</span>");
  });
});
