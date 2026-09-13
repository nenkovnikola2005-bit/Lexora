import type { ChangeEvent } from "react";
import { FormField } from "../ui/FormField";
import { CITIES, PRACTICE_AREAS } from "../../data/constants";
import type { ConnectionLevel, LawyerProfile, NetworkFilters } from "../../models/Lawyer";
import "./FilterPanel.scss";

export interface FilterPanelProps {
  filters: NetworkFilters;
  onChange: (filters: NetworkFilters) => void;
  allLawyers: LawyerProfile[];
}

const LEVELS: { value: ConnectionLevel; label: string }[] = [
  { value: 1, label: "1. nivo" },
  { value: 2, label: "2. nivo" },
  { value: 3, label: "3. nivo" },
];

const CITY_OPTIONS = [
  { value: "", label: "Sve" },
  ...CITIES.map((city) => ({ value: city, label: city })),
];

const EMPTY_FILTERS: NetworkFilters = {
  levels: [],
  practiceAreas: [],
  city: "",
  onlyMutual: false,
};

// Panel filtera za pretragu mreže — nivo povezanosti, oblast prava, grad i zajedničke veze.
export function FilterPanel({ filters, onChange, allLawyers }: FilterPanelProps) {
  const toggleLevel = (level: ConnectionLevel) => {
    const levels = filters.levels.includes(level)
      ? filters.levels.filter((value) => value !== level)
      : [...filters.levels, level];
    onChange({ ...filters, levels });
  };

  const togglePracticeArea = (area: string) => {
    const practiceAreas = filters.practiceAreas.includes(area)
      ? filters.practiceAreas.filter((value) => value !== area)
      : [...filters.practiceAreas, area];
    onChange({ ...filters, practiceAreas });
  };

  const handleCityChange = (city: string) => {
    onChange({ ...filters, city });
  };

  const handleMutualToggle = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, onlyMutual: event.target.checked });
  };

  const hasActiveFilters =
    filters.levels.length > 0 ||
    filters.practiceAreas.length > 0 ||
    Boolean(filters.city) ||
    filters.onlyMutual;

  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <p className="filter-panel__title">Filteri</p>
        {hasActiveFilters && (
          <button
            type="button"
            className="filter-panel__reset"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            Poništi
          </button>
        )}
      </div>

      <fieldset className="filter-panel__group">
        <legend className="filter-panel__legend">Nivo povezanosti</legend>
        {LEVELS.map((level) => (
          <label key={level.value} className="filter-panel__checkbox">
            <input
              type="checkbox"
              checked={filters.levels.includes(level.value)}
              onChange={() => toggleLevel(level.value)}
            />
            <span className="filter-panel__checkbox-label">{level.label}</span>
            <span className="filter-panel__checkbox-count">
              {allLawyers.filter((lawyer) => lawyer.connectionLevel === level.value).length}
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-panel__group">
        <legend className="filter-panel__legend">Oblast prava</legend>
        {PRACTICE_AREAS.map((area) => (
          <label key={area} className="filter-panel__checkbox">
            <input
              type="checkbox"
              checked={filters.practiceAreas.includes(area)}
              onChange={() => togglePracticeArea(area)}
            />
            <span className="filter-panel__checkbox-label">{area}</span>
            <span className="filter-panel__checkbox-count">
              {allLawyers.filter((lawyer) => lawyer.practiceArea === area).length}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="filter-panel__group">
        <FormField
          id="filter-city"
          label="Grad"
          variant="select"
          value={filters.city}
          onChange={handleCityChange}
          options={CITY_OPTIONS}
        />
      </div>

      <label className="filter-panel__toggle">
        <input type="checkbox" checked={filters.onlyMutual} onChange={handleMutualToggle} />
        Samo zajedničke veze
      </label>
    </div>
  );
}
