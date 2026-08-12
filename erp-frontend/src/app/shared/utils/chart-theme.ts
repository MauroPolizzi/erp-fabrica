import type { ChartDataset, ChartOptions } from 'chart.js';

/**
 * Configuración visual compartida por todos los gráficos.
 *
 * Ningún componente de gráfico define colores propios: los toma de las variables CSS
 * de `styles.css`, así que cambiar el tema del sistema de diseño alcanza para que
 * todos los gráficos lo sigan.
 */

/** Lee un token del sistema de diseño con un valor de respaldo si no está definido. */
function token(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export interface ChartTokens {
  /** Color de las marcas (barras, líneas) en orden fijo de asignación. */
  series: string[];
  grid: string;
  axisText: string;
  surface: string;
}

/**
 * Orden fijo de colores por serie. Se asigna por posición y NUNCA se cicla.
 *
 * Solo dos slots: son los únicos dos tonos no semánticos del sistema de diseño
 * (primary y accent). Verificados en OKLab contra protanopia/deuteranopia
 * (ΔE 32.3, piso 8) y con contraste ≥ 3:1 sobre superficie blanca.
 * Los colores de estado (success/warn/danger) quedan reservados para su significado
 * y no se usan como "serie 3": un tercer color exige sumar un tono al sistema de
 * diseño y volver a validar, no reciclar uno existente.
 */
export function chartTokens(): ChartTokens {
  return {
    series: [token('--color-primary-600', '#2563eb'), token('--color-accent-600', '#d97706')],
    grid: token('--color-surface-200', '#e2e8f0'),
    axisText: token('--color-text-muted', '#64748b'),
    surface: token('--color-surface-0', '#ffffff'),
  };
}

/** Formatea un monto en ARS. `compact` omite los centavos (para los ticks del eje). */
export function formatArs(value: number, compact = false): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(value);
}

/**
 * Specs de marca para barras: como máximo 24px de ancho, punta redondeada de 4px y
 * base recta sobre la línea de cero.
 */
export const BAR_MARK: Partial<ChartDataset<'bar'>> = {
  maxBarThickness: 24,
  borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
  borderSkipped: false,
};

/**
 * Opciones base de un gráfico de importes.
 *
 * Decisiones que valen para todos: sin leyenda (con una sola serie el título ya dice
 * qué se muestra), grilla horizontal recesiva y sin grilla vertical, texto de ejes en
 * el token de texto —nunca en el color de la serie— y tooltip por marca al pasar el mouse.
 */
export function currencyChartOptions(tooltipLabel: (index: number) => string[]): ChartOptions<'bar'> {
  const tokens = chartTokens();
  const fontFamily =
    typeof document === 'undefined' ? 'sans-serif' : getComputedStyle(document.body).fontFamily;
  const font = { family: fontFamily, size: 11 };

  return {
    responsive: true,
    // El alto lo fija el contenedor (app-chart-card), no la relación de aspecto.
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: token('--color-surface-900', '#0f172a'),
        titleFont: { ...font, size: 12 },
        bodyFont: font,
        padding: 10,
        displayColors: false,
        callbacks: { label: (item) => tooltipLabel(item.dataIndex) },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: tokens.grid },
        ticks: { color: tokens.axisText, font, maxRotation: 0, autoSkipPadding: 12 },
      },
      y: {
        beginAtZero: true,
        // Hairline sólida de un paso sobre la superficie: presente pero recesiva.
        grid: { color: tokens.grid, lineWidth: 1, drawTicks: false },
        border: { display: false },
        ticks: {
          color: tokens.axisText,
          font,
          padding: 8,
          callback: (value) => formatArs(Number(value), true),
        },
      },
    },
  };
}
