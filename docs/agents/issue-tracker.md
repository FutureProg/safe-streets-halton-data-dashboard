# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in `FutureProg/safe-streets-halton-data-dashboard`. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies. Then set its issue type (see **Issue types** below).
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Blocking**: GitHub's native issue dependencies. Add an edge with `gh issue create --blocked-by <n>,<n> ...` or `gh issue edit <child> --add-blocked-by <blocker>` (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric database id (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Count open blockers**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (open blockers only; 0 means startable).
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: post the explanation with `gh issue comment <number> --body "..."`, then `gh issue close <number>`.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone. File issues only into this repo.

## Issue types

This repo uses GitHub's built-in **issue types** instead of category labels. Never create or apply `bug` or `enhancement` labels.

| Category role           | Issue type | Branch prefix the build uses |
| ----------------------- | ---------- | ---------------------------- |
| `bug`                   | `Bug`      | `fix/`                       |
| `enhancement`           | `Feature`  | `feature/`                   |
| (chores, docs, tooling) | `Task`     | `chore/`                     |

Set or change the type with:

```sh
gh api --method PATCH repos/FutureProg/safe-streets-halton-data-dashboard/issues/<number> -f type=Feature
```

Read it with `gh api repos/FutureProg/safe-streets-halton-data-dashboard/issues/<number> --jq .type.name`.

## Specs carry the story

User stories are numbered `SSHD-<number>` (never "US1"). They live in a Claude Doc that agents in GitHub can't open. So when a spec or agent brief belongs to a story, **copy the story's details into the spec itself**: who it's for, what they want, why, and its acceptance criteria. Put `**User story:** SSHD-<number>` near the top as a reference. An agent working from GitHub must be able to build the change from the issue alone.

## Starting a build

Applying the `ready-for-agent` label starts a paid build run in GitHub Actions (`.github/workflows/claude-build.yml`) that opens a PR. So:

- When `/to-spec` or `/triage` would apply `ready-for-agent`, show Nick the final spec or brief and **ask before applying the label**. This is the spec review gate.
- Make sure the issue has its issue type set first, since it decides the branch prefix.
- One build runs at a time; others queue.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a GitHub issue, then set its issue type.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.
