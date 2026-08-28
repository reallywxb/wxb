<script lang="ts" setup>
import { ref } from 'vue';
// import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { deleteDo } from './api';
import ImportModalComp from './modals/importModal.vue';
import typeModalUI from './modals/typeModal.vue';

const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');

const extParams = ref<any>({});

const [typeModal, typeModalApi] = useVbenModal({
  connectedComponent: typeModalUI,
});

// 父表
const [ChcGrid, ChcGridApi, { ImportModal, importModalApi }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
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
    id: 'parent',
    queryUrl: '/surgicalTypeAction/query.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      { field: 'name', title: '名称', minWidth: '300', sortable: true },
      { field: 'value', title: '编码', minWidth: '200', sortable: true },
      {
        field: 'isActive',
        title: '是否有效',
        minWidth: '120',
        sortable: true,
        formatter({ row }: any) {
          return row.isActive === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isStockup',
        title: '是否预备货',
        minWidth: '120',
        sortable: true,
        formatter({ row }: any) {
          return row.isStockup === 'Y' ? '是' : '否';
        },
      },
      { field: 'description', title: '备注', sortable: true, minWidth: '150' },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 150,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/userOrgList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择机构',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          show: () => {
            return userStore.userInfo.isSaas;
          },
        },
        fieldName: 'orgId',
        label: '机构',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        componentProps: {
          placeholder: '请输入名称',
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'isActive',
        defaultValue: true,
        label: '活跃',
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {},
    afterFetchFn: (params) => {
      const rows =
        params.rows?.map((item: any) => {
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
        isActive: params.isActive ? 'Y' : undefined,
      };
    },
    customModals: {
      'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: ImportModalComp,
      }),
    },
  },
);

const typeData = ref<any>({});

const handleEdit = (scope: any) => {
  // currentTab.value = 1;
  typeData.value = scope.row;
  typeModalApi.setData(typeData.value).open();
};

const handleAdd = () => {
  typeData.value = {};
  typeModalApi.setData({}).open();
};

const handleCancel = (scope: any) => {
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      deleteDo({ ids: scope.row.surgicalTypeId }).then((res) => {
        if (res && res.success) {
          message.success({
            content: '删除成功',
          });
          handleQuery();
        }
      });
    },
  });
};

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};

const handleImport = () => {
  importModalApi?.open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <typeModal :type-data="typeData" @close="handleQuery" />
    <ImportModal @close="handleQuery" />
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleAdd"
            class="mr-[0.5rem]"
            data-testid="button_add"
          >
            新 建
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
            导 入
            <template #icon>
              <UploadActionIcon />
            </template>
          </Button>
        </template>
        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleEdit(scope)"
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
            @click="handleCancel(scope)"
            :data-testid="`button_delete_${scope.rowIndex}`"
          >
            删除
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
