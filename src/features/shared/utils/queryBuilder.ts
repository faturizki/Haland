export interface QueryFilter {
  column: string;
  operator: 'eq' | 'isNull' | 'in';
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
}

export const createQueryBuilder = (table: string, select: string) => {
  const filters: QueryFilter[] = [];
  let sort: QuerySort | undefined;
  let pagination: QueryPagination | undefined;
  let projection: string[] | undefined;
  let search: string | undefined;
  let cursor: string | undefined;
  let range: QueryRange | undefined;

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
      };
    },
  };
};
