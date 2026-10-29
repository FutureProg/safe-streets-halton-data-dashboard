import { flushSync } from "react-dom";

export type TransitionDirection = "forward" | "backward";

type TypedViewTransitionOptions = {
  update: () => void;
  types: string[];
};

/**
 * Runs a state update inside a same-document view transition. React commits
 * the update synchronously (flushSync) so the browser captures the new view
 * fully laid out before it animates. Browsers without view transitions, and
 * users who prefer reduced motion, get the update immediately.
 */
export function transitionView(
  update: () => void,
  direction: TransitionDirection,
) {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (!document.startViewTransition || reduceMotion) {
    update();
    return;
  }
  // `types` is not in the TypeScript DOM typings yet.
  (
    document.startViewTransition as (
      options: TypedViewTransitionOptions,
    ) => unknown
  ).call(document, { update: () => flushSync(update), types: [direction] });
}
