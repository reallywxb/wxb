<script lang="ts" setup>
import { toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import cuModalUi from './modals/cuModal.vue';

const userStore = useUserStore();
const route = useRoute();

// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
console.warn('userStore', userStore);

const [CuModal, cuModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: cuModalUi,
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
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
    id: 'warehouseReplenishMath',
    // api地址
    queryUrl: '/replenishAction/queryReplenishMath.do',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        align: 'center',
        width: 50,
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        align: 'center',
        width: 50,
      },
      { field: 'name', title: '名称', width: '200', sortable: true },
      {
        field: 'calculateMethodName',
        title: '日均消耗计算方法',
        width: '140',
        sortable: true,
      },

      {
        field: 'samplingPeriod',
        title: '采样天数',
        width: '140',
        align: 'right',
        sortable: true,
      },
      { field: 'text', title: '描述', width: '800', sortable: true },
      {
        field: 'description',
        title: '备注',
        // width: '100'
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        componentProps: () => {
          return {
            placeholder: '',
            maxlength: 20,
          };
        },
      },
    ],
    gridEvents: {
      radioChange: (d: any) => {
        console.warn('radioChange', d);
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('getTableArrDataFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleAdd = () => {
  cuModalApi
    .setData({
      modalTitle: '添加',
      modalType: 'ADD',
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
const handleEdit = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录！');
    return;
  }
  cuModalApi
    .setData({
      modalTitle: '修改',
      modalType: 'EDIT',
      row: unProxyRow,
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
const handleDel = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/replenishAction/deleteReplenishMath.do',
          {
            ids: JSON.stringify([unProxyRow.replenishMathId]),
          },
        );

        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <CuModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add_warehouseReplenishMath"
        >
          新建
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleEdit"
          class="mr-[0.5rem]"
          data-testid="button_edit_warehouseReplenishMath"
        >
          修改
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDel"
          class="mr-[0.5rem]"
          data-testid="button_delete_warehouseReplenishMath"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
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
</style>
