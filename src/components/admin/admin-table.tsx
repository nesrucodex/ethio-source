"use client";
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import "./admin-table.css";

export type AdminColumn<T> = {
  id: string;
  label: string;
  cell: (row: T) => ReactNode;
  align?: "right";
};
export function AdminTable<T>({
  rows,
  columns,
  rowKey,
  caption,
  empty = "No records yet.",
  pageSize = 20,
  loadMore,
  loadingMore = false,
}: {
  rows: T[];
  columns: AdminColumn<T>[];
  rowKey: (row: T) => string;
  caption: string;
  empty?: string;
  pageSize?: number;
  loadMore?: () => void;
  loadingMore?: boolean;
}) {
  const [requestedPage, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
  const page = Math.min(requestedPage, lastPage);
  const visible = rows.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <div className="admin-data-table" aria-busy={loadingMore}>
      <Table>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} scope="col" data-align={column.align}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.id} data-align={column.align}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {!visible.length && (
            <TableRow>
              <TableCell colSpan={columns.length} className="table-empty">
                {empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {(rows.length > pageSize || loadMore || loadingMore) && (
        <nav
          aria-label={`${caption} pagination`}
          className="admin-table-pagination"
        >
          <span role="status">
            {loadingMore
              ? "Loading records…"
              : `Page ${page + 1}${loadMore ? "" : ` of ${lastPage + 1}`}`}
          </span>
          <div>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0 || loadingMore}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft aria-hidden="true" data-icon="inline-start" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loadingMore || (page >= lastPage && !loadMore)}
              onClick={() => {
                if (page < lastPage) setPage(page + 1);
                else if (loadMore) {
                  setPage(page + 1);
                  loadMore();
                }
              }}
            >
              Next
              <ChevronRight aria-hidden="true" data-icon="inline-end" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
export const adminDate = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "Africa/Addis_Ababa",
});

export const adminDateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});
