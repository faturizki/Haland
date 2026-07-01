import { describe, expect, it } from 'vitest';
import { createQueryBuilder } from './queryBuilder';

describe('createQueryBuilder', () => {
  it('builds a reusable query spec with filter, sort, and pagination', () => {
    const query = createQueryBuilder('customers', 'id, name')
      .where('deleted_at', null)
      .orderBy('created_at', 'desc')
      .page({ limit: 10, offset: 20 });

    expect(query.toSpec()).toEqual({
      table: 'customers',
      select: 'id, name',
      filters: [{ column: 'deleted_at', operator: 'eq', value: null }],
      sort: { column: 'created_at', direction: 'desc' },
      pagination: { limit: 10, offset: 20 },
      projection: ['id', 'name'],
      search: undefined,
      cursor: undefined,
      range: undefined,
    });
  });

  it('supports cursor pagination, search, projection, relation includes, field selection, and tenant-safe abstractions', () => {
    const query = createQueryBuilder('customers', 'id, name')
      .select(['id', 'name'])
      .search('alice')
      .cursor('next-page')
      .range(0, 49)
      .includeRelation('profile')
      .selectFields(['id', 'name'])
      .tenantScope('clinic-123')
      .softDelete(false)
      .optimisticLock('version', 3)
      .batch(['id-1', 'id-2']);

    expect(query.toSpec()).toEqual({
      table: 'customers',
      select: 'id, name',
      filters: [],
      sort: undefined,
      pagination: undefined,
      projection: ['id', 'name'],
      search: 'alice',
      cursor: 'next-page',
      range: { from: 0, to: 49 },
      includeRelations: ['profile'],
      selectFields: ['id', 'name'],
      tenantScope: 'clinic-123',
      softDelete: false,
      optimisticLock: { column: 'version', value: 3 },
      batch: ['id-1', 'id-2'],
    });
  });
});
