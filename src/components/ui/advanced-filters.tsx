/**
 * Filtres avancés avec plages de dates et montants
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FunnelIcon, 
  XMarkIcon, 
  CalendarIcon,
  CurrencyEuroIcon 
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface AmountRangeFilter {
  minAmount: number;
  maxAmount: number;
}

export interface AdvancedFilters {
  dateRange?: DateRangeFilter;
  amountRange?: AmountRangeFilter;
  type?: string;
  status?: string;
  [key: string]: any;
}

export interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  onReset: () => void;
  typeOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
  className?: string;
}

// ============================================================================
// FILTRES AVANCÉS
// ============================================================================

export function AdvancedFilters({
  filters,
  onChange,
  onReset,
  typeOptions,
  statusOptions,
  className,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    onChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        startDate: filters.dateRange?.startDate || '',
        endDate: filters.dateRange?.endDate || '',
        [field]: value,
      },
    });
  };

  const handleAmountRangeChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({
      ...filters,
      amountRange: {
        ...filters.amountRange,
        minAmount: filters.amountRange?.minAmount || 0,
        maxAmount: filters.amountRange?.maxAmount || 0,
        [field]: numValue,
      },
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    onChange({
      ...filters,
      [field]: value === 'all' ? undefined : value,
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key];
    if (!value) return false;
    if (key === 'dateRange') {
      return filters.dateRange?.startDate || filters.dateRange?.endDate;
    }
    if (key === 'amountRange') {
      return filters.amountRange?.minAmount || filters.amountRange?.maxAmount;
    }
    return true;
  }).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <CardTitle className="text-lg">Filtres avancés</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Plage de dates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Label className="text-sm font-semibold">Période</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs text-gray-600 dark:text-gray-400">
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.dateRange?.startDate || ''}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs text-gray-600 dark:text-gray-400">
                  Date de fin
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.dateRange?.endDate || ''}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Plage de montants */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CurrencyEuroIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Label className="text-sm font-semibold">Montant</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minAmount" className="text-xs text-gray-600 dark:text-gray-400">
                  Montant minimum (€)
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="0"
                  value={filters.amountRange?.minAmount || ''}
                  onChange={(e) => handleAmountRangeChange('minAmount', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount" className="text-xs text-gray-600 dark:text-gray-400">
                  Montant maximum (€)
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  min="0"
                  step="10"
                  placeholder="Illimité"
                  value={filters.amountRange?.maxAmount || ''}
                  onChange={(e) => handleAmountRangeChange('maxAmount', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Type */}
          {typeOptions && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Type</Label>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Statut */}
          {statusOptions && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Statut</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Raccourcis de dates */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Raccourcis</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  onChange({
                    ...filters,
                    dateRange: { startDate: today, endDate: today },
                  });
                }}
              >
                Aujourd&apos;hui
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const endDate = new Date();
                  const startDate = new Date();
                  startDate.setDate(startDate.getDate() - 7);
                  onChange({
                    ...filters,
                    dateRange: {
                      startDate: startDate.toISOString().split('T')[0],
                      endDate: endDate.toISOString().split('T')[0],
                    },
                  });
                }}
              >
                7 derniers jours
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const endDate = new Date();
                  const startDate = new Date();
                  startDate.setDate(startDate.getDate() - 30);
                  onChange({
                    ...filters,
                    dateRange: {
                      startDate: startDate.toISOString().split('T')[0],
                      endDate: endDate.toISOString().split('T')[0],
                    },
                  });
                }}
              >
                30 derniers jours
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const endDate = new Date();
                  const startDate = new Date();
                  startDate.setMonth(startDate.getMonth() - 1);
                  onChange({
                    ...filters,
                    dateRange: {
                      startDate: startDate.toISOString().split('T')[0],
                      endDate: endDate.toISOString().split('T')[0],
                    },
                  });
                }}
              >
                Ce mois
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ============================================================================
// HOOK POUR GÉRER LES FILTRES AVANCÉS
// ============================================================================

export function useAdvancedFilters(initialFilters: AdvancedFilters = {}) {
  const [filters, setFilters] = useState<AdvancedFilters>(initialFilters);

  const updateFilters = (newFilters: AdvancedFilters) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => {
      const value = filters[key];
      if (!value) return false;
      if (key === 'dateRange') {
        return filters.dateRange?.startDate || filters.dateRange?.endDate;
      }
      if (key === 'amountRange') {
        return filters.amountRange?.minAmount || filters.amountRange?.maxAmount;
      }
      return true;
    });
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters: hasActiveFilters(),
  };
}
