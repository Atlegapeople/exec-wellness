// Full Spectrum Chart-Ready Palette from palette.md
export const PALETTE = {
  // Core Neutrals (for backgrounds & balance)
  white: '#FFFFFF',
  offWhite: '#F2EFED',
  sand: '#E6DDD6',
  lightGrey: '#D7D9D9',

  // Greens (Corporate Wellness range)
  sage: '#B4CABC',
  fern: '#759282',
  forest: '#586D6A',

  // Teals (Primary core brand)
  duckEgg: '#B6D9CE',
  teal: '#178089',
  softTeal: '#56969D',

  // Warm Accents (from Family Practice)
  lily: '#F5D8DC', // light pink
  rose: '#EDBABE', // soft rose
  coral: '#E19985', // earthy coral
  warmLight: '#EADC99', // pale yellow
  daisy: '#EAB75C', // golden yellow
  sunset: '#D65241', // warm red

  // Legacy medical colors for compatibility
  primary: {
    base: '#178089', // Updated to match teal
    light: '#56969D', // Updated to match softTeal
    dark: '#586D6A', // Updated to match forest
  },
  secondary: {
    alert: '#D65241', // Updated to match sunset
    warning: '#EAB75C', // Updated to match daisy
  },
  neutral: {
    base: '#D7D9D9', // Updated to match lightGrey
    light: '#F2EFED', // Updated to match offWhite
    dark: '#586D6A', // Updated to match forest
  },
  supporting: {
    blue: '#B6D9CE', // Updated to match duckEgg
    purple: '#F5D8DC', // Updated to match lily
  },
};

// Enhanced color mapping rules with full spectrum
const COLOR_MAP = {
  // Positive/Good results - using teals and greens
  Normal: '#178089', // teal
  Good: '#178089', // teal
  'Low Risk': '#178089', // teal
  Present: '#178089', // teal
  Excellent: '#B4CABC', // sage
  Optimal: '#759282', // fern

  // Negative/Alert results - using warm accents
  Abnormal: '#D65241', // sunset
  Poor: '#D65241', // sunset
  'High Risk': '#D65241', // sunset
  Critical: '#E19985', // coral

  // Warning/Medium results - using warm yellows
  'Medium Risk': '#EAB75C', // daisy
  Moderate: '#EAB75C', // daisy
  Caution: '#EADC99', // warmLight

  // Neutral/Unknown results - using neutrals
  Unknown: '#D7D9D9', // lightGrey
  'Not Recorded': '#D7D9D9', // lightGrey
  'Not Done': '#D7D9D9', // lightGrey
  'Not Assessed': '#D7D9D9', // lightGrey
  Pending: '#F2EFED', // offWhite
};

// Dynamic chart series colors using full spectrum
export const CHART_SERIES_COLORS = [
  '#178089', // teal - primary
  '#B6D9CE', // duckEgg - secondary
  '#B4CABC', // sage - tertiary
  '#759282', // fern - quaternary
  '#EAB75C', // daisy - accent 1
  '#E19985', // coral - accent 2
  '#F5D8DC', // lily - accent 3
  '#EDBABE', // rose - accent 4
  '#EADC99', // warmLight - accent 5
  '#D65241', // sunset - accent 6
];

// Sequential data gradients for charts
export const SEQUENTIAL_COLORS = {
  green: ['#B4CABC', '#759282', '#586D6A'], // Sage → Fern → Forest
  teal: ['#B6D9CE', '#178089', '#56969D'], // Duck Egg → Teal → Soft Teal
  warm: ['#F5D8DC', '#EDBABE', '#E19985'], // Lily → Rose → Coral
  neutral: ['#FFFFFF', '#F2EFED', '#E6DDD6'], // White → Off-white → Sand
};

// Diverging data colors for charts
export const DIVERGING_COLORS = {
  positive: ['#178089', '#B6D9CE', '#B4CABC'], // Teals and Greens
  negative: ['#D65241', '#E19985', '#EAB75C'], // Sunset, Coral, Daisy
  midpoint: '#F2EFED', // Off-white as neutral midpoint
};

// Categorical data colors ensuring distinguishability
export const CATEGORICAL_COLORS = [
  '#178089', // teal
  '#B6D9CE', // duckEgg
  '#B4CABC', // sage
  '#EAB75C', // daisy
  '#E19985', // coral
  '#F5D8DC', // lily
  '#EDBABE', // rose
  '#EADC99', // warmLight
  '#759282', // fern
  '#D65241', // sunset
];

// Highlight and alert colors
export const HIGHLIGHT_COLORS = {
  warning: '#D65241', // sunset for warnings/errors
  positive: '#EAB75C', // daisy for positive emphasis
  info: '#178089', // teal for informational
  success: '#759282', // fern for success
};

// Background colors for charts
export const BACKGROUND_COLORS = {
  primary: '#FFFFFF', // White
  secondary: '#F2EFED', // Off-white
  tertiary: '#E6DDD6', // Sand
  quaternary: '#D7D9D9', // Light Grey
};

// Get color for any result with enhanced mapping
export function getResultColor(result: string): string {
  const key = result.trim();
  return COLOR_MAP[key as keyof typeof COLOR_MAP] || PALETTE.neutral.base;
}

// Enhanced badge classes with new color scheme using palette colors
const BADGE_CLASSES = {
  good: 'text-white border-0', // Will use inline styles with palette colors
  warning: 'text-white border-0', // Will use inline styles with palette colors
  alert: 'text-white border-0', // Will use inline styles with palette colors
  neutral: 'text-white border-0', // Will use inline styles with palette colors
  info: 'text-white border-0', // Will use inline styles with palette colors
};

// Get badge class based on score thresholds
export function getBadgeClass(
  value: number,
  thresholds: { good: number; warning: number }
): string {
  if (value >= thresholds.good) return BADGE_CLASSES.good;
  if (value >= thresholds.warning) return BADGE_CLASSES.warning;
  return BADGE_CLASSES.alert;
}

// Get badge background color based on score thresholds
export function getBadgeColor(
  value: number,
  thresholds: { good: number; warning: number }
): string {
  if (value >= thresholds.good) return PALETTE.teal; // Good = Teal
  if (value >= thresholds.warning) return PALETTE.daisy; // Warning = Daisy (yellow)
  return PALETTE.sunset; // Alert = Sunset (red)
}

// Get dynamic color for chart series based on index
export function getSeriesColor(index: number): string {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length];
}

// Get sequential color for gradient charts
export function getSequentialColor(
  index: number,
  type: keyof typeof SEQUENTIAL_COLORS = 'teal'
): string {
  const colors = SEQUENTIAL_COLORS[type];
  return colors[index % colors.length];
}

// Get diverging color for comparison charts
export function getDivergingColor(
  value: number,
  min: number,
  max: number,
  isPositive: boolean = true
): string {
  const colors = isPositive
    ? DIVERGING_COLORS.positive
    : DIVERGING_COLORS.negative;
  const normalizedValue = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const colorIndex = Math.floor(normalizedValue * (colors.length - 1));
  return colors[colorIndex];
}
