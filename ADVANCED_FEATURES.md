# Advanced Features Ledger

This document tracks all advanced functionalities added to this repository. Use this as a reference if you need to port code back to the production repository in the future.

---

| Feature Name | Date Added | Files Affected | Description | Branch Name |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Detachment** | 2026-04-16 | Root Structure | Disconnected from prod git, renamed server folder. | `base-prod` |

---

## Porting Instructions
To move a feature back to production:
1. Identify the branch for the feature.
2. Run `git diff base-prod..feat/your-feature` to see all changes.
3. Manually apply or `git cherry-pick` the commits to your production repository.
