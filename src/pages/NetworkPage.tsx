import { useEffect, useMemo, useState } from "react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Pagination } from "../components/ui/Pagination";
import { FilterPanel } from "../components/network/FilterPanel";
import { LawyerCard } from "../components/network/LawyerCard";
import { usePagination } from "../hooks/usePagination";
import { NetworkService } from "../services/NetworkService";
import type { LawyerProfile, NetworkFilters } from "../models/Lawyer";
import "./NetworkPage.scss";

const EMPTY_FILTERS: NetworkFilters = {
  levels: [],
  practiceAreas: [],
  city: "",
  onlyMutual: false,
};

const PAGE_SIZE = 6;

export function NetworkPage() {
  const networkService = useMemo(() => new NetworkService(), []);

  const [filters, setFilters] = useState<NetworkFilters>(EMPTY_FILTERS);
  const [directory, setDirectory] = useState<LawyerProfile[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<LawyerProfile[]>([]);

  const refreshDirectory = (nextFilters: NetworkFilters) => {
    setDirectory(networkService.getDirectory(nextFilters));
  };

  const refreshPending = () => {
    setPendingIncoming(networkService.getPendingIncoming());
  };

  // Učitava direktorijum i pozivnice jednom, pri prvom renderovanju stranice.
  useEffect(() => {
    networkService.seedIfEmpty();
    refreshDirectory(EMPTY_FILTERS);
    refreshPending();
  }, [networkService]);

  const { page, totalPages, pageItems, goToPage, nextPage, prevPage } = usePagination(
    directory,
    PAGE_SIZE,
  );

  const handleFiltersChange = (nextFilters: NetworkFilters) => {
    setFilters(nextFilters);
    refreshDirectory(nextFilters);
    goToPage(1);
  };

  const handleConnect = (lawyerId: string) => {
    networkService.sendRequest(lawyerId);
    refreshDirectory(filters);
  };

  const handleAccept = (lawyerId: string) => {
    networkService.accept(lawyerId);
    refreshDirectory(filters);
    refreshPending();
  };

  const handleDecline = (lawyerId: string) => {
    networkService.decline(lawyerId);
    refreshPending();
  };

  return (
    <div className="network-page">
      <aside className="network-page__filters">
        <FilterPanel filters={filters} onChange={handleFiltersChange} />
      </aside>

      <section className="network-page__results">
        {pendingIncoming.length > 0 && (
          <div className="network-page__invitations">
            <h2 className="network-page__section-title">Pozivnice</h2>
            <div className="network-page__invitations-list">
              {pendingIncoming.map((lawyer) => (
                <div key={lawyer.id} className="network-page__invitation">
                  <Avatar initials={lawyer.avatarInitials} size="md" />
                  <div className="network-page__invitation-info">
                    <p className="network-page__invitation-name">
                      {lawyer.firstName} {lawyer.lastName}
                    </p>
                    <p className="network-page__invitation-headline">{lawyer.headline}</p>
                  </div>
                  <div className="network-page__invitation-actions">
                    <Button size="small" onClick={() => handleAccept(lawyer.id)}>
                      Prihvati
                    </Button>
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => handleDecline(lawyer.id)}
                    >
                      Odbij
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="network-page__section-title">
          Rezultati{directory.length > 0 ? ` (${directory.length})` : ""}
        </h2>

        {pageItems.length === 0 ? (
          <p className="network-page__empty">
            Nema pravnika koji odgovaraju izabranim filterima.
          </p>
        ) : (
          <div className="network-page__grid">
            {pageItems.map((lawyer) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                status={networkService.getConnectionStatus(lawyer.id)}
                onConnect={handleConnect}
              />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          goToPage={goToPage}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      </section>
    </div>
  );
}
