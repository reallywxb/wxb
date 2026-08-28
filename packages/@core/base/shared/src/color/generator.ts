import { getColors } from 'theme-colors';

import { convertToHslCssVar, TinyColor } from './convert';

interface ColorItem {
  alias?: string;
  color: string;
  name: string;
}
// 生成颜色变量
// {
//     "--primary-50": "231 78% 98%",
//     "--primary-100": "223 70% 96%",
//     "--primary-200": "225 71% 90%",
//     "--primary-300": "225 70% 84%",
//     "--primary-400": "225 70% 73%",
//     "--primary-500": "225 70% 61%",
//     "--primary-600": "225 55% 55%",
//     "--primary-700": "225 44% 37%",
//     "--primary-800": "225 44% 27%",
//     "--primary-900": "226 45% 18%",
//     "--primary-950": "225 45% 12%",
//     "--yellow-50": "45 80% 98%",
//     "--warning-50": "45 80% 98%",
//     "--yellow-100": "41 80% 96%",
//     "--warning-100": "41 80% 96%",
//     "--yellow-200": "43 84% 90%",
//     "--warning-200": "43 84% 90%",
//     "--yellow-300": "42 85% 85%",
//     "--warning-300": "42 85% 85%",
//     "--yellow-400": "42 84% 73%",
//     "--warning-400": "42 84% 73%",
//     "--yellow-500": "42 84% 61%",
//     "--warning-500": "42 84% 61%",
//     "--yellow-600": "42 65% 55%",
//     "--warning-600": "42 65% 55%",
//     "--yellow-700": "42 54% 36%",
//     "--warning-700": "42 54% 36%",
//     "--yellow-800": "42 54% 27%",
//     "--warning-800": "42 54% 27%",
//     "--yellow-900": "42 53% 18%",
//     "--warning-900": "42 53% 18%",
//     "--yellow-950": "42 55% 12%",
//     "--warning-950": "42 55% 12%",
//     "--warning": "42 84% 61%",
//     "--green-50": "140 60% 98%",
//     "--success-50": "140 60% 98%",
//     "--green-100": "145 55% 96%",
//     "--success-100": "145 55% 96%",
//     "--green-200": "143 58% 90%",
//     "--success-200": "143 58% 90%",
//     "--green-300": "143 58% 83%",
//     "--success-300": "143 58% 83%",
//     "--green-400": "144 57% 71%",
//     "--success-400": "144 57% 71%",
//     "--green-500": "144 57% 58%",
//     "--success-500": "144 57% 58%",
//     "--green-600": "144 45% 52%",
//     "--success-600": "144 45% 52%",
//     "--green-700": "145 41% 35%",
//     "--success-700": "145 41% 35%",
//     "--green-800": "144 41% 26%",
//     "--success-800": "144 41% 26%",
//     "--green-900": "144 42% 17%",
//     "--success-900": "144 42% 17%",
//     "--green-950": "144 42% 12%",
//     "--success-950": "144 42% 12%",
//     "--success": "144 57% 58%",
//     "--red-50": "348 100% 98%",
//     "--destructive-50": "348 100% 98%",
//     "--red-100": "348 100% 96%",
//     "--destructive-100": "348 100% 96%",
//     "--red-200": "348 100% 90%",
//     "--destructive-200": "348 100% 90%",
//     "--red-300": "348 100% 84%",
//     "--destructive-300": "348 100% 84%",
//     "--red-400": "348 100% 73%",
//     "--destructive-400": "348 100% 73%",
//     "--red-500": "348 100% 61%",
//     "--destructive-500": "348 100% 61%",
//     "--red-600": "348 78% 55%",
//     "--destructive-600": "348 78% 55%",
//     "--red-700": "348 64% 37%",
//     "--destructive-700": "348 64% 37%",
//     "--red-800": "348 64% 27%",
//     "--destructive-800": "348 64% 27%",
//     "--red-900": "348 64% 18%",
//     "--destructive-900": "348 64% 18%",
//     "--red-950": "348 65% 12%",
//     "--destructive-950": "348 65% 12%",
//     "--destructive": "348 100% 61%",
//     "--header-50": "0 0% 100%",
//     "--header-100": "0 0% 100%",
//     "--header-200": "0 0% 100%",
//     "--header-300": "0 0% 100%",
//     "--header-400": "0 0% 100%",
//     "--header-500": "0 0% 100%",
//     "--header-600": "0 0% 90%",
//     "--header-700": "0 0% 60%",
//     "--header-800": "0 0% 45%",
//     "--header-900": "0 0% 30%",
//     "--header-950": "0 0% 20%",
//     "--sidebar-50": "0 0% 100%",
//     "--sidebar-100": "0 0% 100%",
//     "--sidebar-200": "0 0% 100%",
//     "--sidebar-300": "0 0% 100%",
//     "--sidebar-400": "0 0% 100%",
//     "--sidebar-500": "0 0% 100%",
//     "--sidebar-600": "0 0% 90%",
//     "--sidebar-700": "0 0% 60%",
//     "--sidebar-800": "0 0% 45%",
//     "--sidebar-900": "0 0% 30%",
//     "--sidebar-950": "0 0% 20%"
// }
function generatorColorVariables(colorItems: ColorItem[]) {
  const colorVariables: Record<string, string> = {};

  colorItems.forEach(({ alias, color, name }) => {
    if (color) {
      const colorsMap = getColors(new TinyColor(color).toHexString());
      // console.warn('generatorColorVariables:', colorsMap);
      let mainColor = colorsMap['500'];

      const colorKeys = Object.keys(colorsMap);

      colorKeys.forEach((key) => {
        const colorValue = colorsMap[key];

        if (colorValue) {
          const hslColor = convertToHslCssVar(colorValue);
          colorVariables[`--${name}-${key}`] = hslColor;
          if (alias) {
            colorVariables[`--${alias}-${key}`] = hslColor;
          }

          if (key === '500') {
            mainColor = hslColor;
          }
        }
      });
      if (alias && mainColor) {
        colorVariables[`--${alias}`] = mainColor;
      }
    }
  });
  // console.warn('colorVariables:', colorVariables);
  return colorVariables;
}

export { generatorColorVariables };
