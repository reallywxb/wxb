// {
//     "--primary-50": "210 86% 97%",
//     "--primary-100": "214 85% 95%",
//     "--primary-200": "212 83% 86%",
//     "--primary-300": "212 82% 78%",
//     "--primary-400": "212 83% 62%",
//     "--primary-500": "212 100% 45%",
//     "--primary-600": "212 100% 41%",
//     "--primary-700": "212 100% 27%",
//     "--primary-800": "212 100% 20%",
//     "--primary-900": "212 100% 14%",
//     "--primary-950": "213 100% 9%",
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
//     "--header-50": "0 75% 98%",
//     "--header-100": "0 76% 97%",
//     "--header-200": "0 72% 92%",
//     "--header-300": "0 74% 86%",
//     "--header-400": "0 74% 76%",
//     "--header-500": "0 73% 66%",
//     "--header-600": "0 55% 60%",
//     "--header-700": "0 38% 40%",
//     "--header-800": "0 38% 30%",
//     "--header-900": "0 37% 20%",
//     "--header-950": "0 37% 13%",
//     "--sidebar-50": "0 67% 98%",
//     "--sidebar-100": "0 60% 95%",
//     "--sidebar-200": "0 61% 88%",
//     "--sidebar-300": "0 61% 81%",
//     "--sidebar-400": "0 60% 66%",
//     "--sidebar-500": "0 61% 52%",
//     "--sidebar-600": "0 56% 47%",
//     "--sidebar-700": "0 56% 31%",
//     "--sidebar-800": "0 56% 23%",
//     "--sidebar-900": "0 57% 15%",
//     "--sidebar-950": "0 55% 10%"
// }
/**
 * 将上面这个对象转成css变量，添加到全局css样式表里
 * 更新 CSS 变量的函数
 * @param variables 要更新的 CSS 变量与其新值的映射
 */

function updateCSSVariables(
  variables: { [key: string]: string },
  id = '__vben-styles__',
): void {
  // 获取或创建内联样式表元素
  const styleElement =
    document.querySelector(`#${id}`) || document.createElement('style');

  styleElement.id = id;

  // 构建要更新的 CSS 变量的样式文本
  let cssText = ':root {';
  for (const key in variables) {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      cssText += `${key}: ${variables[key]};`;
    }
  }
  cssText += '}';

  // 将样式文本赋值给内联样式表
  styleElement.textContent = cssText;

  // 将内联样式表添加到文档头部
  if (!document.querySelector(`#${id}`)) {
    setTimeout(() => {
      document.head.append(styleElement);
    });
  }
}

export { updateCSSVariables };
