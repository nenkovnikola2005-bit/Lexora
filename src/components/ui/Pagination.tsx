import type { UsePaginationResult } from "../../hooks/usePagination";
import { Button } from "./Button";
import "./Pagination.scss";

export type PaginationProps = Pick<
  UsePaginationResult<unknown>,
  "page" | "totalPages" | "goToPage" | "nextPage" | "prevPage"
>;

// Kontrole za usePagination hook — brojevi strana plus dugmad Prethodna/Sledeća.
export function Pagination({ page, totalPages, goToPage, nextPage, prevPage }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Paginacija">
      <Button variant="outline" size="small" onClick={prevPage} disabled={page === 1}>
        Prethodna
      </Button>

      <ul className="pagination__pages">
        {pages.map((pageNumber) => (
          <li key={pageNumber}>
            <button
              type="button"
              className={
                pageNumber === page
                  ? "pagination__page pagination__page--active"
                  : "pagination__page"
              }
              onClick={() => goToPage(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </button>
          </li>
        ))}
      </ul>

      <Button variant="outline" size="small" onClick={nextPage} disabled={page === totalPages}>
        Sledeća
      </Button>
    </nav>
  );
}
