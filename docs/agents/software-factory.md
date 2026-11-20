# Software factory

How an idea or bug becomes a merged PR in this repo. Nick keeps three gates: the spec, the code review he chooses to do, and the product check on the preview.

## The flow

| Step            | Where it runs                       | What happens                                                                                                                                                            | Who's needed       |
| --------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 1. File         | GitHub                              | Someone files a Feature or Bug issue from the issue forms. It gets `needs-triage`.                                                                                      | Anyone             |
| 2. Plan         | Claude Code on Nick's Mac           | `/triage` sorts the issue. Small, clear ones get an agent brief. Bigger ones go through `/grill-with-docs`, then `/to-spec`. The spec copies in the SSHD story details. | Nick (interactive) |
| 3. Spec gate    | Claude Code on Nick's Mac           | Nick reads the final spec or brief, then says yes to the `ready-for-agent` label.                                                                                       | Nick               |
| 4. Build        | GitHub Actions (`claude-build.yml`) | Claude builds it test-first on a `fix/`, `feature/` or `chore/` branch, runs `vp check` and the unit tests, and opens a PR.                                             | Nobody             |
| 5. Verify       | GitHub Actions                      | CI, the Cloudflare preview and the Claude review (`claude-review.yml`) run on the PR.                                                                                   | Nobody             |
| 6. Product gate | Cloudflare preview                  | Nick clicks through the preview and merges.                                                                                                                             | Nick               |

If the build gets stuck, it comments on the issue and swaps the label to `needs-info` (spec unclear) or `ready-for-human` (checks won't pass). Nothing merges without Nick.

## One-time setup on the Mac

1. In Claude Code, install the skills: `claude plugin install mattpocock-skills@claude-plugins-official`
2. Make sure `gh` is signed in: `gh auth status`
3. Pull `main` in this repo. The skills config is already in `docs/agents/`, so skip `/setup-matt-pocock-skills`.

## Day to day on the Mac

From this repo in Claude Code:

- `/triage`: "show me what needs attention", or "let's look at #42".
- For a feature that needs thinking through: `/grill-with-docs` about the issue, then `/to-spec` to publish the spec.
- Before the `ready-for-agent` label goes on, check the issue type is set (Bug, Feature or Task). It picks the branch prefix.

## Limits

Everything runs on Nick's Claude Pro subscription. One build runs at a time and others queue. A build is capped at 80 turns and 60 minutes, and a review at 40 turns.
