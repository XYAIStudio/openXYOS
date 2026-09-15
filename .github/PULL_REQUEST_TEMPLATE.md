## Summary

Describe the user-visible or operator-visible outcome.

## Security and data impact

Describe authentication, authorization, tenant isolation, secrets, migrations, and stored-data effects. Write “None” only after checking each item.

## Verification

List the exact commands and manual paths you ran.

## Checklist

- [ ] No credentials, customer data, runtime databases, uploads, logs, or build artifacts are included.
- [ ] Tests cover changed behavior and relevant failure paths.
- [ ] User-visible changes include both `zh-CN` and `en` copy; changed routes were checked in both languages.
- [ ] New or changed AI flows have verified output language behavior where applicable.
- [ ] Configuration and documentation are updated.
- [ ] `npm run verify:open-source` passes.
- [ ] Every commit has a DCO `Signed-off-by` line.
- [ ] A maintainer has verified the applicable ICLA/CCLA and applied `cla-signed`.
