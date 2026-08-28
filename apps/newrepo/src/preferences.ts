import { defineOverridesPreferences } from '@vben/preferences';

import avatar from '#/assets/images/defaultAvatar.base64?raw';
import img from '#/assets/images/logo.base64?raw';
/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    accessMode: 'backend',
    name: import.meta.env.VITE_APP_TITLE,
    defaultAvatar: avatar,
    compact: true,
    contentCompact: 'wide',
    layout: 'mixed-nav',
    watermark: true,
  },
  logo: {
    source: img,
  },
  theme: {
    mode: 'light',
    semiDarkHeader: false,
    semiDarkSidebar: false,
    radius: '0.25',
    headerColor: 'hsl(221 100% 18%)',
    sidebarColor: 'hsl(221 84% 27%)',
  },
  widget: {
    languageToggle: false, // 隐藏语言切换按钮
    globalSearch: true,
    themeToggle: false,
    fullscreen: false,
  },
  transition: {
    enable: false,
    loading: false,
    name: 'fade-slide',
    progress: false,
  },
  sidebar: {
    width: 220,
  },
});
