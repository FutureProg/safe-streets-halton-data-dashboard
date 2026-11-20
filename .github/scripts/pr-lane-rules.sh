#!/usr/bin/env bash
# Plain-rule PR classifier (software factory, Phase 3).
#
# Reads the PR's changed files on stdin, one per line as "<path><TAB><lines changed>",
# and prints two lines:
#   lane=<auto-merge|quick-look|deep-review>
#   reason=<one sentence>
#
# The rules set the most relaxed lane a PR may get. The AI can only make it stricter.
# Env: PR_AUTHOR (login), SAME_REPO ("true" when the head branch is in this repo).
set -euo pipefail

# Paths that always need Nick's close review.
is_deep_path() {
  case "$1" in
    .github/*) return 0 ;;
    package.json | pnpm-lock.yaml | pnpm-workspace.yaml | package-lock.json | .npmrc) return 0 ;;
    src/db/* | src/app/actions.ts | src/app/serverUtil.ts | src/app/api/* | src/proxy.ts) return 0 ;;
    *.config.ts | *.config.mjs | *.config.cjs | *.config.js | envConfig.ts | .env* | wrangler.*) return 0 ;;
    scripts/* | drizzle/*) return 0 ;;
    # The factory's own instructions.
    CLAUDE.md | AGENTS.md | docs/agents/*) return 0 ;;
  esac
  return 1
}

# Paths that can't change how the app behaves: docs, tests, stories and copy.
is_low_risk_path() {
  case "$1" in
    *.md | docs/*) return 0 ;;
    *.test.ts | *.test.tsx | *.stories.tsx | *.stories.ts | e2e/*) return 0 ;;
    src/locales/*.json | src/locales/*/*.json) return 0 ;;
  esac
  return 1
}

total=0
files=0
deep=""
all_low_risk=true
while IFS=$'\t' read -r path changes; do
  [ -z "$path" ] && continue
  files=$((files + 1))
  total=$((total + ${changes:-0}))
  if is_deep_path "$path" && [ -z "$deep" ]; then deep="$path"; fi
  if ! is_low_risk_path "$path"; then all_low_risk=false; fi
done

if [ "$files" -eq 1 ]; then file_word="file"; else file_word="files"; fi

case "${PR_AUTHOR:-}" in
  FutureProg | claude\[bot\]) trusted_author=true ;;
  *) trusted_author=false ;;
esac

if [ -n "$deep" ]; then
  echo "lane=deep-review"
  echo "reason=It changes $deep, which is in a risky area."
elif [ "$total" -ge 600 ]; then
  echo "lane=deep-review"
  echo "reason=It's a large change ($total lines)."
elif $all_low_risk && [ "$total" -lt 150 ] && $trusted_author && [ "${SAME_REPO:-}" = "true" ]; then
  echo "lane=auto-merge"
  echo "reason=Only docs, tests or copy changed ($files $file_word, $total lines)."
else
  echo "lane=quick-look"
  if $all_low_risk && [ "$total" -ge 150 ]; then
    echo "reason=Only docs, tests or copy changed, but it's over 150 lines."
  elif $all_low_risk; then
    echo "reason=Only docs, tests or copy changed, but it isn't from Nick or Claude's build."
  else
    echo "reason=It changes app code ($files $file_word, $total lines)."
  fi
fi
