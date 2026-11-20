#!/usr/bin/env bash
# Plain-rule lane for Dependabot PRs (software factory, Phase 4).
#
# Reads dependabot/fetch-metadata's updated-dependencies-json on stdin and the
# PR's changed paths in CHANGED_FILES (one per line). Prints two lines:
#   lane=<auto-merge|deep-review>
#   reason=<one sentence>
#
# Only patch bumps of direct dev dependencies, touching nothing but
# package.json and the lockfiles, may auto-merge. Everything else is Deep review.
set -euo pipefail

deps=$(cat)
count=$(printf '%s' "$deps" | jq 'length')

if [ "$count" -eq 0 ]; then
  echo "lane=deep-review"
  echo "reason=Couldn't read which dependencies this PR updates."
  exit 0
fi

if [ -z "$(printf '%s' "${CHANGED_FILES:-}" | tr -d '[:space:]')" ]; then
  echo "lane=deep-review"
  echo "reason=Couldn't read which files this PR changes."
  exit 0
fi

outside=$(printf '%s\n' "${CHANGED_FILES:-}" | grep -v -E '^(package\.json|pnpm-lock\.yaml|package-lock\.json)?$' | head -n 1 || true)
if [ -n "$outside" ]; then
  echo "lane=deep-review"
  echo "reason=It changes $outside, not just package.json and the lockfiles."
  exit 0
fi

risky=$(printf '%s' "$deps" | jq -r '
  map(select(.dependencyType != "direct:development" or .updateType != "version-update:semver-patch"))
  | .[0] // empty
  | (.dependencyType | if . == "direct:production" then "an app dependency"
      elif . == "direct:development" then "a dev dependency"
      elif . == "indirect" then "a sub-dependency"
      else "a dependency" end) as $kind
  | ((.updateType // "") | sub("version-update:semver-"; "") | if . == "" then "an unknown" else "a " + . end) as $bump
  | "\(.dependencyName), \($kind), with \($bump) bump"')

if [ -n "$risky" ]; then
  echo "lane=deep-review"
  echo "reason=It updates $risky. Only dev-dependency patch bumps auto-merge."
  exit 0
fi

if [ "$count" -eq 1 ]; then word="dependency"; else word="dependencies"; fi
echo "lane=auto-merge"
echo "reason=Only patch updates to $count dev $word."
