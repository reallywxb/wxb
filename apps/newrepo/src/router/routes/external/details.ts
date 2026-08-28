import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: () => import('#/views/dashboard/analytics/index.vue'),
    meta: {
      affixTab: false,
      icon: 'lucide:area-chart',
      title: $t('page.dashboard.analytics'),
    },
    name: 'DTAnalytics',
    path: '/DTAnalytics',
  },
  {
    component: () => import('#/views/dashboard/workspace/index.vue'),
    meta: {
      icon: 'carbon:workspace',
      title: $t('page.dashboard.workspace'),
    },
    name: 'DTWorkspace',
    path: '/DTworkspace',
  },
];

export default routes;
