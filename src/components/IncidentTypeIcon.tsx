import { incidentIconSvg } from "@/lib/incidentTypes";

/** The badge for an incident type; `size` is its width and height in px. */
export function IncidentTypeIcon({
  code,
  size = 16,
}: {
  code: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 align-middle"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: incidentIconSvg(code) }}
    />
  );
}
