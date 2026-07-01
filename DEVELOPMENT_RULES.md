# Development Rules for Haland Petcare

## General Principles
- Follow the SRS as the single source of truth for all product decisions.
- Build production-ready code only.
- Never create mock implementations, placeholder pages, or simplified workflows.
- Do not introduce demo content or synthetic data into production-facing features.
- Preserve the existing feature-based architecture.
- Keep the repository maintainable across multiple GitHub accounts, Copilot sessions, Codespaces, and developer machines.

## Architecture Rules
- Keep the current feature-based structure intact.
- Place shared concerns in shared infrastructure layers.
- Keep business logic outside UI components whenever possible.
- Do not duplicate business rules across layers.
- Reuse existing components, hooks, types, and utilities before introducing new ones.

## Database Rules
- All data operations must be designed for Supabase and PostgreSQL.
- Business rules that affect integrity must be enforced at the database layer whenever appropriate.
- Never bypass RLS or use client-side authorization as the sole enforcement mechanism.
- Keep migration files production-ready and versioned.
- Do not commit secrets or local-only credentials.

## Authentication Rules
- Authentication must follow the SRS: username + 6-digit PIN workflow.
- Never create public registration flows.
- Respect role-based authorization centrally.
- Validate account status before granting access.
- Use secure hashing and never store PINs in plaintext.

## Security Rules
- Never expose secrets in code, logs, or repository files.
- Never commit .env files or local credentials.
- Keep sensitive operations behind server-side or database-side enforcement.
- Treat all user and clinic data as confidential.

## UI Rules
- Preserve the existing visual language and shared UI system.
- Use reusable components and shared layouts whenever possible.
- Keep UI state and business logic separated.
- Every interaction should support loading, error, and success states.

## Coding Standards
- Follow TypeScript strict mode.
- Avoid `any` unless there is no reasonable alternative.
- Favor strong typing for all domain models and request payloads.
- Keep functions small and composable.
- Prefer explicit, readable code over clever shortcuts.

## Validation Rules
- Validate every incoming input on both client and server/database boundaries where appropriate.
- Use Zod schemas for validation whenever new schemas are introduced.
- Do not rely on UI validation alone for critical business rules.

## Business Rules
- Do not simplify or skip workflows described in the SRS.
- Preserve auditability for sensitive changes.
- Preserve role-based access restrictions.
- Honor soft-delete and historical-data expectations when relevant.

## Testing Rules
- Verify build and lint before considering work complete.
- Add or update tests when changing behavior.
- Prefer testing real behavior over mocked behavior.

## Git Rules
- Keep commits focused and meaningful.
- Do not commit generated secrets, local environment files, or build artifacts that should stay local.
- Keep documentation and repository configuration in sync with the current codebase.

## Performance Rules
- Avoid unnecessary re-renders and expensive queries.
- Keep list views and dashboards efficient for real production workloads.
- Use database views or indexed queries where appropriate.

## Error Handling Rules
- Surface clear user-facing errors.
- Avoid leaking internal stack traces to end users.
- Keep error handling consistent across features.

## Production Rules
- The build must always pass.
- Lint must always pass.
- The repository must remain usable for future AI collaboration and multi-developer work.

## Definition of Done
A task is complete only when:
- The SRS is respected.
- The build passes.
- Lint passes.
- No placeholder or mock implementation remains in the delivered behavior.
- Documentation reflects the current repository state.
- The change is consistent with the existing architecture.
