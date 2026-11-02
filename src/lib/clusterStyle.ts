/**
 * Look of a map cluster badge. The more incidents a cluster holds, the more
 * saturated and bright its orange: sparse clusters read as quiet, busy ones
 * as hot spots. The scale tops out at `cap`, the most incidents any cluster
 * could hold (every incident in the current results).
 */

const HUE = 28;
const MIN_SATURATION = 15;
const MAX_SATURATION = 100;
/** Quiet badges are pale and muted; the busiest are deep and vivid. */
const LIGHTNESS_QUIET = 62;
const LIGHTNESS_HOT = 52;
const TEXT = "#2a1606";

/** 0 for a single incident, 1 once a cluster holds `cap` incidents or more. */
export function clusterIntensity(incidentCount: number, cap: number): number {
  if (incidentCount <= 1) return 0;
  return Math.min(1, Math.log(incidentCount) / Math.log(Math.max(cap, 2)));
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const TEXT_LUMINANCE = luminance([0x2a / 255, 0x16 / 255, 0x06 / 255]);

export function clusterColours(incidentCount: number, cap: number) {
  const t = clusterIntensity(incidentCount, cap);
  const saturation = MIN_SATURATION + (MAX_SATURATION - MIN_SATURATION) * t;
  const lightness = LIGHTNESS_QUIET + (LIGHTNESS_HOT - LIGHTNESS_QUIET) * t;
  const fillLuminance = luminance(
    hslToRgb(HUE, saturation / 100, lightness / 100),
  );
  const hsl = (alpha: number) =>
    `hsl(${HUE} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}% / ${alpha})`;
  return {
    fill: hsl(1),
    halo: hsl(0.28),
    text: TEXT,
    /** WCAG contrast of `text` on `fill`. */
    contrast: (fillLuminance + 0.05) / (TEXT_LUMINANCE + 0.05),
  };
}

/** Cluster badge markup: a solid disc with the count, inside a soft halo. */
export function clusterIconHtml(incidentCount: number, cap: number): string {
  const { fill, halo, text } = clusterColours(incidentCount, cap);
  const size = incidentCount >= 1000 ? "font-size:11px;" : "";
  return (
    `<div class="incident-cluster-halo" style="background:${halo}">` +
    `<div class="incident-cluster-core" style="background:${fill};color:${text};${size}">` +
    `<span>${incidentCount}</span></div></div>`
  );
}
