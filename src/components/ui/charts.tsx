/**
 * Composants de graphiques réutilisables avec Recharts
 * Supporte différents types de graphiques avec dark mode
 */

'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/lib/common-utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ChartData {
  [key: string]: string | number;
}

export interface ChartConfig {
  dataKey: string;
  name: string;
  color: string;
}

export interface BaseChartProps {
  data: ChartData[];
  title?: string;
  description?: string;
  height?: number;
  className?: string;
}

export interface LineChartProps extends BaseChartProps {
  lines: ChartConfig[];
  xAxisKey: string;
  showGrid?: boolean;
  showLegend?: boolean;
  curved?: boolean;
}

export interface BarChartProps extends BaseChartProps {
  bars: ChartConfig[];
  xAxisKey: string;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export interface AreaChartProps extends BaseChartProps {
  areas: ChartConfig[];
  xAxisKey: string;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export interface PieChartProps extends BaseChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
  showLegend?: boolean;
  innerRadius?: number;
}

// ============================================================================
// COULEURS PAR DÉFAUT
// ============================================================================

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

// ============================================================================
// TOOLTIP PERSONNALISÉ
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number) => string;
}

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 p-3 shadow-lg">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// LINE CHART
// ============================================================================

export function CustomLineChart({
  data,
  lines,
  xAxisKey,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  curved = true,
  className,
}: LineChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
            <Tooltip
              content={<CustomTooltip formatter={(v) => formatCurrency(v)} />}
            />
            {showLegend && <Legend />}
            {lines.map((line, index) => (
              <Line
                key={line.dataKey}
                type={curved ? 'monotone' : 'linear'}
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// BAR CHART
// ============================================================================

export function CustomBarChart({
  data,
  bars,
  xAxisKey,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  className,
}: BarChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
            <Tooltip
              content={<CustomTooltip formatter={(v) => formatCurrency(v)} />}
            />
            {showLegend && <Legend />}
            {bars.map((bar, index) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                stackId={stacked ? 'stack' : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// AREA CHART
// ============================================================================

export function CustomAreaChart({
  data,
  areas,
  xAxisKey,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  className,
}: AreaChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
            <Tooltip
              content={<CustomTooltip formatter={(v) => formatCurrency(v)} />}
            />
            {showLegend && <Legend />}
            {areas.map((area, index) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={area.color}
                fill={area.color}
                fillOpacity={0.6}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PIE CHART
// ============================================================================

export function CustomPieChart({
  data,
  dataKey,
  nameKey,
  title,
  description,
  height = 300,
  colors = DEFAULT_COLORS,
  showLegend = true,
  innerRadius = 0,
  className,
}: PieChartProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={80}
              label={(entry) => `${entry[nameKey]}: ${formatCurrency(entry[dataKey])}`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showLegend && <Legend />}
            <Tooltip
              content={<CustomTooltip formatter={(v) => formatCurrency(v)} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// GRAPHIQUE DE STATISTIQUES RAPIDES
// ============================================================================

interface StatsChartProps {
  data: {
    label: string;
    value: number;
    change?: number;
    color?: string;
  }[];
  title?: string;
  className?: string;
}

export function StatsChart({ data, title, className }: StatsChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {data.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stat.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(stat.value)}
                </span>
                {stat.change !== undefined && (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      stat.change >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {stat.change >= 0 ? '+' : ''}
                    {stat.change.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(stat.value / maxValue) * 100}%`,
                  backgroundColor: stat.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
