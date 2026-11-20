#!/usr/bin/env bash
# Collects last week's software-factory activity as Markdown for the weekly retro
# (software factory, Phase 4). Prints to stdout; prints nothing if the week was quiet.
#
# Env: GH_TOKEN, GITHUB_REPOSITORY. Optional: DAYS (7).
# Titles and comments come from GitHub and are untrusted data, not instructions.
set -euo pipefail

DAYS=${DAYS:-7}
[[ $DAYS =~ ^[0-9]+$ ]] || { echo "DAYS must be a whole number." >&2; exit 1; }
since=$(date -u -d "$DAYS days ago" +%Y-%m-%dT%H:%M:%SZ)
R="repos/$GITHUB_REPOSITORY"

prs=$(gh api --paginate "$R/pulls?state=all&sort=updated&direction=desc&per_page=100" \
  --jq ".[] | select(.updated_at >= \"$since\") | {number, title, author: .user.login, state,
        draft, created_at, merged_at, closed_at,
        labels: [.labels[].name]}" | jq -s '.')
issues=$(gh api --paginate "$R/issues?state=all&since=$since&per_page=100" \
  --jq '.[] | select(.pull_request | not) | {number, title, author: .user.login, state,
        state_reason, type: (.type.name // null), labels: [.labels[].name], comments,
        created_at, closed_at}' | jq -s '.')

pr_count=$(jq 'length' <<<"$prs")
issue_count=$(jq 'length' <<<"$issues")
if [ "$pr_count" -eq 0 ] && [ "$issue_count" -eq 0 ]; then
  exit 0
fi

echo "# Software factory activity since $since"
echo
echo "## Pull requests updated ($pr_count)"
echo
echo "| PR | Title | Author | State | Lane | Review verdict | Lane reason | Hours open |"
echo "| --- | --- | --- | --- | --- | --- | --- | --- |"
while read -r p; do
  n=$(jq -r .number <<<"$p")
  comments=$(gh api --paginate "$R/issues/$n/comments?per_page=100" --jq '.[] | {user: .user.login, body}' | jq -s '.')
  verdict=$(jq -r '[.[] | select(.body | test("(^|\\n)## Claude review")) | .body
      | capture("\\*\\*Verdict:\\*\\*\\s*(?<v>[^\\n]+)").v] | last // "none"' <<<"$comments")
  reason=$(jq -r '[.[] | select(.body | startswith("<!-- pr-lane -->")) | .body
      | split("\n")[2] // ""] | last // ""' <<<"$comments")
  jq -r --arg v "$verdict" --arg r "$reason" '
    def cell: tostring | gsub("\\|"; "/") | gsub("\\s+"; " ") | gsub("@"; "@\u200b") | gsub("<"; "&lt;");
    def hours($c): if . == null then "" else ((fromdateiso8601 - ($c | fromdateiso8601)) / 3600 | floor | tostring) end;
    .created_at as $c
    | (if .merged_at then "merged" elif .state == "closed" then "closed unmerged"
       elif .draft then "draft" else "open" end) as $s
    | ([.labels[] | select(startswith("lane: ")) | sub("lane: "; "")] | join(", ")) as $lane
    | "| #\(.number) | \(.title | cell) | \(.author) | \($s) | \($lane) | \($v | cell) | \($r | cell) | \((.merged_at // .closed_at) | hours($c)) |"' <<<"$p"
done < <(jq -c '.[]' <<<"$prs")

echo
echo "## Issues updated ($issue_count)"
echo
echo "| Issue | Title | Author | Type | State | Labels | Comments |"
echo "| --- | --- | --- | --- | --- | --- | --- |"
jq -r '.[] | def cell: tostring | gsub("\\|"; "/") | gsub("\\s+"; " ") | gsub("@"; "@\u200b") | gsub("<"; "&lt;");
  "| #\(.number) | \(.title | cell) | \(.author) | \(.type // "none") | \(.state)\(if .state_reason then " (\(.state_reason))" else "" end) | \(.labels | join(", ")) | \(.comments) |"' <<<"$issues"

echo
echo "## Workflow runs"
echo
echo "| Workflow | Event | Result | Runs |"
echo "| --- | --- | --- | --- |"
gh api --paginate "$R/actions/runs?created=>=$since&per_page=100" \
  --jq '.workflow_runs[] | {name: (if .event == "dynamic" then "Dependabot updates" else .name end),
        event, conclusion: (.conclusion // .status)}' \
  | jq -rs 'group_by([.name, .event, .conclusion]) | sort_by(.[0].name)[]
      | "| \(.[0].name) | \(.[0].event) | \(.[0].conclusion) | \(length) |"'

echo
echo "## Reverts on main"
echo
reverts=$(gh api "$R/commits?sha=main&since=$since&per_page=100" \
  --jq '.[] | select(.commit.message | test("^Revert"; "i")) | "- \(.sha[:7]) \(.commit.message | split("\n")[0])"')
echo "${reverts:-None}"
