import type { CaseData } from "@/common";

/** Colour per group; the outline shape tells the types in a group apart. */
const GROUP_COLOURS = {
  collision: "#d93a2b",
  behaviour: "#0f766e",
  property: "#2563eb",
} as const;

const RING_COLOUR = "#2f8a57";

type IncidentTypeIcon = {
  /** The HRPS description code, as stored in the database. */
  code: string;
  colour: string;
  /** Outline of the badge in a 48x48 box. */
  shape: string;
  /** White detail drawn over the outline. */
  glyph: string;
};

const WHITE_LINE =
  'fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"';

/**
 * Listed most serious first: a location with several incident types shows the
 * first of these that it contains.
 */
const ICONS: IncidentTypeIcon[] = [
  {
    code: "MVC - FATALITY",
    colour: GROUP_COLOURS.collision,
    shape: '<polygon points="24,2 46,24 24,46 2,24"/>',
    glyph:
      '<rect x="20.5" y="23" width="7" height="12" rx="1.2" fill="#fff"/>' +
      '<path d="M24 10c4.5 5 4.5 8.5 0 11-4.5-2.5-4.5-6 0-11z" fill="#fff"/>',
  },
  {
    code: "MVC - PI",
    colour: GROUP_COLOURS.collision,
    shape: '<circle cx="24" cy="24" r="20"/>',
    glyph: `<path d="M24 13v22M13 24h22" ${WHITE_LINE} stroke-width="6"/>`,
  },
  {
    code: "MVC - HIT & RUN",
    colour: GROUP_COLOURS.collision,
    shape: '<polygon points="4,7 31,7 45,24 31,41 4,41"/>',
    glyph: `<path d="M11 15l9 9-9 9M22 15l9 9-9 9" ${WHITE_LINE} stroke-width="4.5"/>`,
  },
  {
    code: "DANGEROUS OPERATION - TRAFFIC",
    colour: GROUP_COLOURS.behaviour,
    shape: '<polygon points="24,2 43,13 43,35 24,46 5,35 5,13"/>',
    glyph: '<path d="M27.5 9L14.5 26h8.5l-2.5 13 13-17.5h-8.5z" fill="#fff"/>',
  },
  {
    code: "IMPAIRED DRIVING",
    colour: GROUP_COLOURS.behaviour,
    shape: '<polygon points="24,3 46,42 2,42"/>',
    glyph:
      '<path d="M16.5 20h15L24 29.5z" fill="#fff"/>' +
      `<path d="M24 29v7M19 36.5h10" ${WHITE_LINE} stroke-width="3"/>`,
  },
  {
    code: "ROADSIDE TEST",
    colour: GROUP_COLOURS.behaviour,
    shape: '<rect x="4" y="4" width="40" height="40" rx="9"/>',
    glyph:
      '<path d="M24 11l8.5 22h-17z" fill="#fff"/>' +
      '<rect x="11" y="33" width="26" height="4.5" rx="1.5" fill="#fff"/>' +
      `<path d="M20.2 21.5h7.6M17.8 27.5h12.4" fill="none" stroke="${GROUP_COLOURS.behaviour}" stroke-linecap="round" stroke-width="2.6"/>`,
  },
  {
    code: "THEFT OF BICYCLE",
    colour: GROUP_COLOURS.property,
    shape: '<polygon points="15,3 33,3 45,15 45,33 33,45 15,45 3,33 3,15"/>',
    glyph:
      '<g transform="translate(0,-2.5)">' +
      `<circle cx="15.5" cy="30" r="5.5" ${WHITE_LINE} stroke-width="2.8"/>` +
      `<circle cx="32.5" cy="30" r="5.5" ${WHITE_LINE} stroke-width="2.8"/>` +
      `<path d="M15.5 30L21 20h7l4.5 10M21 20l5 10M27 20l1-3h3" ${WHITE_LINE} stroke-width="2.8"/>` +
      "</g>",
  },
];

/** For codes this app doesn't know yet: a neutral dot badge. */
const FALLBACK: IncidentTypeIcon = {
  code: "",
  colour: "#5a6a62",
  shape: '<circle cx="24" cy="24" r="20"/>',
  glyph: '<circle cx="24" cy="24" r="6" fill="#fff"/>',
};

const BY_CODE = new Map(ICONS.map((icon) => [icon.code, icon]));

const SEVERITY = new Map(ICONS.map((icon, index) => [icon.code, index]));

/** Stroke widths that grow the outline by an even gap and ring all round. */
const RING_GAP_STROKE = 11.5;
const RING_STROKE = 20.5;
const RING_MARGIN = 11;

const outline = (shape: string, attrs: string) =>
  shape.replace(/\/>$/, ` ${attrs} stroke-linejoin="round"/>`);

export type IncidentIconOptions = {
  /** Adds a ring that follows the badge outline. */
  selected?: boolean;
};

/**
 * The badge for an incident type as an SVG string. It is self-contained, so
 * it works in React (dangerouslySetInnerHTML) and in Leaflet divIcons. The
 * SVG has no intrinsic size: set width and height on the wrapper.
 */
export function incidentIconSvg(
  code: string,
  { selected = false }: IncidentIconOptions = {},
): string {
  const icon = BY_CODE.get(code) ?? FALLBACK;
  const viewBox = selected
    ? `${-RING_MARGIN} ${-RING_MARGIN} ${48 + 2 * RING_MARGIN} ${48 + 2 * RING_MARGIN}`
    : "0 0 48 48";
  const ring = selected
    ? outline(
        icon.shape,
        `fill="${RING_COLOUR}" stroke="${RING_COLOUR}" stroke-width="${RING_STROKE}"`,
      ) +
      outline(
        icon.shape,
        `fill="#fff" stroke="#fff" stroke-width="${RING_GAP_STROKE}"`,
      )
    : "";
  const badge = outline(
    icon.shape,
    `fill="${icon.colour}" stroke="#fff" stroke-width="2.5"`,
  );
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%" aria-hidden="true">` +
    ring +
    badge +
    icon.glyph +
    "</svg>"
  );
}

/** Size, in px, of a badge drawn at `size`, once its selection ring is added. */
export const selectedIconSize = (size: number) =>
  Math.round((size * (48 + 2 * RING_MARGIN)) / 48);

/** The most serious incident type among `incidents`, or undefined if empty. */
export function mostSevereCode(
  incidents: Pick<CaseData, "description">[],
): string | undefined {
  let best: string | undefined;
  let bestRank = Infinity;
  for (const { description } of incidents) {
    const rank = SEVERITY.get(description) ?? ICONS.length;
    if (rank < bestRank) {
      best = description;
      bestRank = rank;
    }
  }
  return best;
}
