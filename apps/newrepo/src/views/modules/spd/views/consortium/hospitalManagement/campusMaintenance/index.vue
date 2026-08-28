<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';

import { AddActionIcon, EditActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import addAndEditModalUI from './modals/addAndEditModal.vue';

// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');

const extParams = ref<any>({});

const [addAndEditModal, addAndEditModalApi] = useVbenModal({
  connectedComponent: addAndEditModalUI,
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[fit-content]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'campusMaintenanceGrid',
    queryUrl: '/campusAction/query.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'campusCode',
        title: '院区编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'campusName',
        title: '院区名称',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'hospitalName',
        title: '所属医院',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'detailAddress',
        title: '院区地址',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'isMain',
        title: '是否主院区',
        minWidth: '120',
        sortable: true,
        formatter: ({ row }: any) => {
          return row.isMain ? (row.isMain === 'Y' ? '是' : '否') : '';
        },
      },
      {
        field: 'isPurchaseMain',
        title: '是否采购主体',
        minWidth: '120',
        sortable: false,
        formatter: ({ row: { isPurchaseMain } }: any) => {
          return isPurchaseMain ? (isPurchaseMain === 'Y' ? '是' : '否') : '';
        },
      },
      // {
      //   field: 'IsEnableCloudWarehouse',
      //   title: '是否启用云仓',
      //   minWidth: '120',
      //   sortable: true,
      //   formatter: ({ row: { IsEnableCloudWarehouse } }: any) => {
      //     return IsEnableCloudWarehouse
      //       ? IsEnableCloudWarehouse === 'Y'
      //         ? '是'
      //         : '否'
      //       : '';
      //   },
      // },
      {
        field: 'status',
        title: '状态',
        minWidth: '120',
        sortable: true,
        formatter: ({ row: { status } }: any) => {
          return status ? (status === 'Y' ? '启用' : '禁用') : '';
        },
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'campusName',
        label: '院区',
        componentProps: {
          placeholder: '请输入编码或名称',
        },
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {},
    afterFetchFn: (params) => {
      const rows =
        params.data?.map((item: any) => {
          return {
            ...item,
          };
        }) || [];

      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
  },
);

const handleAdd = () => {
  addAndEditModalApi
    .setData({
      modalType: 'ADD',
      modalTitle: '新增院区',
      callback() {
        handleQuery();
      },
    })
    .open();
};

const handleEdit = (scope: any) => {
  const unProxyRow: any = toRaw(scope.row);
  // console.log(unProxyRow, 'unProxyRow');
  addAndEditModalApi
    .setData({
      modalType: 'EDIT',
      modalTitle: '编辑院区',
      row: unProxyRow,
      callback() {
        handleQuery();
      },
    })
    .open();
};

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <addAndEditModal @close="handleQuery" />
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleAdd"
            class="mr-[0.5rem]"
            data-testid="button_onAdd"
          >
            新 建
            <template #icon>
              <AddActionIcon />
            </template>
          </Button>
        </template>
        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleEdit(scope)"
            :data-testid="`button_onEdit_${scope.rowIndex}`"
          >
            编辑
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
        </template>
      </ChcGrid>
    </div>
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
