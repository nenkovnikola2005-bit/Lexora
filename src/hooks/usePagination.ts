import { useMemo, useState } from "react";

export interface UsePaginationResult<T> {
  page: number;
  totalPages: number;
  pageItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination<T>(
  items: T[],
  pageSize: number,
): UsePaginationResult<T> {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  const goToPage = (target: number) => {
    setPage(Math.min(Math.max(1, target), totalPages));
  };
  const nextPage = () => goToPage(safePage + 1);
  const prevPage = () => goToPage(safePage - 1);

  return { page: safePage, totalPages, pageItems, goToPage, nextPage, prevPage };
}
