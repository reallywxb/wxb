/**
 * HSL 通道接口
 */
interface HSLChannels {
  h: number;
  l: number;
  s: number;
}

/**
 * 单个主题的调色板 Token 集合
 */
interface ColorTokens {
  accent: string;
  'accent-active': string;
  'accent-foreground': string;
  'accent-hover': string;
  // background: string;
  bg: string;
  // border: string;
  // card: string;
  foreground: string;
  // muted: string;
  primary: string;
  // ring: string;
  // 'shadow-color': string;
}

/**
 * 浅色 + 深色主题 Tokens
 */
interface ThemeTokens {
  dark: ColorTokens;
  light: ColorTokens;
}

/**
 * 解析 HSL 字符串，返回数字通道值
 * @param hslStr - 格式: "hsl(220, 85%, 55%)" 或 "hsl(220 85% 55%)"
 */
function parseHSL(hslStr: string): HSLChannels {
  // 支持两种写法：逗号分隔 或 空格分隔
  const match = hslStr.match(
    /hsl\(?\s*(\d+)(?:,|\s)\s*(\d+)%(?:,|\s)\s*(\d+)%\s*\)?/,
  );
  if (!match) {
    throw new Error(`无效的 HSL 字符串: ${hslStr}`);
  }
  return {
    h: Number.parseInt(String(match[1]), 10),
    s: Number.parseInt(String(match[2]), 10),
    l: Number.parseInt(String(match[3]), 10),
  };
}

/**
 * 生成一个完整的 HSL 函数字符串
 * @param h - 色相
 * @param s - 饱和度（数字，不含 %）
 * @param l - 亮度（数字，不含 %）
 */
// function hsl(h: number, s: number, l: number): string {
//   return `hsl(${h}, ${s}%, ${l}%)`;
// }

// /**
//  * 生成带透明度的 HSL 字符串（现代语法）
//  */
// function hsla(h: number, s: number, l: number, alpha: number): string {
//   return `hsl(${h} ${s}% ${l}% / ${alpha})`;
// }
function hslString(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

// function hslaString(h: number, s: number, l: number, a: number): string {
//   return `${h} ${s}% ${l}% / ${a}`;
// }
/**
 * 根据主色生成完整的浅色/深色语义化调色板
 * @param primaryHsl - 主色字符串，例如 "hsl(220, 85%, 55%)"
 */
function generateColorByPrimaryColor(primaryHsl: string): ThemeTokens {
  const { h, s, l } = parseHSL(primaryHsl);

  const light: ColorTokens = {
    primary: hslString(h, s, l),
    accent: hslString(h, s, l),
    'accent-hover': hslString(h, s, Math.max(l + 5, 5)),
    'accent-active': hslString(h, s, Math.max(l + 10, 5)),
    'accent-foreground': l > 70 ? hslString(0, 0, 0) : hslString(0, 0, 94), // 现在为 "220 0% 0%" 或 "220 0% 100%"

    foreground: l > 70 ? hslString(0, 0, 0) : hslString(0, 0, 94),
    bg: hslString(h, s, l),
  };

  const dark: ColorTokens = {
    primary: hslString(h, s, l),
    accent: hslString(h, s, l),
    'accent-hover': hslString(h, s, Math.min(l + 10, 95)),
    'accent-active': hslString(h, s, Math.min(l + 16, 95)),
    'accent-foreground': l > 60 ? hslString(0, 0, 0) : hslString(0, 0, 90),

    foreground: hslString(h, 11, 90),
    bg: hslString(h, s, l),
  };

  return { light, dark };
}

/**
 * 将 ColorTokens 对象转为 CSS 自定义属性文本
 * @param tokens - 颜色 token 对象
 * @param indent - 缩进（默认两个空格）
 */
function tokensToCSS(tokens: ColorTokens, indent: string = '  '): string {
  return Object.entries(tokens)
    .map(([key, value]) => `${indent}--${key}: ${value};`)
    .join('\n');
}

/**
 * 一步生成完整的主题 CSS 代码（含浅色/深色）
 * @param primaryHsl - 主色字符串
 */
function generateThemeCSS(primaryHsl: string): string {
  const { light, dark } = generateColorByPrimaryColor(primaryHsl);
  return `:root {\n${tokensToCSS(light)}\n}\n\n[data-theme="dark"] {\n${tokensToCSS(dark)}\n}`;
}

// 导出
export { generateColorByPrimaryColor, generateThemeCSS };

export type { ColorTokens, HSLChannels, ThemeTokens };
