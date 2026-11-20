#!/usr/bin/env bash
# Marks which Dependabot updates fix a published security advisory
# (software factory, Phase 4).
#
# Reads dependabot/fetch-metadata's updated-dependencies-json (npm) on stdin and
# prints it back with "fixesAdvisory": true or false on each dependency. An
# update fixes an advisory when the GitHub Advisory Database lists an advisory
# for the old version that no longer applies to the new one.
#
# Any lookup that fails counts as false, so a failure can only make a PR wait
# for Nick, never merge it.
#
# For tests, set ADVISORIES_FIXTURE to a JSON file mapping "name@version" to a
# list of advisory IDs, and no network is used.
set -euo pipefail

advisories() { # advisories <name@version>: one advisory ID per line
  if [ -n "${ADVISORIES_FIXTURE:-}" ]; then
    jq -r --arg k "$1" '.[$k] // [] | .[]' "$ADVISORIES_FIXTURE"
  else
    gh api -X GET advisories --paginate -f ecosystem=npm -f affects="$1" -f per_page=100 \
      --jq '.[].ghsa_id'
  fi
}

deps=$(cat)
out='[]'
count=$(printf '%s' "$deps" | jq 'length')
for i in $(seq 0 $((count - 1))); do
  dep=$(printf '%s' "$deps" | jq -c ".[$i]")
  name=$(printf '%s' "$dep" | jq -r '.dependencyName // ""')
  prev=$(printf '%s' "$dep" | jq -r '.prevVersion // ""')
  new=$(printf '%s' "$dep" | jq -r '.newVersion // ""')
  fixes=false
  if [ -n "$name" ] && [ -n "$prev" ] && [ -n "$new" ]; then
    if old_ids=$(advisories "$name@$prev") && new_ids=$(advisories "$name@$new"); then
      fixed=$(comm -23 <(printf '%s\n' "$old_ids" | sed '/^$/d' | sort -u) \
        <(printf '%s\n' "$new_ids" | sed '/^$/d' | sort -u) | head -n 1)
      if [ -n "$fixed" ]; then fixes=true; fi
    fi
  fi
  out=$(printf '%s' "$out" | jq -c --argjson d "$dep" --argjson f "$fixes" '. + [$d + {fixesAdvisory: $f}]')
done
printf '%s\n' "$out"
