# Example Plan

## Goal

Fix the failing tests for the current project without changing unrelated behavior.

## Scope

- Inspect the test failure first.
- Update only the files needed to fix the issue.
- Preserve unrelated user changes.

## Verification

- Run the project test command discovered from package metadata or docs.
- If no test command exists, run the narrowest available build or smoke check.

## Definition of Done

- The relevant verification command passes.
- The final response lists changed files and remaining risks.
