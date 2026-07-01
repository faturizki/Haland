import type { ReactNode } from 'react';
import type { TableColumn } from '../types';

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  renderEmpty?: () => ReactNode;
}

export const DataTable = <T,>({ columns, rows, emptyMessage, renderEmpty }: DataTableProps<T>) => {
  if (rows.length === 0) {
    return <div className="data-table__empty">{renderEmpty ? renderEmpty() : emptyMessage ?? 'No records found.'}</div>;
  }

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>{column.render ? column.render(row) : null}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
