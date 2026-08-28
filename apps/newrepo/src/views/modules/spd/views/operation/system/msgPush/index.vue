<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
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
    id: 'msgPush',
    // api地址
    queryUrl: '/userTipsAction/getTipsTemplate.do',
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
        field: 'type',
        title: '消息模板',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'validation',
        label: '模板类型',
        componentProps: () => {
          return {
            placeholder: '请输入模板类型',
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
          if (row?.templateId) {
            childQueryExtraParams.value.templateId = row?.templateId;
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
        ChildChcGridApi.grid.reloadData([]);
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
    id: 'msgPush_child',
    // api地址
    queryUrl: '/userTipsAction/getTipsUser.do',
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'RealName',
        title: '真实姓名',
        // width: '110',
        sortable: true,
      },
      {
        field: 'Name',
        title: '会员名称',
        // width: '200',
        sortable: true,
      },
      {
        field: 'isTurnedOn',
        title: '是否已开通',

        width: '100',
        sortable: true,
        formatter: ({ cellValue }) => {
          if (cellValue === 'Y') {
            return '是';
          } else if (cellValue === 'N') {
            return '否';
          } else {
            return cellValue;
          }
        },
      },
      {
        field: 'isSmsable',
        title: '短信是否推送',

        width: '110',
        formatter: ({ cellValue }) => {
          if (cellValue === 'Y') {
            return '是';
          } else if (cellValue === 'N') {
            return '否';
          } else {
            return cellValue;
          }
        },
      },
      {
        field: 'isWxable',
        title: '微信是否推送',
        width: '110',
        formatter: ({ cellValue }) => {
          if (cellValue === 'Y') {
            return '是';
          } else if (cellValue === 'N') {
            return '否';
          } else {
            return cellValue;
          }
        },
      },
      {
        field: 'isPcable',
        title: 'PC是否推送',
        width: '110',
        formatter: ({ cellValue }) => {
          if (cellValue === 'Y') {
            return '是';
          } else if (cellValue === 'N') {
            return '否';
          } else {
            return cellValue;
          }
        },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'userName',
        label: '用户名',
        componentProps: () => {
          return {
            placeholder: '请输入用户名',
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
        templateId: childQueryExtraParams.value.templateId || 0,
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
const [ConfigModal, configModalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  showCancelButton: false,
  contentClass: 'h-[100px] min-h-[100px]',
  onCancel() {
    configModalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    const formValues = await configFormApi.getValues();
    console.warn('formValues', formValues);
    const params: Record<string, any> = {};
    const isSmsable = formValues.isSmsable ? 'Y' : 'N';
    const isWxable = formValues.isWxable ? 'Y' : 'N';
    const isPcable = formValues.isPcable ? 'Y' : 'N';
    const userIds = modalOuterData?.value?.childRecords?.map((item: any) => ({
      userId: item.AD_User_ID,
      isSmsable,
      isWxable,
      isPcable,
    }));
    if (isEmpty(userIds)) {
      message.error('请选择一个用户');
      return;
    }
    params.templateId = modalOuterData.value?.parentRecord?.templateId;
    params.authority = JSON.stringify(userIds);
    try {
      await requestFormClient.post('/userTipsAction/openAuthority.do', params);
      message.success('成功');
      configModalApi.close();
      ChcGridApi.query();
    } catch (error) {
      console.error(error);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = configModalApi.getData<Record<string, any>>();
      console.warn('modalOuterData', modalOuterData);
    }
  },
});
const [ConfigForm, configFormApi] = useVbenForm({
  layout: 'horizontal',
  compact: true,
  commonConfig: {
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
      labelClass: '!w-[50px]',
      labelWidth: 50,
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
  wrapperClass: 'grid-cols-3',
  schema: [
    {
      component: 'Checkbox',
      componentProps: {},
      fieldName: 'isSmsable',
      label: '短信',
      formItemClass: 'col-span-1 justify-center',
      labelClass: 'leading-1 mb-[0px] pl-[4px] !w-[50px]',
    },
    {
      component: 'Checkbox',
      componentProps: {},
      fieldName: 'isWxable',
      label: '微信',
      formItemClass: 'col-span-1 justify-center',
      labelClass: 'leading-1 mb-[0px] pl-[4px] !w-[50px]',
    },
    {
      component: 'Checkbox',
      componentProps: {},
      fieldName: 'isPcable',
      label: 'PC',
      formItemClass: 'col-span-1 justify-center',
      labelClass: 'leading-1 mb-[0px] pl-[4px] !w-[50px]',
    },
  ],
});
const handleOpen = () => {
  const parentRecord = ChcGridApi.grid.getRadioRecord(true);
  if (isEmpty(parentRecord)) {
    message.error('请选择一个消息类型');
    return;
  }
  const childRecords = ChildChcGridApi.grid.getCheckboxRecords(true);
  configModalApi
    ?.setData({
      parentRecord,
      childRecords,
    })
    ?.open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ConfigModal class="w-[400px]" title="配置">
      <ConfigForm />
    </ConfigModal>
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
        <ChildChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleOpen"
              class="mr-[0.5rem]"
              data-testid="button_open"
            >
              开通
            </Button>
          </template>
        </ChildChcGrid>
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
.orderManage-row-close-content .ant-modal-confirm-content {
  max-width: 100% !important;
}
</style>
