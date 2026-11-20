#!/usr/bin/env bash
# Table tests for the software factory's shell scripts. Run: .github/scripts/tests/run.sh
# Needs bash and jq only, and calls no network.
set -uo pipefail
cd "$(dirname "$0")/.."

fails=0
check() { # check <name> <expected substring> <actual>
  if [[ "$3" == *"$2"* ]]; then
    echo "ok   $1"
  else
    echo "FAIL $1"
    echo "     expected to contain: $2"
    echo "     got: $3"
    fails=$((fails + 1))
  fi
}
refute() { # refute <name> <unexpected substring> <actual>
  if [[ "$3" == *"$2"* ]]; then
    echo "FAIL $1"
    echo "     should not contain: $2"
    echo "     got: $3"
    fails=$((fails + 1))
  else
    echo "ok   $1"
  fi
}

# --- dependabot-lane-rules.sh ---------------------------------------------
lane() { printf '%s' "$1" | CHANGED_FILES="$2" ./dependabot-lane-rules.sh; }
dep() { printf '{"dependencyName":"%s","dependencyType":"%s","updateType":"version-update:semver-%s"}' "$1" "$2" "$3"; }
lock=$'package.json\npnpm-lock.yaml'

check "dev patch auto-merges" "lane=auto-merge" \
  "$(lane "[$(dep vitest direct:development patch)]" "$lock")"
check "two dev patches auto-merge" "lane=auto-merge" \
  "$(lane "[$(dep a direct:development patch),$(dep b direct:development patch)]" "$lock")"
check "package-lock.json counts as a lockfile" "lane=auto-merge" \
  "$(lane "[$(dep a direct:development patch)]" $'package.json\npackage-lock.json')"
check "dev minor is deep review" "lane=deep-review" \
  "$(lane "[$(dep a direct:development minor)]" "$lock")"
check "dev major is deep review" "lane=deep-review" \
  "$(lane "[$(dep a direct:development major)]" "$lock")"
check "app patch is deep review" "lane=deep-review" \
  "$(lane "[$(dep next direct:production patch)]" "$lock")"
check "sub-dependency is deep review" "lane=deep-review" \
  "$(lane "[$(dep hono indirect patch)]" 'pnpm-lock.yaml')"
check "one risky update in a group is deep review" "lane=deep-review" \
  "$(lane "[$(dep a direct:development patch),$(dep next direct:production patch)]" "$lock")"
check "extra file is deep review" "lane=deep-review" \
  "$(lane "[$(dep a direct:development patch)]" $'package.json\npnpm-workspace.yaml')"
check "workflow change is deep review" "lane=deep-review" \
  "$(lane "[$(dep actions/checkout direct:production major)]" '.github/workflows/ci.yml')"
check "empty dependency list is deep review" "lane=deep-review" "$(lane '[]' "$lock")"
check "empty file list is deep review" "lane=deep-review" \
  "$(lane "[$(dep a direct:development patch)]" '')"

# --- cloudflare-errors.sh scrubbing ---------------------------------------
fixture=$(mktemp)
now=$(( $(date +%s) * 1000 ))
jq -n --argjson now "$now" '{result: ([
  "connect failed postgres://dbuser:pw@db-x.example.xyz:25060/defaultdb",
  "ECONNREFUSED 10.1.2.3:5432 and fe80::1ff:fe23:4567:890a",
  "ENOENT open /home/runner/work/app/secret.json at _next/static/db-a.js",
  "host api.internal.weird.zz down at 12:30:45",
  "token abcdefghijklmnopqrstuvwxyz0123456789 and key a1b2c3d4e5f6g7",
  "line one\nline two @someone | pipe",
  "mail bob@example.com",
  "TypeError · (0 , s.useRef) is not a function · at _next/static/layout<hash>.js"
] | to_entries | map({id: "i\(.key)", type: "exception", count: 1, title: .value,
    firstObserved: $now, lastObserved: $now}))}' > "$fixture"
out=$(CF_ISSUES_FILE="$fixture" DRY_RUN=1 MAX_NEW=20 SERVICE=w ./cloudflare-errors.sh)
rm -f "$fixture"
for secret in dbuser postgres:// db-x.example 10.1.2.3 fe80 /home/runner secret.json \
  api.internal weird.zz abcdefghijklmnop a1b2c3d4e5f6g7 bob@ example.com; do
  refute "scrubs $secret" "$secret" "$out"
done
check "keeps bundle paths" "_next/static/db-a.js" "$out"
check "keeps times" "12:30:45" "$out"
check "keeps plain error text" "(0 , s.useRef) is not a function" "$out"
check "defuses @mentions" $'@​someone' "$out"
refute "no raw @mention" "@someone" "$out"
refute "no raw pipe in the title" "two @"$'​'"someone | pipe" "$out"
check "joins lines" "line one line two" "$out"

echo
if [ "$fails" -gt 0 ]; then
  echo "$fails failed"
  exit 1
fi
echo "All passed"
