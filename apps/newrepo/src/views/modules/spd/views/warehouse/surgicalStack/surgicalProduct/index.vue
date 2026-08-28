<script lang="ts" setup>
import { ref } from 'vue';
// import { useRoute } from 'vue-router';

import { AddActionIcon, SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { deleteDo } from './api';
import productModalUI from './modals/productModal.vue';

const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

const [productModal, productModalApi] = useVbenModal({
  connectedComponent: productModalUI,
});

// const route = useRoute();
// const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');

// const urlParams: any = {
//   docType: urlParamsObj?.docType || '',
// };

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },

      {
        field: 'productName',
        title: '药品名称',
        sortable: true,
        minWidth: '150',
      },

      {
        field: 'productSpec',
        title: '规格',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'productCode',
        title: '药品编码',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'manufacturer',
        title: '厂家',
        sortable: true,
        minWidth: '150',
      },
      {
        field: 'qty',
        title: '数量',
        sortable: true,
        align: 'right',
        minWidth: '110',
      },
      {
        field: 'uomName',
        title: '单位',
        sortable: true,
        minWidth: '180',
      },
      {
        field: 'stackType',
        title: '分包标识',
        sortable: true,
        minWidth: '110',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 80,
      },
    ],
    id: 'child',
    queryUrl: `/surgicalProductAction/queryDetail.do`,
    beforeFetchFn: (params) => {
      const { surgicalTypeId } = selectRow.value || {};
      if (isEmpty(surgicalTypeId)) {
        return false;
      }
      return {
        ...params,
        surgicalTypeId,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const [ChcGrid] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // stripe: true,

      radioConfig: {
        trigger: 'row',
        highlight: true,
      },

      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    id: 'parentTable',
    queryUrl: `/surgicalTypeAction/query.do`,
    gridColumns: [
      {
        type: 'radio',
        minWidth: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'name', title: '术式名称', minWidth: '300', sortable: true },
      { field: 'value', title: '术式编码', minWidth: '200', sortable: true },
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
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.surgicalTypeId) {
          selectRow.value = row;
          roleGridApi.query({ surgicalTypeId: row.surgicalTypeId });
        } else {
          // 父表没数据，子表要清空
          roleGridApi.grid.remove();
          selectRow.value = {};
          // roleGridApi.query({ orderId: row.orderId });
        }
      },
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const selectRow: any = ref({});

const productCode = ref('');
const handleSearch = (e: any) => {
  console.warn('handleSearch', e.target.value, productCode.value);
  roleGridApi.query({
    surgicalTypeId: selectRow.value.surgicalTypeId,
    productName: productCode.value,
  });
};

const handleAdd = () => {
  productModalApi.setData(selectRow.value).open();
};

const roleGridQuery = () => {
  roleGridApi.query({
    surgicalTypeId: selectRow.value.surgicalTypeId,
    productName: productCode.value,
  });
};

const handleCancel = (scope: any) => {
  Modal.confirm({
    title: '提示',
    content: '确认品种设置删除？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      deleteDo({ ids: scope.row.surgicalProductId }).then((res) => {
        if (res && res.success) {
          message.success({
            content: '删除成功',
          });
          roleGridQuery();
        }
      });
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <productModal @confirm="roleGridQuery" />
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden" />
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <Input
                v-model:value="productCode"
                class="mr-[0.5rem] w-[240px]"
                placeholder="请输入药品名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productCode"
              />
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleSearch"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                @click="handleAdd"
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
                danger
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleCancel(scope)"
                :data-testid="`button_delete_${scope.rowIndex}`"
              >
                删除
              </Button>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
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
