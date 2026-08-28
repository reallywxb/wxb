import type { ActionContent, ActionKey } from './type';

import { h } from 'vue';

import { Button } from 'ant-design-vue';

import { savePrescriptionStatus } from './api';
import { registerPageStrategy } from './pageStrategy';
import { PageEnum } from './type';

const detailTitleMap = {
  [PageEnum.EDIT]: '外延处方编辑',
  [PageEnum.RECEIVE]: '外延处方签收',
  [PageEnum.DISTRIBUTE]: '外延处方发放',
};

// 编辑页面策略
registerPageStrategy(PageEnum.EDIT, {
  actions: {
    view: async ({ row, formValues, refreshTable, props }: ActionContent) => {
      console.warn('编辑页面查看按钮点击', row);
      props.goToDetailPage(
        {
          row: { ...row },
          deliveryMode: formValues.deliveryWay || row.deliveryWay,
          callback: refreshTable, // 编辑成功后刷新表格
        },
        {
          detailTitle: detailTitleMap[PageEnum.EDIT],
          sourcePage: props.thisTab.value,
          type: 'edit', // 外延处方编辑查看跳转是可编辑的(签收和发放不可编辑)
          pageType: PageEnum.EDIT,
        },
      );
    },
  },
  actionButtons: ['view'],
});

// 签收页面策略
registerPageStrategy(PageEnum.RECEIVE, {
  actions: {
    receive: async (content: ActionContent) => {
      console.warn('sign', '签收页面 执行收药 API 请求...', content.row);
      await savePrescriptionStatus({
        prescriptionId: content.row.prescriptionId, // 处方ID
        preStatus: '3', // 处方状态 3 收药
        deliveryNo: content.row.deliveryNo, // 配送单号
      });
      content.refreshTable?.();
      // 模拟 API 请求成功后执行刷新
      // setTimeout(() => {
      //   content.refreshTable?.();
      // }, 500);
    },
    view: async ({ row, formValues, props }: ActionContent) => {
      console.warn('签收页面 查看按钮点击', row);
      props.goToDetailPage(
        {
          row: { ...row },
          deliveryMode: formValues.deliveryWay || row.deliveryWay,
        },
        {
          detailTitle: detailTitleMap[PageEnum.RECEIVE],
          sourcePage: props.thisTab.value,
          type: 'view', // 外延处方编辑查看跳转是可编辑的(签收和发放不可编辑)
          pageType: PageEnum.RECEIVE,
        },
      );
    },
  },
  actionButtons: ['receive', 'view'],
});

// 发放页面策略
registerPageStrategy(PageEnum.DISTRIBUTE, {
  actions: {
    pickup: async (content: ActionContent) => {
      console.warn('send', '发放页面 执行取药 API 请求...', content.row);
      await savePrescriptionStatus({
        prescriptionId: content.row.prescriptionId, // 处方ID
        preStatus: '4', // 处方状态 4 发放
        deliveryNo: content.row.deliveryNo, // 配送单号
      });
      content.refreshTable?.();
      // 模拟 API 请求成功后执行刷新
      // setTimeout(() => {
      //   content.refreshTable?.();
      // }, 500);
    },
    view: async ({ row, formValues, props }: ActionContent) => {
      console.warn('发放页面 查看按钮点击', row);
      props.goToDetailPage(
        {
          row: { ...row },
          deliveryMode: formValues.deliveryWay || row.deliveryWay,
        },
        {
          detailTitle: detailTitleMap[PageEnum.DISTRIBUTE],
          sourcePage: props.thisTab.value,
          type: 'view', // 外延处方编辑查看跳转是可编辑的(签收和发放不可编辑)
          pageType: PageEnum.DISTRIBUTE,
        },
      );
    },
  },
  actionButtons: ['pickup', 'view'],
});

/**
 * 按钮工厂函数
 */
const BTN_STYLE = {
  view: { text: '查看', color: '#1890ff' },
  receive: { text: '立即收药', color: '#67C23A' },
  pickup: { text: '立即取药', color: '#E6A23C' },
};

export const createActionBtn = (
  key: ActionKey,
  rowIndex: number,
  onClick: () => void,
) => {
  const config = BTN_STYLE[key];
  if (!config) {
    return null;
  }
  return h(
    Button,
    {
      type: 'primary',
      ghost: true,
      class: 'h-[24px] pb-0 pl-[6px] pr-[6px] pt-0 text-[14px]',
      style: { color: config.color, borderColor: config.color },
      'data-testid': `button_detail_${key}_${rowIndex}`,
      onClick: (e: Event) => {
        e.stopPropagation();
        onClick();
      },
    },
    {
      default: () => config.text,
    },
  );
};

// const BTN_CLASS = 'h-[24px] pb-0 pl-[6px] pr-[6px] pt-0 text-[14px]';

// export const createActionBtn = (
//   key: ActionKey,
//   rowIndex: number,
//   handlers: Record<string, () => void>,
// ) => {
//   // 生成唯一的 testid
//   const testId = `button_detail_${key}_${rowIndex}`;
//   switch (key) {
//     case 'pickup': {
//       return h(
//         Button,
//         {
//           type: 'primary',
//           ghost: true,
//           class: BTN_CLASS,
//           style: { color: '#E6A23C', borderColor: '#E6A23C' },
//           'data-testid': testId,
//           onClick: handlers.onPickup,
//         },
//         { default: () => '立即取药' },
//       );
//     }
//     case 'receive': {
//       return h(
//         Button,
//         {
//           type: 'primary',
//           ghost: true,
//           class: BTN_CLASS,
//           style: { color: '#67C23A', borderColor: '#67C23A' },
//           'data-testid': testId,
//           onClick: handlers.onDispense,
//         },
//         { default: () => '立即收药' },
//       );
//     }
//     case 'view': {
//       return h(
//         Button,
//         {
//           type: 'primary',
//           ghost: true,
//           class: BTN_CLASS,
//           'data-testid': testId,
//           onClick: handlers.onView,
//         },
//         { default: () => '查看' },
//         // { default: () => '查看', icon: () => h(IconfontBasicView) },
//       );
//     }
//     default: {
//       return null;
//     }
//   }
// };

// export const PageActionMap: Record<PageType, ActionKey[]> = {
//   [PageEnum.EDIT]: ['view'], // 编辑
//   [PageEnum.RECEIVE]: ['receive', 'view'], // 签收页：有收药 + 查看
//   [PageEnum.DISTRIBUTE]: ['pickup', 'view'], // 发放页：有取药 + 查看
// };
