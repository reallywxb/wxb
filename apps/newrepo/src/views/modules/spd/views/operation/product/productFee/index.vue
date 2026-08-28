<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import addModalUi from './addModal/index.vue';
import { deleteFee } from './api';

const userStore = useUserStore();
const isFirstLoaded = ref(false); // 是否已初次加载完
const orgId = ref<null | number | string>(null);

onMounted(() => {
  orgId.value = userStore.userInfo?.orgId;
});

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
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
      handleReset: async () => {
        await ChcGridApi.formApi.resetForm();
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(formValues);
        ChcGridApi.reload(formValues);
        // const defaultParams = {
        //   orgId: orgId.value,
        //   isActive: undefined,
        // };
        // ChcGridApi.reload(defaultParams);
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
    dataTableId: '/productAction/queryFee.do',
    id: 'productFee',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'feeCode',
        minWidth: 100,
        sortable: true,
        title: '计费编码',
      },
      {
        field: 'name',
        minWidth: 120,
        sortable: true,
        title: '计费名称',
      },
      {
        field: 'value',
        minWidth: 120,
        sortable: true,
        title: '搜索码',
      },
      {
        field: 'isActive',
        minWidth: 140,
        sortable: true,
        title: '是否有效',
        formatter: ({ cellValue }: any) => {
          return cellValue === 'Y' ? '是' : '否';
        },
        align: 'center',
      },
      {
        field: 'description',
        minWidth: 120,
        sortable: true,
        title: '描述',
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
        fieldName: 'feeName',
        label: '计费名称',
        componentProps: {
          allowClear: true,
          placeholder: '请输入计费名称',
        },
      },
      // {
      //   component: 'Checkbox',
      //   fieldName: 'isActive',
      //   label: '活跃',
      //   defaultValue: true,
      //   componentProps: () => {
      //     return {
      //       defaultValue: true,
      //     };
      //   },
      // },
      // 禅道2484
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
          };
        },
        fieldName: 'isActive',
        label: '是否活跃',
      },
    ],
    tableSearchExtraParams: {},
    gridEvents: {},
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    beforeFetchFn: (params) => {
      const newParams = { ...params, orgId: orgId.value };
      return newParams;
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
        isActive: 'Y',
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
        const { feeId } = scope;
        const params = { feeId };
        const response = await deleteFee(params);
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

onMounted(() => {
  orgId.value = userStore.userInfo?.orgId;
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
