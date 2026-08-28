export function getStaticRoutes() {
  return [
    // {
    //   name: 'Index',
    //   path: '/Index',
    //   component: 'dashboard/workspace/index',
    //   meta: {
    //     icon: 'carbon:workspace',
    //     keepAlive: true,
    //     title: '首页',
    //     order: 0,
    //     affixTab: true,
    //   },
    // },
    {
      name: 'Message',
      path: '/MyMessage',
      component: 'system/message/index',
      meta: {
        icon: 'carbon:workspace',
        keepAlive: true,
        title: '我的消息',
        hideInMenu: true,
      },
    },
    {
      name: 'Profile',
      path: '/Profile',
      component: 'system/profile/index',
      meta: {
        icon: 'carbon:workspace',
        keepAlive: true,
        title: '个人中心',
        hideInMenu: true,
      },
    },
    // {
    //   component: '',
    //   meta: {
    //     icon: 'lucide:layout-dashboard',
    //     order: 1,
    //     title: $t('page.dashboard.title'),
    //   },
    //   name: 'Dashboard',
    //   path: '/Dashboard',
    //   children: [
    //     // {
    //     //   name: 'Analytics',
    //     //   path: '/Analytics',
    //     //   component: 'dashboard/analytics/index',
    //     //   meta: {
    //     //     // affixTab: true,
    //     //     icon: 'lucide:area-chart',
    //     //     keepAlive: true,
    //     //     title: $t('page.dashboard.analytics'),
    //     //   },
    //     // },
    //     // {
    //     //   id: '采退订单明细template',
    //     //   name: '采退订单明细模板',
    //     //   path: '/singleTable',
    //     //   component: 'dashboard/singleTable/index',
    //     //   meta: {
    //     //     icon: 'carbon:workspace',
    //     //     keepAlive: true,
    //     //     title: '采退订单明细',
    //     //   },
    //     // },
    //     // {
    //     //   name: '采购计划录入1',
    //     //   path: '/poPlanInput1',
    //     //   component: 'dashboard/poPlanInput/index',
    //     //   meta: {
    //     //     icon: 'carbon:workspace',
    //     //     keepAlive: true,
    //     //     title: '采购计划录入1',
    //     //     urlParams: {
    //     //       page: 'input',
    //     //       isFree: 'N',
    //     //       isPackaged: 'N',
    //     //       isCrossDocking: '',
    //     //       receiptType: 1,
    //     //       type: 'warehouse',
    //     //       isShortPo: 'N',
    //     //     },
    //     //   },
    //     // },
    //     // {
    //     //   name: '采购计划录入2',
    //     //   path: '/poPlanInput2',
    //     //   component: 'dashboard/poPlanInputTest/index',
    //     //   meta: {
    //     //     icon: 'carbon:workspace',
    //     //     keepAlive: true,
    //     //     title: '采购计划录入2',
    //     //   },
    //     // },
    //     // {
    //     //   name: '父子表',
    //     //   path: '/doubleTable',
    //     //   component: 'dashboard/doubleTable/index',
    //     //   meta: {
    //     //     icon: 'carbon:workspace',
    //     //     keepAlive: true,
    //     //     title: '父子表',
    //     //   },
    //     // },
    //     // {
    //     //   name: '左树右表',
    //     //   path: '/treeTable',
    //     //   component: 'examples/vxe-table/edit-row',
    //     //   meta: {
    //     //     icon: 'carbon:workspace',
    //     //     keepAlive: true,
    //     //     title: '左树右表',
    //     //   },
    //     // },
    //     // {
    //     //   name: '单表页面',
    //     //   path: '/singleTableDemo',
    //     //   component: 'dashboard/singleTableDemo/index',
    //     //   meta: {
    //     //     icon: 'carbon:workspace',
    //     //     keepAlive: true,
    //     //     title: '单表页面',
    //     //   },
    //     // },
    //     // {
    //     //   name: '出库管理',
    //     //   path: '/orderApprove',
    //     //   meta: {
    //     //     icon: 'carbon:workspace',
    //     //     keepAlive: true,
    //     //     title: '出库管理',
    //     //   },
    //     //   children: [
    //     //     {
    //     //       name: '整单指示',
    //     //       path: '/applyPickCreate',
    //     //       component:
    //     //         'modules/spd/views/warehouse/outboundManagement/applyPickCreate/index',
    //     //       meta: {
    //     //         icon: 'carbon:workspace',
    //     //         keepAlive: true,
    //     //         title: '整单指示',
    //     //       },
    //     //     },
    //     //   ],
    //     // },
    //     {
    //       name: '测试可编辑表',
    //       path: '/testEditableTable',
    //       meta: {
    //         icon: 'carbon:workspace',
    //         keepAlive: true,
    //         title: '测试可编辑表',
    //       },
    //       children: [
    //         {
    //           name: '测试可编辑表1',
    //           path: '/testEditableTable',
    //           component: 'dashboard/purchasePlan/buyPlan/index',
    //           meta: {
    //             icon: 'carbon:workspace',
    //             keepAlive: true,
    //             title: '测试可编辑表1',
    //           },
    //         },
    //       ],
    //     },
    //   ],
    // },
  ];
}
