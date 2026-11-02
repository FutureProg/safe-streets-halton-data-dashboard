import { describe, expect, test } from "vite-plus/test";
import {
  clusterColours,
  clusterIconHtml,
  clusterIntensity,
} from "./clusterStyle";

const saturationOf = (count: number) =>
  Number(/hsl\(24 ([\d.]+)%/.exec(clusterColours(count).fill)?.[1]);

/** WCAG contrast of white text on the cluster fill for `count` incidents. */
function whiteContrast(count: number) {
  const [, s, l] = /hsl\(24 ([\d.]+)% ([\d.]+)%/.exec(
    clusterColours(count).fill,
  )!;
  const sat = Number(s) / 100;
  const light = Number(l) / 100;
  const k = (n: number) => (n + 24 / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const channel = (n: number) =>
    light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const lum =
    0.2126 * lin(channel(0)) +
    0.7152 * lin(channel(8)) +
    0.0722 * lin(channel(4));
  return 1.05 / (lum + 0.05);
}

describe("clusterIntensity", () => {
  test("grows with the incident count and stops at 1", () => {
    expect(clusterIntensity(1)).toBe(0);
    expect(clusterIntensity(5)).toBeLessThan(clusterIntensity(50));
    expect(clusterIntensity(5000)).toBe(1);
  });
});

describe("clusterColours", () => {
  test("is more saturated the more incidents there are", () => {
    expect(saturationOf(2)).toBeLessThan(saturationOf(20));
    expect(saturationOf(20)).toBeLessThan(saturationOf(200));
  });

  test("keeps white text readable across the scale", () => {
    for (const count of [1, 2, 10, 50, 200, 500, 5000]) {
      expect(whiteContrast(count)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("clusterIconHtml", () => {
  test("shows the incident count", () => {
    expect(clusterIconHtml(37)).toContain("<span>37</span>");
    expect(clusterIconHtml(1200)).toContain(">1200</span>");
  });
});
