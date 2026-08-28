<script lang="ts" setup>
import { onMounted, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import matchModalUi from './modals/matchModal.vue';

const userStore = useUserStore();
const route = useRoute();

// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
// const page = urlParams?.page;
console.warn('urlParams', urlParams);

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
});
const [MatchModal, matchModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: matchModalUi,
  draggable: true,
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
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
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'vendormacth',
    // api地址
    queryUrl: '/ygcgProductAction/queryHospitalVendor.do',
    gridColumns: [
      {
        type: 'radio',
        width: 50,
        align: 'center',
        title: '单选',
        visible: false,
      },
      {
        type: 'seq',
        width: 50,
        align: 'center',
        title: '序号',
      },
      {
        field: 'orgName',
        title: '医院名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'bpartnerCode',
        title: '供应商编码',
        width: '200',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商名称',
        width: '200',
        sortable: true,
      },
      {
        field: 'companyId',
        title: '阳光编码',
        width: '200',
        sortable: true,
      },
      {
        field: 'companyName',
        title: '阳光名称',
        // width: '100',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'orgId',
        label: '医院',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/orgList.do',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '供应商',
        componentProps: () => {
          return {
            placeholder: '请输入供应商名称',
            allowClear: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isMacth',
        label: '匹配状态',
        componentProps: () => {
          return {
            dictUrl: 'baseHandleAction/refList.do?id=319',
            placeholder: '请选择匹配状态',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const handleMacth = async () => {
  // 获取表单中的医院参数
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院');
  }
  const row = ChcGridApi.grid.getRadioRecord(true);
  const rawRow = toRaw(row);
  console.warn('handleMacth row:', row);
  console.warn('handleMacthrawRow:', rawRow);
  if (isEmpty(rawRow)) {
    message.warning('请选择供应商信息');
    return;
  }

  matchModalApi
    .setData({
      row: rawRow,
      orgId: formValues.orgId,
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <MatchModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleMacth"
          class="mr-[0.5rem]"
          data-testid="button_macth"
        >
          供应商匹配
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
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
