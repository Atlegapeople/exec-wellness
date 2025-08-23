// Simple medical color palette
export const PALETTE = {
  primary: {
    base: "#00897B",
    light: "#4DB6AC", 
    dark: "#00695C"
  },
  secondary: {
    alert: "#E53935",
    warning: "#FB8C00"
  },
  neutral: {
    base: "#BDBDBD",
    light: "#E0E0E0",
    dark: "#757575"
  },
  supporting: {
    blue: "#1E88E5",
    purple: "#8E24AA"
  }
};

// Color mapping rules
const COLOR_MAP = {
  "Normal": PALETTE.primary.base,
  "Good": PALETTE.primary.base,
  "Low Risk": PALETTE.primary.light,
  "Abnormal": PALETTE.secondary.alert,
  "Poor": PALETTE.secondary.alert,
  "Medium Risk": PALETTE.secondary.warning,
  "Unknown": PALETTE.neutral.base,
  "Not Recorded": PALETTE.neutral.light
};

// Chart series colors
export const CHART_SERIES_COLORS = [
  PALETTE.primary.base,
  PALETTE.primary.light,
  PALETTE.supporting.blue,
  PALETTE.supporting.purple,
  PALETTE.secondary.warning,
  PALETTE.primary.dark
];

// Get color for any result
export function getResultColor(result: string): string {
  const key = result.trim();
  return COLOR_MAP[key as keyof typeof COLOR_MAP] || PALETTE.neutral.base;
}

// Badge classes for different score ranges
const BADGE_CLASSES = {
  good: 'bg-teal-100 text-teal-700 border-teal-200',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
  alert: 'bg-red-100 text-red-700 border-red-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200'
};

// Get badge class based on score thresholds
export function getBadgeClass(value: number, thresholds: { good: number; warning: number }): string {
  if (value >= thresholds.good) return BADGE_CLASSES.good;
  if (value >= thresholds.warning) return BADGE_CLASSES.warning;
  return BADGE_CLASSES.alert;
}