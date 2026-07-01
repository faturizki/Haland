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

  it('supports cursor pagination, search, and projection', () => {
    const query = createQueryBuilder('customers', 'id, name')
      .select(['id', 'name'])
      .search('alice')
      .cursor('next-page')
      .range(0, 49);

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
    });
  });
});
