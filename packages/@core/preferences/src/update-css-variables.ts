import type { Preferences } from './types';

import {
  generateColorByPrimaryColor,
  generatorColorVariables,
} from '@vben-core/shared/color';
import { updateCSSVariables as executeUpdateCSSVariables } from '@vben-core/shared/utils';

import { BUILT_IN_THEME_PRESETS } from './constants';

/**
 * 更新主题的 CSS 变量以及其他 CSS 变量
 * 根据偏好设置更新全局样式
 * @param preferences - 当前偏好设置对象，它的主题值将被用来设置文档的主题。
 */
function updateCSSVariables(preferences: Preferences) {
  // 当修改到颜色变量时，更新 css 变量
  const root = document.documentElement;
  if (!root) {
    return;
  }

  const theme = preferences?.theme ?? {};

  const { builtinType, mode, radius } = theme;

  // html 设置 dark 类
  if (Reflect.has(theme, 'mode')) {
    const dark = isDarkTheme(mode);
    root.classList.toggle('dark', dark);
  }

  // 根据内置主题设置根元素属性
  // html 设置 data-theme=[builtinType]
  if (Reflect.has(theme, 'builtinType')) {
    const rootTheme = root.dataset.theme;
    if (rootTheme !== builtinType) {
      root.dataset.theme = builtinType;
    }
  }

  // 获取当前的内置主题
  const currentBuiltType = [...BUILT_IN_THEME_PRESETS].find(
    (item) => item.type === builtinType,
  );

  let builtinTypeColorPrimary: string | undefined = '';

  if (currentBuiltType) {
    const isDark = isDarkTheme(preferences.theme.mode);
    // 设置不同主题的主要颜色
    const color = isDark
      ? currentBuiltType.darkPrimaryColor || currentBuiltType.primaryColor
      : currentBuiltType.primaryColor;
    builtinTypeColorPrimary = color || currentBuiltType.color;
  }

  // 如果内置主题颜色和自定义颜色都不存在，则不更新主题颜色
  if (
    builtinTypeColorPrimary ||
    Reflect.has(theme, 'colorPrimary') ||
    Reflect.has(theme, 'colorDestructive') ||
    Reflect.has(theme, 'colorSuccess') ||
    Reflect.has(theme, 'colorWarning') ||
    Reflect.has(theme, 'headerColor') ||
    Reflect.has(theme, 'sidebarColor')
  ) {
    // preferences.theme.colorPrimary = builtinTypeColorPrimary || colorPrimary;
    updateMainColorVariables(preferences);
  }

  // 更新圆角
  if (Reflect.has(theme, 'radius')) {
    document.documentElement.style.setProperty('--radius', `${radius}rem`);
  }
}

/**
 * 根据内置主题设置全局css变量，主要是颜色相关的
 * @param  preference - 当前偏好设置对象，它的颜色值将被转换成 HSL 格式并设置为 CSS 变量。
 */
function updateMainColorVariables(preference: Preferences) {
  if (!preference.theme) {
    return;
  }
  const {
    colorDestructive,
    colorPrimary,
    colorSuccess,
    colorWarning,
    headerColor,
    sidebarColor,
  } = preference.theme;

  const colorVariables = generatorColorVariables([
    { color: colorPrimary, name: 'primary' },
    { alias: 'warning', color: colorWarning, name: 'yellow' },
    { alias: 'success', color: colorSuccess, name: 'green' },
    { alias: 'destructive', color: colorDestructive, name: 'red' },
    { color: headerColor, name: 'header' },
    { color: sidebarColor, name: 'sidebar' },
  ]);

  // 要设置的 CSS 变量映射
  const colorMappings = {
    '--green-500': '--success',
    '--primary-500': '--primary',
    '--red-500': '--destructive',
    '--yellow-500': '--warning',
    '--header-500': '--header',
    '--sidebar-500': '--sidebar',
  };
  const arr: Record<string, string> = {};
  // 统一处理颜色变量的更新
  Object.entries(colorMappings).forEach(([sourceVar, targetVar]) => {
    const colorValue = colorVariables[sourceVar];
    if (colorValue) {
      arr[targetVar] = colorValue;
      document.documentElement.style.setProperty(targetVar, colorValue);
    }
  });
  // 根据主色生成各种衍生色添加到变量里
  if (colorVariables['--header-500']) {
    const { light: headerVariables } = generateColorByPrimaryColor(
      `hsl(${colorVariables['--header-500']})`,
    );

    Object.entries(headerVariables).forEach(([key, property]) => {
      document.documentElement.style.setProperty(`--header-${key}`, property);
    });
  }

  if (colorVariables['--sidebar-500']) {
    const { light: sidebarVariables } = generateColorByPrimaryColor(
      `hsl(${colorVariables['--sidebar-500']})`,
    );

    Object.entries(sidebarVariables).forEach(([key, property]) => {
      document.documentElement.style.setProperty(`--sidebar-${key}`, property);
    });
  }

  // console.warn('updateMainColorVariables:', arr, colorVariables);
  executeUpdateCSSVariables(colorVariables);
}

function isDarkTheme(theme: string) {
  let dark = theme === 'dark';
  if (theme === 'auto') {
    dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return dark;
}

export { isDarkTheme, updateCSSVariables };
