# Creating the Draft PR

## Branch Information
- **Source Branch:** `copilot/hardening` (or `hardening`)
- **Target Branch:** `main`
- **PR Title:** `hardening: repository hardening (dependencies, tsconfig, OpenAI, BrandGuard)`
- **PR State:** DRAFT

## PR Description

Use the content from `PR_DESCRIPTION.md` as the PR body.

## How to Create (Manual)

If creating manually via GitHub UI:

1. Go to https://github.com/graveranarango/em-estudio/pulls
2. Click "New pull request"
3. Set base: `main`, compare: `copilot/hardening` (or `hardening`)
4. Click "Create pull request"
5. Paste content from `PR_DESCRIPTION.md` into the PR body
6. **Important:** Click the dropdown next to "Create pull request" and select "Create draft pull request"
7. Click "Create draft pull request"

## How to Create (CLI)

If using GitHub CLI:

```bash
gh pr create \
  --base main \
  --head copilot/hardening \
  --title "hardening: repository hardening (dependencies, tsconfig, OpenAI, BrandGuard)" \
  --body-file PR_DESCRIPTION.md \
  --draft
```

## PR Checklist (from problem statement)

- [x] Link the drafted issues in the PR description (included in PR_DESCRIPTION.md)
- [x] Include code fragments for tsconfig.json, index.ts, and package.jsons in the PR body (included in PR_DESCRIPTION.md)
- [x] Mark PR as draft (instructions provided)

## Notes

This PR is purely documentation. No actual code changes have been applied. The files modified are:
- `PR_PLAN.md` - Detailed technical plan
- `PR_DESCRIPTION.md` - PR body content
- `DRAFT_PR_INSTRUCTIONS.md` - This file

The actual hardening changes (tsconfig.json, package.json files, index.ts, etc.) will be applied in follow-up commits after this draft PR is reviewed and approved.
