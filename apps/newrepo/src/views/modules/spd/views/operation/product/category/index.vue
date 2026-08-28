<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import addModalUi from './addModal/index.vue';
import { delCategory, modifyActive } from './api';

const userStore = useUserStore();
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    // 表格配置
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true, // 选中行时高亮
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    dataTableId: '/productCategoryAction/query.do',
    id: 'category',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'M_Product_Category_ID',
        minWidth: 100,
        sortable: true,
        title: '类别ID',
      },
      {
        field: 'Name',
        minWidth: 120,
        sortable: true,
        title: '名称',
      },
      {
        field: 'Value',
        minWidth: 120,
        sortable: true,
        title: '编码',
      },
      {
        field: 'PricePrecision',
        minWidth: 100,
        sortable: true,
        title: '价格精度',
        align: 'right',
      },
      {
        field: 'IsPictureOnLine',
        minWidth: 140,
        sortable: true,
        title: '正常采购证照管控',
        formatter: ({ cellValue }: any) => {
          return cellValue === 'Y' ? '是' : '否';
        },
        align: 'center',
      },
      {
        field: 'IsPictureDownLine',
        minWidth: 140,
        sortable: true,
        title: '线下采购证照管控',
        formatter: ({ cellValue }: any) => {
          return cellValue === 'Y' ? '是' : '否';
        },
        align: 'center',
      },
      {
        field: 'IsActive',
        minWidth: 80,
        title: '有效',
        slots: { default: 'activeSwitch' },
        align: 'center',
      },
      {
        field: 'categoryTypeName',
        minWidth: 120,
        sortable: true,
        title: '商品属性',
      },
      {
        field: 'Description',
        minWidth: 120,
        sortable: true,
        title: '备注',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 160,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'key',
        label: '商品类别',
        componentProps: {
          allowClear: true,
          placeholder: '请输入商品类别',
        },
      },
    ],
    gridEvents: {},
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [AddModal, addModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addModalUi,
  draggable: true,
});

// 新增 编辑 表单提交之后执行
function refreshTable() {
  ChcGridApi.query();
}

const handleAdd = () => {
  addModalApi
    .setData({
      ChcGridApi,
      openType: 'add',
      formData: {
        showForm: true,
        showFormLast: false,
        IsActive: 'Y',
      },
    })
    .open();
};

const handleEdit = (row: any) => {
  addModalApi
    .setData({
      ChcGridApi,
      openType: 'edit',
      formData: {
        showForm: true,
        showFormLast: false,
        ...row,
      },
    })
    .open();
};

const handleDel = (scope) => {
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        const { M_Product_Category_ID } = scope;
        const params = { M_Product_Category_ID };
        const response = await delCategory(params);
        if (response.success) {
          message.success('删除成功');
          ChcGridApi.query();
        } else {
          message.error(response.msg || '删除失败');
        }
      } catch {
        message.error('删除失败');
      }
    },
  });
};

const handleActiveSwitchChange = async (record: any, newValue: boolean) => {
  try {
    const params = {
      ...record,
      IsActive: newValue,
    };
    // const response = {
    //   success: true,
    //   msg: '状态更新成功',
    // }
    const response = await modifyActive(params);
    if (response.success) {
      message.success('状态更新成功');
      // 重新查询数据
      await ChcGridApi.query({});
    } else {
      message.error(response.msg || '更新失败');
    }
  } catch (error) {
    console.error('更新有效状态失败:', error);
    message.error('网络错误，更新失败');
  }
};
const isRecordActive = (record: any) => {
  return (
    record.IsActive === 'Y' || record.IsActive === true || record.IsActive === 1
  );
};

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <AddModal :after-submit="refreshTable" />
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
      </template>
      <template #activeSwitch="{ row }">
        <Switch
          :checked="isRecordActive(row)"
          @change="(checked: any) => handleActiveSwitchChange(row, !!checked)"
          checked-children="是"
          un-checked-children="否"
          :data-testid="`switch_active_${row.rowIndex}`"
        />
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope.row)"
          :data-testid="`button_edit_${scope.rowIndex}`"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDel(scope.row)"
          :data-testid="`button_delete_${scope.rowIndex}`"
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
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>
