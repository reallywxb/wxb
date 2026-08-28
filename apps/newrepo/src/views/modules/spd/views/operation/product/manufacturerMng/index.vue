<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  SvgDeleteIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
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
import { deleteProductManufacturer } from './api';
import ImportModalComp from './importModal.vue';

const userStore = useUserStore();
const isFirstLoaded = ref(false); // 是否已初次加载完
const orgId = ref<null | number | string>(null);

// 定义查询控制器 用于控制表格的查询在页面加载后自
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
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
      dataTableId: '/productAction/queryProductManufacturer.do',
      id: 'manufacturerMng',
      gridColumns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'manufacturerCode',
          minWidth: 100,
          sortable: true,
          title: '厂家商码',
        },
        {
          field: 'name',
          minWidth: 120,
          sortable: true,
          title: '厂家名称',
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
          fieldName: 'manufacturerName',
          label: '生产厂家',
          componentProps: {
            allowClear: true,
            placeholder: '请输入生产厂家',
          },
        },
        {
          component: 'ChcSelect',
          fieldName: 'isActive',
          label: '活跃',
          defaultValue: 'Y',
          componentProps: () => {
            return {
              options: [
                { label: '全部', value: '' },
                { label: '是', value: 'Y' },
                { label: '否', value: 'N' },
              ],
            };
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
      beforeFetchFn: (params) => {
        const newParams = { ...params, orgId: orgId.value };

        return newParams;
      },
      customModals: {
        'ImportModal-importModalApi': {
          class: 'w-[600px]',
          closable: true,
          connectedComponent: ImportModalComp,
          draggable: true,
        },
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
  ChcGridApi.query({});
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
        const { manufacturerId } = scope;
        const params = { manufacturerId };
        const response = await deleteProductManufacturer(params);
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

const handleImport = () => {
  importModalApi?.open();
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
    <ImportModal :after-submit="refreshTable" />
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
        <Button
          type="primary"
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import"
        >
          导入
          <template #icon>
            <UploadActionIcon />
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
