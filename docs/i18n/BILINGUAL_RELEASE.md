# Bilingual Release Contract

The workspace supports `zh-CN` and `en`. Public marketing pages may add display-only languages independently; they must not add workspace locales without this contract being extended.

## Rules

1. System-owned copy uses a stable translation key and the shared locale catalog. Never use source copy as a key.
2. Every key has both `zh-CN` and `en` values in the same pull request. Do not ship one language first.
3. API identifiers, permissions, roles, module keys, database values, and URLs are language-neutral. Localize them only at the presentation boundary.
4. User-created data is preserved exactly as entered. It is not silently machine-translated.
5. AI-producing endpoints must read `Accept-Language` and instruct the model to respond in the active workspace language. Add an endpoint test whenever a new AI flow is introduced.
6. Backend failures return stable error codes where possible; the client or route-local error formatter renders their localized message.

## Required checks

Run before every bilingual release:

```bash
npm run i18n:check
npm run test:ai-language
npm run typecheck
npm run build
```

`i18n:check` fails for missing keys, extra keys, invalid key format, or empty translations. The CI workflow runs it for all pull requests and changes to `main`.

## Review checklist

- Verify the changed route in both `?lang=zh-CN` and `?lang=en`.
- Confirm labels, placeholders, empty states, dialogs, exports, notifications, and errors use the selected language.
- Confirm locale changes do not alter stored IDs or authorization decisions.
- For PWA releases, accept the update prompt and verify the new locale bundle after refresh.
