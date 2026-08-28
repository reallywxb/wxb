<script lang="ts" setup>
import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
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
// const isFirstLoaded = ref(false); // 是否已初次加载完

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  ChcGridApi.query();
});
const childQueryExtraParams = ref<Record<string, any>>({});
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
    }),
  },
  {
    id: 'exceptionMsg',
    // api地址
    queryUrl: '/exceptionAction/queryTotalExcepiton.do',
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
        field: 'errorType',
        title: '异常类型',
        width: '100',
        sortable: false,
      },
      {
        field: 'errorTypeName',
        title: '异常类型名称',
        width: 250,
        sortable: false,
      },
      {
        field: 'msgType',
        title: '调用方法',
        // width: '180',
        sortable: false,
      },
      {
        field: 'qty',
        title: '异常数量',
        width: '100',
        sortable: false,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '消息日期',
        defaultValue: [
          // 7天前
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'errorType',
        label: '消息类型',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请选择消息类型',
            paginate: false,
            showChooseAll: '',
            // labelField: 'name',
            // valueField: 'id',
            defaultValue: '',
            options: [
              { value: '', label: '全部' },
              { value: 'queue', label: '消息队列' },
              { value: 'edi', label: '电子报文' },
              { value: 'transLog', label: 'ws调用日志' },
              { value: 'middleTable', label: '中间表' },
            ],
          };
        },
      },

      {
        component: 'Input',
        fieldName: 'msgType',
        label: '调用接口',
        componentProps: () => {
          return {
            placeholder: '请输入调用接口',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        if (isEmpty(row)) {
          childQueryExtraParams.value = {};
          ChildChcGridApi.grid.remove();
        } else {
          const formValues = await ChcGridApi.formApi.getValues();
          console.warn('formValues', formValues);
          childQueryExtraParams.value = {};
          if (row?.errorType) {
            childQueryExtraParams.value.errorType = row?.errorType;
            childQueryExtraParams.value.msgType = row.msgType;
          }
          if (formValues.dateFrom) {
            childQueryExtraParams.value.dateFrom = formValues.dateFrom;
          }
          if (formValues.dateTo) {
            childQueryExtraParams.value.dateTo = formValues.dateTo;
          }
          ChildChcGridApi.query();
        }
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      if (isEmpty(params?.rows)) {
        childQueryExtraParams.value = {};
        ChildChcGridApi.grid.remove();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const [ChildChcGrid, ChildChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
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
    }),
  },
  {
    id: 'exceptionMsg_child',
    // api地址
    queryUrl: '/exceptionAction/queryExcepitonLine.do',
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
        field: 'msgId',
        title: '编号',
        width: '120',
        sortable: false,
      },
      {
        field: 'msgType',
        title: '调用接口',
        width: '180',
        sortable: false,
      },
      {
        field: 'msgContent',
        title: '消息内容',
        // width: '180',
        sortable: false,
        showOverflow: 'ellipsis',
        // formatter: ({ cellValue }) => {
        //   return typeof cellValue === 'string'
        //     ? cellValue
        //     : JSON.stringify(cellValue);
        // },
        slots: {
          default: (scope: any) => {
            return h(
              Button,
              {
                type: 'link',
                size: 'small',
                onClick() {
                  msgModalApi
                    ?.setData({
                      row: scope.row,
                    })
                    .open();
                },
              },
              {
                default: () => {
                  const cellValue = scope.row.msgContent;
                  return typeof cellValue === 'string'
                    ? cellValue
                    : JSON.stringify(cellValue);
                },
              },
            );
          },
        },
      },
      {
        field: 'msgTime',
        title: '异常时间',
        width: '150',
        sortable: false,
      },
      {
        field: 'errorMsg',
        title: '异常信息',
        // width: '200',
        sortable: false,
        showOverflow: 'ellipsis',
        slots: {
          default: (scope: any) => {
            return h(
              Button,
              {
                type: 'link',
                size: 'small',
                onClick() {
                  const { destroy: modalDestory } = Modal.confirm({
                    title: `编号:${scope.row.msgId}`,
                    class: 'exception-msg-modal',
                    closable: true,
                    width: 400,
                    icon: h('span', {
                      class: 'hidden',
                    }),
                    centered: true,
                    content: () => {
                      return h(
                        'div',
                        {
                          class: 'max-h-[450px] min-h-[200px] overflow-auto',
                        },
                        {
                          default: () => scope.row?.errorMsg,
                        },
                      );
                    },
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
              { default: () => scope.row.errorMsg },
            );
          },
        },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'msgType',
        label: '调用接口',
        componentProps: () => {
          return {
            placeholder: '请输入调用接口',
          };
        },
      },
    ],
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      console.warn('beforeFetchFn params', params);
      return {
        ...params,
        ...childQueryExtraParams.value,
      };
    },
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
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = msgModalApi.getData<Record<string, any>>();
      console.warn('modalOuterData', modalOuterData);
      let text = '';
      text =
        typeof modalOuterData.value?.row?.msgContent === 'string'
          ? modalOuterData.value?.row?.msgContent
          : JSON.stringify(modalOuterData.value?.row?.msgContent);
      setTimeout(() => {
        msgFormApi.setValues({
          msgContent: text,
        });
      }, 100);
    }
  },
});
const [MsgForm, msgFormApi] = useVbenForm({
  layout: 'vertical',

  compact: true,
  commonConfig: {
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'Textarea',
      componentProps: {
        placeholder: ' ',
        style: {
          width: '800px',
          height: '450px',
        },
      },
      fieldName: 'msgContent',
      formItemClass: 'col-span-2 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '消息内容',
    },
  ],
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <MsgModal class="h-[600px] w-[820px]" title="消息内容">
      <MsgForm />
    </MsgModal>
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid />
      </template>
      <template #second>
        <ChildChcGrid />
      </template>
    </PageSplitLazy>
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
.exception-msg-modal {
  .ant-modal-confirm-content {
    max-width: 100% !important;
  }
}
</style>
