/**
 * Look of a map cluster badge. The more incidents a cluster holds, the more
 * saturated its orange: sparse clusters read as quiet, busy ones as hot spots.
 */

const HUE = 24;
/** Incident count at which the badge reaches full saturation. */
const FULL_AT = 500;
const MIN_SATURATION = 15;
const MAX_SATURATION = 90;
/** Lightness drops a little as saturation rises so white text stays legible. */
const LIGHTNESS_QUIET = 46;
const LIGHTNESS_HOT = 38;

/** 0 for a single incident, 1 at `FULL_AT` incidents or more. */
export function clusterIntensity(incidentCount: number): number {
  if (incidentCount <= 1) return 0;
  return Math.min(1, Math.log(incidentCount) / Math.log(FULL_AT));
}

export function clusterColours(incidentCount: number) {
  const t = clusterIntensity(incidentCount);
  const saturation = MIN_SATURATION + (MAX_SATURATION - MIN_SATURATION) * t;
  const lightness = LIGHTNESS_QUIET + (LIGHTNESS_HOT - LIGHTNESS_QUIET) * t;
  const hsl = (alpha: number) =>
    `hsl(${HUE} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}% / ${alpha})`;
  return { fill: hsl(1), halo: hsl(0.28) };
}

/** Cluster badge markup: a solid disc with the count, inside a soft halo. */
export function clusterIconHtml(incidentCount: number): string {
  const { fill, halo } = clusterColours(incidentCount);
  return (
    `<div class="incident-cluster-halo" style="background:${halo}">` +
    `<div class="incident-cluster-core" style="background:${fill}">` +
    `<span${incidentCount >= 1000 ? ' style="font-size:11px"' : ""}>${incidentCount}</span></div></div>`
  );
}
