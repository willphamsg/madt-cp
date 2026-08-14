export const ThemeType = {
    DARK: 'DARK',
    LIGHT: 'LIGHT',
} as const;

export type Theme = (typeof ThemeType)[keyof typeof ThemeType];
