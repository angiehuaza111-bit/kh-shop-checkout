export interface ColorPalette {
  background: string;
  card: string;
  primary: string;
  primaryPressed: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  text: string;
  textSecondary: string;
  border: string;
  overlay: string;
  white: string;
  successBg: string;
  warningBg: string;
  dangerBg: string;
  primaryBg: string;
  gradientStart: string;
  gradientEnd: string;
}

export const lightColors: ColorPalette = {
  background: '#F7F8FA',
  card: '#FFFFFF',
  primary: '#2563EB',
  primaryPressed: '#1D4ED8',
  accent: '#3B82F6',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  overlay: 'rgba(15, 23, 42, 0.55)',
  white: '#FFFFFF',
  successBg: '#DCFCE7',
  warningBg: '#FEF3C7',
  dangerBg: '#FEE2E2',
  primaryBg: '#DBEAFE',
  gradientStart: '#2563EB',
  gradientEnd: '#3B82F6',
};

export const darkColors: ColorPalette = {
  background: '#0B1220',
  card: '#151E2E',
  primary: '#4F8CFF',
  primaryPressed: '#3B72E0',
  accent: '#38BDF8',
  success: '#22C55E',
  warning: '#FBBF24',
  danger: '#F87171',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: 'rgba(255, 255, 255, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.65)',
  white: '#FFFFFF',
  successBg: 'rgba(34, 197, 94, 0.16)',
  warningBg: 'rgba(251, 191, 36, 0.16)',
  dangerBg: 'rgba(248, 113, 113, 0.16)',
  primaryBg: 'rgba(79, 140, 255, 0.16)',
  gradientStart: '#4F8CFF',
  gradientEnd: '#38BDF8',
};
