<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';

import { useTabbarStore } from '@vben/stores';

import {
  useLayoutContentStyle,
  useLayoutFooterStyle,
  useLayoutHeaderStyle,
} from '@vben-core/composables';
import { Slot } from '@vben-core/shadcn-ui';
import { ELEMENT_ID_MAIN_CONTENT } from '@vben-core/shared/constants';
// import { Menu } from 'ant-design-vue';

const tabbarStore = useTabbarStore();
const { setLayoutHeaderHeight } = useLayoutHeaderStyle();
const { setLayoutFooterHeight } = useLayoutFooterStyle();
setLayoutHeaderHeight(60);
setLayoutFooterHeight(0);
// const router = useRouter();
const route = useRoute();
// const rootRoute = router.getRoutes().find((item: any) => item.name === 'Root');
// const suitableRoutes =
//   rootRoute?.children?.filter((item: any) => !item.meta?.hideInMenu) || [];
// const current = ref();
// const menus = ref(routeToMenus(suitableRoutes));
// function routeToMenus(routes: any[]): any {
//   return routes.map((item) => {
//     return {
//       title: item.name,
//       label: item.meta.title,
//       key: item.path,
//       children:
//         item.children &&
//         item.children.length > 0 &&
//         routeToMenus(item.children),
//     };
//   });
// }
watch(
  () => route.path,
  () => {
    const meta = route.matched?.[route.matched.length - 1]?.meta;
    tabbarStore.addTab({
      ...route,
      meta: meta || route.meta,
    });
  },
  { immediate: true },
);
// function handleMenuClick({ key }: any) {
//   router.push(key);
// }
const idMainContent = ELEMENT_ID_MAIN_CONTENT;
const { contentElement, overlayStyle } = useLayoutContentStyle();
</script>
<template>
  <div style="display: flex; flex: 1; flex-direction: column; min-height: 100%">
    <header
      class="_scroll__fixed_ overflow-hidden transition-all duration-200"
      style="
        position: fixed;
        top: 0;
        left: 0;
        z-index: 100;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        width: 100%;
        height: 60px;
        padding: 0 10px;
        background-color: #fff;
      "
    >
      <div class="flex h-full min-w-0 flex-1 items-center">
        <slot name="menu"></slot>
      </div>
      <div class="flex h-full min-w-0 flex-shrink-0 items-center">
        <slot name="sso-header"></slot>
      </div>
    </header>
    <main
      :id="idMainContent"
      ref="contentElement"
      class="bg-background-deep relative"
      style="flex: 1; padding: 0; margin-top: 60px"
    >
      <Slot :style="overlayStyle">
        <slot name="overlay"></slot>
      </Slot>
      <slot></slot>
    </main>
  </div>
</template>
<style scoped></style>
