import type { BuiltinThemeType } from '@vben-core/typings';

interface BuiltinThemePreset {
  color: string;
  darkPrimaryColor?: string;
  headerColor?: string;
  primaryColor?: string;
  sidebarColor?: string;
  type: BuiltinThemeType;
}

const BUILT_IN_THEME_PRESETS: BuiltinThemePreset[] = [
  {
    color: 'hsl(212 100% 45%)',
    headerColor: 'hsl(221 100% 18%)',
    sidebarColor: 'hsl(221 84% 27%)',
    type: 'default',
  },
  {
    color: 'hsl(245 82% 67%)',
    headerColor: 'hsl(245 64% 21%)',
    sidebarColor: 'hsl(244 32% 29%)',
    type: 'violet',
  },
  {
    color: 'hsl(347 77% 60%)',
    headerColor: 'hsl(349 55% 19%)',
    sidebarColor: 'hsl(347 29% 30%)',
    type: 'pink',
  },
  {
    color: 'hsl(42 84% 61%)',
    headerColor: 'hsl(42 55% 19%)',
    sidebarColor: 'hsl(40 31% 28%)',
    type: 'yellow',
  },
  {
    color: 'hsl(231 98% 65%)',
    headerColor: 'hsl(231 53% 25%)',
    sidebarColor: 'hsl(229 37% 35%)',
    type: 'sky-blue',
  },
  {
    color: 'hsl(161 90% 43%)',
    headerColor: 'hsl(161 77% 12%)',
    sidebarColor: 'hsl(160 41% 23%)',
    type: 'green',
  },
  {
    color: 'hsl(240 5% 26%)',
    headerColor: 'hsl(240 5% 26%)',
    sidebarColor: 'hsl(240 1% 33%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'zinc',
  },

  {
    color: 'hsl(181 84% 32%)',
    headerColor: 'hsl(181 74% 18%)',
    sidebarColor: 'hsl(181 41% 33%)',
    type: 'deep-green',
  },

  {
    color: 'hsl(211 91% 39%)',
    headerColor: 'hsl(211 90% 20%)',
    sidebarColor: 'hsl(211 92% 29%)',
    type: 'deep-blue',
  },
  {
    color: 'hsl(18 89% 40%)',
    headerColor: 'hsl(18 88% 20%)',
    sidebarColor: 'hsl(18 86% 29%)',
    type: 'orange',
  },
  {
    color: 'hsl(0 75% 42%)',
    headerColor: 'hsl(0 74% 15%)',
    sidebarColor: 'hsl(0 36% 28%)',
    type: 'rose',
  },

  {
    color: 'hsl(0 0% 25%)',
    headerColor: 'hsl(0 0% 18%)',
    sidebarColor: 'hsl(0 0% 25%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'neutral',
  },
  {
    color: 'hsl(215 25% 27%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'slate',
  },
  {
    color: 'hsl(217 19% 27%)',
    darkPrimaryColor: 'hsl(0 0% 98%)',
    primaryColor: 'hsl(240 5.9% 10%)',
    type: 'gray',
  },
  {
    color: '',
    type: 'custom',
  },
];

export const COLOR_PRESETS = [...BUILT_IN_THEME_PRESETS].slice(0, 7);

export { BUILT_IN_THEME_PRESETS };

export type { BuiltinThemePreset };
