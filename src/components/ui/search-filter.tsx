/**
 * Composants de recherche et filtrage réutilisables
 * Supporte recherche en temps réel, filtres multiples et tri
 */

import { useState, useCallback, useMemo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: number;
  className?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
}

export interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset?: () => void;
  className?: string;
}

export interface SortOption {
  value: string;
  label: string;
  direction?: 'asc' | 'desc';
}

export interface SortBarProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  onReset?: () => void;
  className?: string;
}

// ============================================================================
// SEARCH BAR
// ============================================================================

export function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher...',
  debounce = 300,
  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce la recherche
  const debouncedOnChange = useCallback(
    debounce > 0
      ? (() => {
          let timeoutId: NodeJS.Timeout;
          return (newValue: string) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => onChange(newValue), debounce);
          };
        })()
      : onChange,
    [onChange, debounce]
  );

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={cn('relative', className)}>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Effacer la recherche"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// FILTER BAR
// ============================================================================

export function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  className,
}: FilterBarProps) {
  const activeFiltersCount = useMemo(() => {
    return Object.values(values).filter(v => v && v !== 'all').length;
  }, [values]);

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <FunnelIcon className="w-5 h-5" />
        <span>Filtres</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={values[filter.key] || filter.defaultValue || 'all'}
          onValueChange={(value) => onChange(filter.key, value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
                {option.count !== undefined && (
                  <span className="ml-2 text-gray-500">({option.count})</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {onReset && activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <XMarkIcon className="w-4 h-4 mr-1" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// SORT BAR
// ============================================================================

export function SortBar({
  options,
  value,
  onChange,
  className,
}: SortBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Trier par
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================================================
// SEARCH FILTER BAR (Tout-en-un)
// ============================================================================

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  filterValues = {},
  onFilterChange,
  sortOptions,
  sortValue,
  onSortChange,
  onReset,
  className,
}: SearchFilterBarProps) {
  const handleResetAll = () => {
    onSearchChange('');
    onReset?.();
  };

  const hasActiveFilters = useMemo(() => {
    return searchValue || Object.values(filterValues).some(v => v && v !== 'all');
  }, [searchValue, filterValues]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Ligne 1 : Recherche + Tri */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
        {sortOptions && sortValue && onSortChange && (
          <SortBar
            options={sortOptions}
            value={sortValue}
            onChange={onSortChange}
          />
        )}
      </div>

      {/* Ligne 2 : Filtres */}
      {filters && onFilterChange && (
        <FilterBar
          filters={filters}
          values={filterValues}
          onChange={onFilterChange}
          onReset={hasActiveFilters ? handleResetAll : undefined}
        />
      )}
    </div>
  );
}

// ============================================================================
// HOOK POUR GÉRER RECHERCHE ET FILTRES
// ============================================================================

export interface UseSearchFilterOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, string>) => boolean;
  sortFn?: (a: T, b: T, sortKey: string) => number;
}

export function useSearchFilter<T>({
  data,
  searchFields,
  filterFn,
  sortFn,
}: UseSearchFilterOptions<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortValue, setSortValue] = useState('');

  // Filtrer et trier les données
  const filteredData = useMemo(() => {
    let result = [...data];

    // Appliquer la recherche
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Appliquer les filtres
    if (filterFn && Object.keys(filterValues).length > 0) {
      result = result.filter((item) => filterFn(item, filterValues));
    }

    // Appliquer le tri
    if (sortFn && sortValue) {
      result.sort((a, b) => sortFn(a, b, sortValue));
    }

    return result;
  }, [data, searchValue, filterValues, sortValue, searchFields, filterFn, sortFn]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setSearchValue('');
    setFilterValues({});
    setSortValue('');
  };

  return {
    searchValue,
    setSearchValue,
    filterValues,
    setFilterValues,
    handleFilterChange,
    sortValue,
    setSortValue,
    filteredData,
    resetFilters,
    totalResults: filteredData.length,
    isFiltered: searchValue || Object.keys(filterValues).length > 0,
  };
}
