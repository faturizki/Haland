# Architecture Hardening Notes

## Repository Flow

Presentation → Application → Repository Interface → BaseRepository → Infrastructure Repository → Supabase

## Dependency Graph

- UI components depend on application use cases.
- Use cases depend on repository interfaces.
- Repository implementations extend the shared BaseRepository and call Supabase from the infrastructure layer.
- Shared services provide logging, metrics, auditing, retry, health, and trace context.

## Request Flow

1. UI triggers an application use case.
2. The use case resolves a repository interface.
3. The repository implementation executes through BaseRepository.
4. Shared infrastructure records metrics, tracing, audit, and retries.
5. The infrastructure repository calls Supabase and returns normalized data.

## Observability Flow

- StructuredLogger emits structured log entries.
- AuditLogger records lifecycle events.
- RepositoryMetrics tracks latency and failure rates.
- TraceContext supplies request, trace, and correlation identifiers.
