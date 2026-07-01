export interface QueryFilter {
  column: string;
  operator: 'eq' | 'isNull' | 'in' | 'contains';
  value: unknown;
}

export interface QuerySort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface QueryPagination {
  limit?: number;
  offset?: number;
}

export interface QueryRange {
  from: number;
  to: number;
}

export interface QuerySpec {
  table: string;
  select: string;
  filters: QueryFilter[];
  sort?: QuerySort;
  pagination?: QueryPagination;
  projection?: string[];
  search?: string;
  cursor?: string;
  range?: QueryRange;
  includeRelations?: string[];
  selectFields?: string[];
  tenantScope?: string;
  softDelete?: boolean;
  optimisticLock?: { column: string; value: unknown };
  batch?: unknown[];
}

export const createQueryBuilder = (table: string, select: string) => {
  const filters: QueryFilter[] = [];
  let sort: QuerySort | undefined;
  let pagination: QueryPagination | undefined;
  let projection: string[] | undefined;
  let search: string | undefined;
  let cursor: string | undefined;
  let range: QueryRange | undefined;
  let includeRelations: string[] | undefined;
  let selectFields: string[] | undefined;
  let tenantScope: string | undefined;
  let softDelete: boolean | undefined;
  let optimisticLock: { column: string; value: unknown } | undefined;
  let batch: unknown[] | undefined;

  return {
    where(column: string, value: unknown, operator: QueryFilter['operator'] = 'eq') {
      filters.push({ column, operator, value });
      return this;
    },
    orderBy(column: string, direction: QuerySort['direction'] = 'asc') {
      sort = { column, direction };
      return this;
    },
    page(paginationInput: QueryPagination) {
      pagination = paginationInput;
      return this;
    },
    select(columns: string | string[]) {
      projection = Array.isArray(columns) ? columns : columns.split(',').map((column) => column.trim()).filter(Boolean);
      return this;
    },
    search(term: string) {
      search = term;
      return this;
    },
    cursor(token: string) {
      cursor = token;
      return this;
    },
    range(from: number, to: number) {
      range = { from, to };
      return this;
    },
    includeRelation(relation: string) {
      includeRelations = includeRelations ?? [];
      includeRelations.push(relation);
      return this;
    },
    selectFields(columns: string | string[]) {
      selectFields = Array.isArray(columns) ? columns : columns.split(',').map((column) => column.trim()).filter(Boolean);
      return this;
    },
    tenantScope(clinicId: string) {
      tenantScope = clinicId;
      return this;
    },
    softDelete(includeArchived = false) {
      softDelete = includeArchived;
      return this;
    },
    optimisticLock(column: string, value: unknown) {
      optimisticLock = { column, value };
      return this;
    },
    batch(values: unknown[]) {
      batch = values;
      return this;
    },
    toSpec(): QuerySpec {
      return {
        table,
        select,
        filters,
        sort,
        pagination,
        projection: projection ?? select.split(',').map((column) => column.trim()).filter(Boolean),
        search,
        cursor,
        range,
        includeRelations,
        selectFields,
        tenantScope,
        softDelete,
        optimisticLock,
        batch,
      };
    },
  };
};
