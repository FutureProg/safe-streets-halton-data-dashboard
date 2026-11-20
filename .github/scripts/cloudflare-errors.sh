#!/usr/bin/env bash
# Turns new production errors into GitHub bug issues (software factory, Phase 4).
#
# Reads the Worker's active issues from Cloudflare Workers Observability, keeps
# the errors seen in the last LOOKBACK_HOURS, and for each one:
#   - no GitHub issue yet:           opens a Bug issue with needs-triage
#   - GitHub issue open:             leaves it alone
#   - GitHub issue closed, came back: reopens it with a comment
# Vulnerability-scan noise (Cloudflare's "security" type) is skipped.
#
# This repo is public, so error text is cleaned of URLs, hosts, IPs, emails and
# long tokens before it's posted, and nothing links to the Cloudflare account.
#
# Env: CF_API_TOKEN, CF_ACCOUNT_ID (Workers Observability Read), GH_TOKEN,
#      GITHUB_REPOSITORY, SERVICE (Worker name).
# Optional: LOOKBACK_HOURS (26), MAX_NEW (5), DRY_RUN=1 to print instead of post,
#      CF_ISSUES_FILE and EXISTING_JSON to test without calling Cloudflare or GitHub.
set -euo pipefail

LOOKBACK_HOURS=${LOOKBACK_HOURS:-26}
MAX_NEW=${MAX_NEW:-5}
LABEL="production-error"
for n in "$LOOKBACK_HOURS" "$MAX_NEW"; do
  [[ $n =~ ^[0-9]+$ ]] || { echo "LOOKBACK_HOURS and MAX_NEW must be whole numbers." >&2; exit 1; }
done

if [ -n "${CF_ISSUES_FILE:-}" ]; then
  cf=$(cat "$CF_ISSUES_FILE")
else
  cf=$(curl -sS --fail-with-body -G \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    --data-urlencode "service=$SERVICE" \
    --data-urlencode "status=active" \
    --data-urlencode "orderBy=lastObserved" \
    --data-urlencode "order=desc" \
    --data-urlencode "perPage=100" \
    "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/workers/observability/issues")
fi

since_ms=$(( ($(date +%s) - LOOKBACK_HOURS * 3600) * 1000 ))

# One entry per distinct error title (Cloudflare often logs the same error as both
# an "exception" and a "log"; the exception wins), newest first.
errors=$(printf '%s' "$cf" | jq --argjson since "$since_ms" '
  def clean:
    gsub("https?://[^\\s)`]+"; "<url>")
    | gsub("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"; "<email>")
    | gsub("\\b(?:\\d{1,3}\\.){3}\\d{1,3}(?::\\d+)?\\b"; "<ip>")
    | gsub("\\b(?:[A-Za-z0-9-]+\\.)+(?:com|net|org|io|ca|dev|me|app|cloud|internal|local|db)\\b(?::\\d+)?"; "<host>")
    | gsub("[A-Za-z0-9_+/=-]{32,}"; "<token>")
    # Shorter IDs and keys: 12+ characters mixing letters and digits.
    | gsub("\\b(?=[A-Za-z_-]*[0-9])(?=[0-9_-]*[A-Za-z])[A-Za-z0-9_-]{12,}\\b"; "<id>")
    | gsub("\\s+"; " ")
    | gsub("`"; "'\''")
    | gsub("\\|"; "/")
    # Stop @names from pinging anyone (zero-width space after the @).
    | gsub("@"; "@\u200b");
  [ .result[]
    | select(.type == "exception" or .type == "log")
    | select(.lastObserved >= $since) ]
  | group_by(.title)
  | map(sort_by(if .type == "exception" then 0 else 1 end) | .[0])
  | sort_by(-.lastObserved)
  | map({id, type, count, title: (.title | clean),
         first: (.firstObserved / 1000 | floor | strftime("%Y-%m-%d %H:%M UTC")),
         last:  (.lastObserved / 1000 | floor | strftime("%Y-%m-%d %H:%M UTC")),
         lastMs: .lastObserved})')

total=$(printf '%s' "$errors" | jq 'length')
echo "Errors seen in the last $LOOKBACK_HOURS hours: $total"
[ "$total" -eq 0 ] && exit 0

if [ -n "${DRY_RUN:-}" ]; then
  existing=${EXISTING_JSON:-[]}
else
  existing=$(gh api --paginate "repos/$GITHUB_REPOSITORY/issues?labels=$LABEL&state=all&per_page=100" \
    --jq '.[] | select(.pull_request | not) | {number, state, closed_at,
          cf: ((.body // "") | capture("<!-- cloudflare-issue: (?<id>[^ ]+) -->").id // null)}' \
    | jq -s '.')
fi

created=0
# Process substitution keeps the loop's input away from the gh calls inside it.
while read -r e; do
  id=$(jq -r .id <<<"$e")
  title=$(jq -r .title <<<"$e")
  match=$(jq -c --arg id "$id" 'map(select(.cf == $id)) | .[0] // empty' <<<"$existing")

  if [ -z "$match" ]; then
    if [ "$created" -ge "$MAX_NEW" ]; then
      echo "Skipping \"$title\": already opened $MAX_NEW issues this run."
      continue
    fi
    short=$(jq -r '.title | if length > 80 then .[:79] + "…" else . end' <<<"$e")
    body=$(jq -r '"<!-- cloudflare-issue: \(.id) -->
Cloudflare spotted this error on the live dashboard.

| | |
| --- | --- |
| Error | `\(.title)` |
| Kind | \(.type) |
| Times seen | \(.count) |
| First seen | \(.first) |
| Last seen | \(.last) |

**Where to look:** in Cloudflare, open Workers & Pages, then the `'"$SERVICE"'` Worker, then Observability, then Issues, and search for a few words of the error above.

The error text had URLs, hosts, IPs, IDs and tokens taken out before posting, because this repo is public.

_Opened by the Cloudflare errors workflow. Triage it on the Mac with `/triage`._"' <<<"$e")
    if [ -n "${DRY_RUN:-}" ]; then
      printf '=== NEW: Production error: %s\n%s\n\n' "$short" "$body"
    else
      url=$(gh issue create --repo "$GITHUB_REPOSITORY" --title "Production error: $short" \
        --label needs-triage --label "$LABEL" --body "$body")
      gh api --method PATCH "${url/https:\/\/github.com\//repos/}" -f type=Bug > /dev/null \
        || echo "Couldn't set the Bug type on $url"
      echo "Opened $url"
    fi
    created=$((created + 1))
    continue
  fi

  state=$(jq -r .state <<<"$match")
  number=$(jq -r .number <<<"$match")
  if [ "$state" = "closed" ]; then
    closed_ms=$(( $(date -d "$(jq -r .closed_at <<<"$match")" +%s) * 1000 ))
    last_ms=$(jq -r .lastMs <<<"$e")
    if [ "$last_ms" -gt "$closed_ms" ]; then
      comment=$(jq -r '"This error came back after the issue was closed. Cloudflare has now seen it \(.count) times, most recently at \(.last)."' <<<"$e")
      if [ -n "${DRY_RUN:-}" ]; then
        echo "=== REOPEN #$number: $comment"
      else
        gh issue reopen "$number" --repo "$GITHUB_REPOSITORY" --comment "$comment"
        gh issue edit "$number" --repo "$GITHUB_REPOSITORY" --add-label needs-triage
        echo "Reopened #$number"
      fi
    fi
  else
    echo "#$number is already open for \"$title\"."
  fi
done < <(printf '%s' "$errors" | jq -c '.[]')
