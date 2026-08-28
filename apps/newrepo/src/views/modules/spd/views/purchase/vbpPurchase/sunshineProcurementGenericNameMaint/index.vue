<script lang="ts" setup>
import {
  ExportActionIcon,
  SvgDeleteIcon,
  AddActionIcon,
  EditActionIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Modal, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { deleteGenericNameAction } from './api';
import addAndEditGenericNameModalUi from './modals/addAndEditGenericNameModal.vue';
import { toRaw } from 'vue';

const [AddAndEditModal, addAndEditModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  connectedComponent: addAndEditGenericNameModalUi,
  draggable: true,
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
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
        autoLoad: true,
      },
    }),
  },
  {
    id: 'sunshineProcurementGenericNameMaint',
    queryUrl: '/ygcgProductNameAction/query',
    showZoomBtn: true,
    showCustomBtn: true,
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
        title: '多选',
        visible: true,
        fixed: 'left',
      },
      {
        type: 'seq',
        width: 50,
        align: 'center',
        title: '序号',
        fixed: 'left',
      },
      { field: 'productName', title: '通用名', minWidth: 250, sortable: true },
      {
        field: 'action',
        title: '操作',
        width: 150,
        fixed: 'right',
        slots: {
          default: 'action',
        },
      },
    ],
    formSchema: [
      {
        label: '阳采通用名',
        component: 'Input',
        fieldName: 'productName',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        componentProps: {
          allowClear: true,
          immediate: true,
        },
      },
    ],
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

const handleAdd = () => {
  addAndEditModalApi
    .setData({
      title: '新增阳采通用名',
      type: 'add',
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};

const handleEdit = (row: any) => {
  addAndEditModalApi
    .setData({
      title: '编辑阳采通用名',
      type: 'edit',
      parent: toRaw(row),
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};

const handleBatchDelete = () => {
  const records = ChcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择要删除的记录');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认删除选中的 ${records.length} 条数据吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await deleteGenericNameAction({
          ids: records.map((item) => item.productNameId).join(','),
        });
        if (!res?.success) {
          throw Error(res?.msg || '失败');
        }
        message.success('删除成功');
        ChcGridApi.query();
      } catch {
        message.error('删除失败');
      }
    },
  });
};

const handleDelete = (row: any) => {
  Modal.confirm({
    title: '提示',
    content: `确认删除"${row.productName}"吗？`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await deleteGenericNameAction({ ids: row.productNameId });
        if (!res?.success) {
          throw Error(res?.msg || '失败');
        }
        message.success('删除成功');
        ChcGridApi.query();
      } catch (err) {
        console.error(err);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <AddAndEditModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add"
        >
          新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <!-- <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleEdit"
          data-testid="button_edit"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button> -->
        <Button
          type="primary"
          danger
          @click="handleBatchDelete"
          class="mr-[0.5rem]"
          data-testid="button_batch_delete"
        >
          批量删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>

        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          disabled
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope.row)"
          :data-testid="`button_edit_${scope.rowIndex}`"
        >
          编辑
        </Button>
        <Button
          ghost
          type="primary"
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDelete(scope.row)"
          :data-testid="`button_delete_${scope.rowIndex}`"
        >
          删除
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
