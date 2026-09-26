# Contributing — branching and merge rules

Trunk-based, with short-lived branches. `main` is the only long-lived branch and is always
deployable. There is no `develop` branch: the project isn't under constant development, so
a second trunk would only drift.

## Flow

1. **Branch from an up-to-date `main`**
   ```bash
   git switch main && git pull --ff-only
   git switch -c feat/phase-2-domain
   ```
2. **Commit in small, reviewable steps.** Use conventional commits (`feat:`, `fix:`,
   `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `perf:`, `style:`).
3. **Push and open a pull request into `main`.** Fill in the template. CI (`check`: lint,
   typecheck, format, test, build) must be green.
4. **Merge on GitHub**, then delete the branch (automatic). Pull `main` locally.

Nothing reaches `main` except through a pull request.

## Branch names

`<type>/<short-kebab-description>`, where `<type>` matches the commit type:

| Prefix                               | For                                          |
| ------------------------------------ | -------------------------------------------- |
| `feat/`                              | New behaviour or UI (`feat/phase-3-hero`)    |
| `fix/`                               | Bug fixes (`fix/modal-focus-return`)         |
| `chore/`                             | Tooling, deps, config (`chore/bump-actions`) |
| `docs/`                              | Docs only                                    |
| `refactor/`, `perf/`, `test/`, `ci/` | As named                                     |

Phase work uses `feat/phase-<n>-<scope>`. One phase may span several branches and PRs. Keep
a branch to one reviewable unit: days, not weeks.

## Merge method

- **Rebase and merge** (default): keeps each reviewed, conventional commit on `main` with
  linear history. Use it when the branch's commits are each meaningful.
- **Squash and merge**: for branches with fix-up or WIP commits. The PR title becomes the
  single commit message, so write it as a conventional commit.
- Merge commits are disabled.

## Safeguards

| Guard                                                                                                               | Where                      | Status                                           |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------ |
| CI `check` job on every PR and every push to `main`                                                                 | `.github/workflows/ci.yml` | ✅ active                                        |
| Squash/rebase merges only; branches deleted on merge                                                                | GitHub repo settings       | ✅ active                                        |
| Local hook: no commits directly on `main`                                                                           | `.githooks/pre-commit`     | ✅ active after `npm install`                    |
| Local hook: no pushes to `main`                                                                                     | `.githooks/pre-push`       | ✅ active after `npm install`                    |
| Server-side: PR required, `check` must pass, branch up to date, no force-push or deletion of `main`, linear history | GitHub ruleset             | ⏳ needs a public repo or GitHub Pro (see below) |

The local hooks are installed by `npm install` (the `prepare` script sets
`core.hooksPath=.githooks`). In a genuine emergency they can be bypassed with
`git commit --no-verify` / `git push --no-verify`. Don't make a habit of it.

### Server-side ruleset (to apply when the repo is public or on Pro)

Target: default branch. Rules: restrict deletions · block force pushes · require linear
history · require a pull request (0 approvals, since it's a solo repo; conversation
resolution required) · require status check `check` with "branch must be up to date". No
bypass actors.
