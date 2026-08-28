/**
 * @date 2026-08-05
 * @prompt 实现图片地址规范化功能，兼容 Layui 版三种图片格式
 * @description 提供 normalizeImageUrl 和 normalizeHtmlImages 函数，处理图片 URL 的规范化
 */

/**
 * 规范化图片 URL，兼容三种格式：
 * 1. 旧格式 "loadImage.do?path=..." → 补全为 "/spd-api/aIChatAction/loadImage.do?path=..."
 * 2. 相对路径 "../aIChatAction/loadImage.do?path=..." → 转为 "/spd-api/aIChatAction/loadImage.do?path=..."
 * 3. 完整 URL "http://..." 或 "/xxx/loadImage.do?..." → 直接用
 *
 * @param url 原始图片 URL
 * @returns 规范化后的图片 URL
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return url;

  // 已经是完整 URL 或以 / 开头的绝对路径，直接用
  if (/^https?:\/\//i.test(url) || url.startsWith('/')) {
    return url;
  }

  // 旧格式：loadImage.do?path=...（没有 aIChatAction 前缀）
  if (!url.includes('aIChatAction/') && url.includes('loadImage.do')) {
    return `/spd-api/aIChatAction/${url}`;
  }

  // 相对路径 ../aIChatAction/... → /spd-api/aIChatAction/...
  if (url.startsWith('../')) {
    return url.replace('../', '/spd-api/');
  }

  return url;
}

/**
 * 规范化富文本 HTML 中的所有图片地址
 *
 * @param html 包含图片的 HTML 字符串
 * @returns 替换图片 src 后的 HTML 字符串
 */
export function normalizeHtmlImages(html: string): string {
  if (!html) return html;

  return html.replace(/src="([^"]*)"/g, (match, url) => {
    return `src="${normalizeImageUrl(url)}"`;
  });
}
