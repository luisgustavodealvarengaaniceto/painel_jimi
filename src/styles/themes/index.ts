import { defaultTheme } from './default';
import { akrozTheme } from './akroz';

export type Theme = typeof defaultTheme;

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  akroz: akrozTheme,
};

export const getThemeByTenant = (tenant: string): Theme => {
  return themes[tenant] || themes.default;
};

export { defaultTheme, akrozTheme };
