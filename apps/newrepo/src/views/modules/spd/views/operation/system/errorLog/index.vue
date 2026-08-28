<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();

const userStore = useUserStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};

console.warn('urlParams', urlParams);
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  ChcGridApi.query();
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      tooltipConfig: {
        maxHeight: 200,
      },
    }),
  },
  {
    id: 'errorLog',
    // api地址
    queryUrl: '/exceptionAction/query.do',
    gridColumns: [
      {
        type: 'radio',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'AD_Exception_Msg_ID',
        title: '错误编号',
        width: '85',
      },
      {
        field: 'UserName',
        title: '用户名',
        width: '85',
      },
      {
        field: 'Uri',
        title: '错误地址',
        width: '250',
      },
      {
        field: 'created',
        title: '时间',
        width: '150',
      },
      {
        field: 'Content',
        title: '日志内容',
        // width: '500',
        sortable: false,
        // formatter: ({ cellValue }) => {
        //   return typeof cellValue === 'object' ? cellValue.msg : cellValue;
        // },
        showOverflow: 'ellipsis',
        slots: {
          default: (scope: any) => {
            return h(
              Button,
              {
                type: 'link',
                size: 'small',
                onClick() {
                  const str =
                    typeof scope.row?.Content === 'object'
                      ? scope.row?.Content.msg
                      : scope.row?.Content;
                  const { destroy: modalDestory } = Modal.confirm({
                    title: `错误日志编号:${scope.row.AD_Exception_Msg_ID}`,
                    class: 'error-log-modal ',
                    centered: true,
                    content: () => {
                      return h(
                        'div',
                        {
                          class: 'max-h-[450px] min-h-[200px] overflow-auto',
                        },
                        {
                          default: () => str,
                        },
                      );
                    },
                    closable: true,
                    width: 400,
                    icon: h('span', {
                      class: 'hidden',
                    }),
                    footer: () => {
                      return h(
                        'div',
                        {
                          class: 'flex justify-end items-center',
                        },
                        [
                          h(
                            Button,
                            {
                              type: 'primary',
                              onClick() {
                                modalDestory();
                              },
                            },
                            { default: () => '确定' },
                          ),
                        ],
                      );
                    },
                  });
                },
              },
              {
                default: () => {
                  return typeof scope.row?.Content === 'object'
                    ? scope.row?.Content.msg
                    : scope.row?.Content;
                },
              },
            );
          },
        },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '消息时间',
        defaultValue: [
          // 7天前
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,

    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);

      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const modalOuterData = ref<Record<string, any>>({});
const [MsgModal, msgModalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  showCancelButton: false,
  onCancel() {
    msgModalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = msgModalApi.getData<Record<string, any>>();
      console.warn('modalOuterData', modalOuterData);
      try {
        const res = await requestFormClient.post(
          '/stackTraceAction/stackTrace.do',
        );
        modalOuterData.value.log = res.data;
      } catch (error) {
        console.error('获取系统堆栈失败', error);
      }
    }
  },
});

const watchStacktrace = () => {
  msgModalApi?.open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <MsgModal class="h-[800px] w-[1200px]" title="系统堆栈">
      <pre v-html="modalOuterData.log" class="box-border w-full"></pre>
    </MsgModal>
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="watchStacktrace"
          class="mr-[0.5rem]"
          data-testid="button_watch"
        >
          查看堆栈
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style lang="less" scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
<style lang="less">
.orderManage-row-close-content .ant-modal-confirm-content {
  max-width: 100% !important;
}
</style>

<style lang="less">
.error-log-modal {
  .ant-modal-confirm-content {
    max-width: 100% !important;
  }
}
</style>
