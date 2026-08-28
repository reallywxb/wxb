<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge } from '#/utils/util';

import rejectModalUI from './addModal/rejectModal.vue';
import { approveWorkflow } from './api';
import { columns } from './gridOptions';

const [cols, gridColumns] = handleCommonGridColumns(columns);
const applyPlanId = ref<number | string>('');
const userStore = useUserStore();
const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
const urlParams = {
  specShowType: urlParamsObj?.specShowType || '',
};
const parentTableParams = ref<{ [key: string]: any }>({});
const isFirstLoaded = ref(false); // 是否已初次加载完
const departmentId = ref<string>('');
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
  isFirstLoaded.value = true;
});

const [RoleGrid, roleGridApi, { FormModal: RoleFormModal }] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'productCode',
          title: '药品编码',
          width: '120',
          sortable: true,
        },
        {
          field: 'productName',
          title: '药品名称',
          width: '200',
          sortable: true,
        },
        { field: 'productSpec', title: '规格', width: '90', sortable: true },
        { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
        { field: 'uomName', title: '单位', width: '72', sortable: true },
        {
          field: 'replenishPackageQty',
          title: '定数',
          width: '80',
          sortable: true,
          visible: false,
        },
        {
          field: 'qtyApplied',
          title: '计划数量',
          width: '120',
          sortable: true,
          align: 'right',
        },
        {
          field: 'qtyOnHand',
          title: '库存数量',
          width: '120',
          sortable: true,
          align: 'right',
        },
        {
          field: 'description',
          title: '备注',
          minWidth: '150',
          sortable: true,
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'applyPlanChildGrid',
    dataTableId: `/applyPlanAction/queryLine.do?specShowType=${urlParams.specShowType}`,
    // tableSearchExtraParams: searchForm,
    beforeFetchFn: (params) => {
      if (isEmpty(parentTableParams.value?.applyPlanId)) {
        return false;
      }
      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// const handleSearchForm = () => {
//   console.warn('searchFormSchemas', searchFormSchemas);
//   searchFormSchemas.forEach((item) => {
//     if (item.fieldName === 'warehouseId') {
//       item.dependencies = {
//         triggerFields: ['departmentId', 'regionId'],
//         trigger(values) {
//           console.warn(values);
//           if (
//             ChcGridApi.formApi?.getFieldComponentRef &&
//             typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
//             ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
//             ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
//           ) {
//             ChcGridApi.formApi.getFieldComponentRef(
//               'warehouseId',
//             ).params.dependencies = {
//               departmentId: values.departmentId,
//               regionId: values.departmentId || '-1',
//             };
//             ChcGridApi.formApi?.getFieldComponentRef('warehouseId')?.fetchApi();
//             // ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
//           }
//         },
//       };
//     }
//   });
//   return searchFormSchemas;
// };
const [ChcGrid, ChcGridApi, { FormModal, LogModal }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        trigger: 'cell',
        highlight: true,
      },
      radioConfig: {
        highlight: true,
        trigger: 'row',
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    dataTableId: '/applyPlanAction/query.do?&page=confirm',
    id: 'applyPlanParentGrid',
    showRadioRowTag: true,
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
        label: '单选',
      },
      ...gridColumns,
    ],
    // formSchema: handleSearchForm(),
    formSchema: [
      {
        component: 'DatePicker',
        fieldName: 'applyPlanDate',
        label: '计划月份',
        componentProps: () => {
          return {
            picker: 'month',
            format: 'YYYY-MM',
            valueFormat: 'YYYY-MM-DD',
          };
        },
        defaultValue: dayjs(dayjs().format('YYYY-MM-DD')).format('YYYY-MM-DD'),
        formItemClass: 'col-span-1',
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=N',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            allowClear: true,
            // onChange(val: any, option: any) {
            //   // console.warn('toWarehouseId', val, option);
            //   // console.warn('selectToWarehouseId', selectToWarehouseId);
            //   // selectToWarehouseId.value = option.id;
            // },
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'toWarehouseId',
        label: '申请仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择院区',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            onChange(val: any, option: any) {
              console.warn('departmentId', val, option);
              departmentId.value = val;
            },
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!departmentId.value) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择上级仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            allowClear: true,
            showChooseAll: '',
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '上级仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            console.warn(values);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
    ],
    cols,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.applyPlanId) {
          parentTableParams.value = { applyPlanId: row.applyPlanId };
          applyPlanId.value = row.applyPlanId;
          // console.log('父表选中行，触发子表查询', parentTableParams.value);
          roleGridApi.query({ applyPlanId: row.applyPlanId });
        } else {
          parentTableParams.value = { applyPlanId: undefined };
          roleGridApi.grid.remove();
        }
      },
    },
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    // childGridLinkKeys: ['userId-id'],
    // childGridApi: roleGridApi,
  },
);

const productName = ref('');
const handleSearch = (e) => {
  console.warn('handleSearch', e.target.value, productName.value);
  roleGridApi.query({
    applyPlanId: parentTableParams.value.applyPlanId,
    productName: productName.value,
  });
};

const [rejectModal, rejectModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rejectModalUI,
  draggable: true,
});

const rejectOrder = ref<number | string>('');

const handleApproval = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  console.warn('handleApproval', selectedRows);
  if (selectedRows.length === 0 || selectedRows.length > 1) {
    message.warning('请选择一条记录');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认批准吗？`,
    onOk: () => {
      try {
        const params = {
          applyPlanId: selectedRows[0].applyPlanId,
        };
        approveWorkflow(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('审核计划成功!');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
        ChcGridApi.query();
      } catch {
        message.error('审核计划失败');
      }
    },
  });
};

const handleReject = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择请领计划');
    return;
  }
  if (selectedRows.length > 1) {
    message.warning('请选择一条记录');
    return;
  }
  rejectOrder.value = selectedRows[0].applyPlanId;
  rejectModalApi.open();
};

const handleRejectClose = () => {
  console.warn('handleRejectClose');
  ChcGridApi.query();
};

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <rejectModal :reject-order="rejectOrder" @close="handleRejectClose" />
        <LogModal />
        <FormModal />
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleApproval"
              class="mr-[0.5rem]"
              data-testid="button_Approval"
            >
              批准
            </Button>
            <Button
              type="primary"
              danger
              @click="handleReject"
              data-testid="button_Reject"
            >
              退回
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <RoleFormModal />
        <RoleGrid>
          <template #toolbar-actions>
            <label for="productName">药品：</label>
            <Input
              v-model:value="productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入编码/拼音码/名称"
              @keyup.enter="handleSearch"
              allow-clear
              data-testid="input_productName"
            />
            <Button
              type="primary"
              @click="handleSearch"
              data-testid="button_search"
            >
              搜索
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
          </template>
        </RoleGrid>
      </template>
    </PageSplit>
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
