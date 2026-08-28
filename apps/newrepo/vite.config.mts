import { defineConfig } from '@vben/vite-config';

import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver';
import { AntDesignXVueResolver } from 'ant-design-x-vue/resolver';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
// const proxyUrl = 'https://dev-ebc.njyy.com'; // 开发环境url
// const proxyUrl = 'http://test.ebc.chcit.com.cn'; // 测试环境url

const proxyUrl = 'http://192.168.30.121:32081'; // spd药品宿迁环境url
// const proxyUrl = 'http://192.168.30.121:31503'; // spd药品演示环境url
// const proxyUrl = 'http://192.168.30.121:30405'; // spd药品测试环境urlW
// const aiProxyUrl = 'http://192.168.20.48:9527';
const aiProxyUrl = 'http://192.168.20.163:32239';

export default defineConfig(async () => {
  return {
    plugins: [
      // ...
      AutoImport({
        resolvers: [
          TDesignResolver({
            library: 'chat',
          }),
        ],
      }),
      Components({
        resolvers: [
          TDesignResolver({
            library: 'chat',
          }),
          AntDesignXVueResolver(),
        ],
      }),
    ],
    application: {},
    vite: {
      base: '/spd/',
      // base: '/vben/',
      server: {
        proxy: {
          // '/tys': {
          //   changeOrigin: true,
          //   rewrite: (path) => path.replace(/^\/tys/, '/tys'),
          //   // rewrite: (path) => path.replace(/^\/admin-api/, ''),
          //   target: `${proxyUrl}`,
          //   ws: true,
          // },
          '/spd-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/spd-api/, '/'),
            // cookie
            cookiePathRewrite: {
              '/spd-api': '/',
            },
            // rewrite: (path) => path.replace(/^\/spd/, ''),
            target: `${proxyUrl}`,
            ws: true,
          },
          '/spd/ureport': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/spd/, ''),
            // cookie
            cookiePathRewrite: {
              '/ureport': '/ureport',
            },
            target: `${proxyUrl}`,
            ws: true,
          },
          '/ureport': {
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/ureport/, '/ureport'),
            // cookie
            cookiePathRewrite: {
              '/ureport': '/ureport',
            },
            target: `${proxyUrl}`,
            ws: true,
          },
          '/spd/jmreport': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/spd/, ''),
            // cookie
            cookiePathRewrite: {
              '/ureport': '/ureport',
            },
            target: `${proxyUrl}`,
            ws: true,
          },
          '/jmreport': {
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/ureport/, '/ureport'),
            // cookie
            cookiePathRewrite: {
              '/ureport': '/ureport',
            },
            target: `${proxyUrl}`,
            ws: true,
          },
          '/spd/drag': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/spd/, ''),
            // cookie
            cookiePathRewrite: {
              '/ureport': '/ureport',
            },
            target: `${proxyUrl}`,
            ws: true,
          },
          '/drag': {
            changeOrigin: true,
            // rewrite: (path) => path.replace(/^\/ureport/, '/ureport'),
            // cookie
            cookiePathRewrite: {
              '/ureport': '/ureport',
            },
            target: `${proxyUrl}`,
            ws: true,
          },
          '/ai': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/ai/, '/api/ai'),
            // rewrite: (path) => path.replace(/^\/spd/, ''),
            target: `${aiProxyUrl}`,
            ws: true,
          },
          '/audio': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/audio/, ''),
            // rewrite: (path) => path.replace(/^\/spd/, ''),
            // target: `https://api.coze.cn`,
            target: `http://116.147.40.109:8889`,
            ws: true,
          },
          '/file-ai': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/file-ai/, ''),
            // rewrite: (path) => path.replace(/^\/spd/, ''),
            // target: `http://116.147.40.109:8888`,
            target: `http://192.168.31.87:9000`,
            //
            ws: true,
          },
        },
      },
    },
  };
});
