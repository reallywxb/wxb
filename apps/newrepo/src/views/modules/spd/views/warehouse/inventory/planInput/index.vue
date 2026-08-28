<script lang="ts" setup>
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';

import { AddActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import addByStrategyModalUi from './modals/addByStrategyModal.vue';
import addTable from './tables/addTable.vue';

const globalPrintStore = useGlobalPrintStore();
const route = useRoute();
// const settlementId = ref<number | string>('');
const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
const [AddByStrategyModal, AddByStrategyModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addByStrategyModalUi,
  draggable: true,
});
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});

const fatherGridColumns: (GridColumn & { searchOptions?: SearchOptions })[] = [
  {
    type: 'radio',
    title: '单选',
    visible: false,
  },
  { title: '序号', type: 'seq', width: 50, align: 'center' },

  {
    field: 'inventoryPlanNo',
    title: '盘点计划号',
    width: '110',
    sortable: true,
  },
  {
    field: 'docDate',
    title: '计划时间',
    width: '160',
    sortable: true,
  },
  {
    field: 'departmentName',
    title: '院区',
    width: '150',
    sortable: true,
  },
  {
    field: 'warehouseName',
    title: '盘点仓库',
    width: '200',
    sortable: true,
  },
  {
    field: 'poAmtBook',
    title: '账存入库金额',
    width: '120',
    align: 'right',
    sortable: true,
  },
  {
    field: 'amtBook',
    title: '账存总金额',
    width: '120',
    align: 'right',
    sortable: true,
  },
  {
    field: 'createdByName',
    title: '创建人',
    width: '100',
    sortable: true,
  },
  {
    field: 'created',
    title: '创建时间',
    width: '160',
    sortable: true,
  },
  {
    field: 'description',
    title: '备注',
    // width: '150',
    sortable: true,
  },
];
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};
const fetchSelectOptions = (fieldName: string, params: Record<string, any>) => {
  const c = isFieldComponentRefExist(fieldName);
  if (c) {
    const refInst = ChcGridApi.formApi.getFieldComponentRef(
      fieldName,
    ) as unknown as SelectComponentRef;
    if (refInst && refInst.params) {
      Object.assign(refInst.params, params);
      if (typeof refInst?.fetchApi === 'function') {
        refInst.fetchApi();
      }
    }
  }
};
const fatherTableCheckedRow = ref<Record<string, any>>({});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
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
    }),
  },
  {
    id: 'inventoryplanInput',
    // api地址
    queryUrl: '/inventoryPlanAction/query.do?page=input',
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '计划时间',
        defaultValue: [
          // 七天前
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            defaultValue: '',
            placeholder: `请选择院区`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign();
                nextTick(() => {
                  fetchSelectOptions('warehouseId', {
                    dictUrl: `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${-1}`,
                  });
                });
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            paginate: false,
            showChooseAll: '',
            autoChooseFirstOption: true,
            labelField: 'name',
            valueField: 'id',
            onChange(value: any) {
              console.warn('warehouseId onChange', value);
              searchController.sign();
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            const c = isFieldComponentRefExist('warehouseId');
            console.warn('isFieldComponentRefExist warehouseId', c);
            if (c) {
              const refInst = ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `baseHandleAction/warehouse.do?readWrite=Y&regionId=${values?.departmentId || -1}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst.fetchApi();
                }
                ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
              }
            }
          },
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        fatherTableCheckedRow.value = {};
        fatherTableCheckedRow.value = row;
        if (isEmpty(row)) {
          return;
        }
        SonChcGridApi.reload();
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      SonChcGridApi.grid.reloadData([]);
      console.warn('afterFetchFn params', params);
      if (isEmpty(params.rows)) {
        SonChcGridApi.grid.remove();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const [SonChcGrid, SonChcGridApi] = useSpdGrid(
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
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: ``,
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isShowZero',
        label: '零库存',
        defaultValue: '',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
    ],
    gridColumns: [
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
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'vendorCode',
        title: '供应商编码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
        sortable: true,
      },
      {
        field: 'qtyBook',
        title: '账存数量',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '100',
        sortable: true,
      },
      // {
      //   field: 'productionDate',
      //   title: '生产日期',
      //   minWidth: '110',
      //   sortable: true,
      // },
      // {
      //   field: 'productArea',
      //   title: '产地',
      //   width: '110',
      //   sortable: true,
      // },
      {
        field: 'locatorName',
        title: '货位',
        width: '180',
        sortable: true,
      },
      {
        field: 'vendorCode',
        title: '供应商编码',
        width: 120,
        align: 'center',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: 120,
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'unitPackQty',
        title: '包装定数',
        width: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'packageQtyBook',
        title: '账存包数',
        width: '90',
        sortable: true,
        align: 'right',
      },
    ],
    id: 'inventoryplanInput_son',
    queryUrl: '/inventoryPlanAction/queryLine.do',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      if (!fatherTableCheckedRow.value.inventoryPlanId) {
        return false;
      }

      params.inventoryPlanId = fatherTableCheckedRow.value.inventoryPlanId;
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
const PageStatusVal = {
  Main: 0,
  Add: 1,
} as const;
const currentPageStatus = ref<
  (typeof PageStatusVal)[keyof typeof PageStatusVal]
>(PageStatusVal.Main);

const addNewParams = ref<Record<string, any>>({});
const handleAddNew = async () => {
  const formValues: any = await ChcGridApi.formApi.getValues();
  console.warn('handleAddNew', formValues);
  if (isEmpty(formValues?.departmentId)) {
    message.warning('请选择院区');
    return;
  }
  if (isEmpty(formValues?.warehouseId)) {
    message.warning('请选择仓库');
    return;
  }
  addNewParams.value = {};
  addNewParams.value.warehouseId = Number.parseFloat(formValues.warehouseId);
  addNewParams.value.departmentId = Number.parseFloat(formValues.departmentId);
  currentPageStatus.value = PageStatusVal.Add;
};
const handleAddNewByStrategy = async () => {
  const formValues: Record<string, any> = await ChcGridApi.formApi.getValues();
  console.warn('handleAddNew', formValues);
  if (isEmpty(formValues?.departmentId)) {
    message.warning('请选择院区');
    return;
  }
  if (isEmpty(formValues?.warehouseId)) {
    message.warning('请选择仓库');
    return;
  }
  AddByStrategyModalApi.setData({
    warehouseId: formValues.warehouseId,
    departmentId: formValues.departmentId,
  }).open();
};
const afterSubmitWhenAddNew = () => {
  ChcGridApi.query();
};
const startInventory = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('startInventory row:', row);
  if (isEmpty(row)) {
    message.warning('请选择盘点计划');
    return;
  }
  const params: Record<string, any> = {};
  const inventoryPlanId = row.inventoryPlanId;
  params.inventoryPlanId = inventoryPlanId;
  Modal.confirm({
    title: '提示',
    content: '确认开始盘点？',
    onOk: async () => {
      try {
        await requestFormClient.post('/inventoryPlanAction/start.do', params);
        message.success('开始盘点成功');
        Modal.confirm({
          title: '打印提示',
          content: '确认打印盘点单吗？',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            globalPrintStore.print({
              pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inventoryPlanAction/printInventoryPlanDoc.do?id=${inventoryPlanId}`,
            });
          },
          onCancel() {},
        });
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};
const handleDel = async () => {
  if (isEmpty(fatherTableCheckedRow.value)) {
    message.warning('请选择盘点计划');
    return;
  }
  const params: Record<string, any> = {};
  params.inventoryPlanId = fatherTableCheckedRow.value.inventoryPlanId;
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await requestFormClient
          .post(`/inventoryPlanAction/delete.do`, params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.query();
              message.success('删除成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('删除失败');
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <AddByStrategyModal :after-submit="afterSubmitWhenAddNew" />
    <addTable
      v-if="currentPageStatus === PageStatusVal.Add"
      :warehouse-id="addNewParams.warehouseId"
      :department-id="addNewParams.departmentId"
      :after-submit="afterSubmitWhenAddNew"
      v-model:curr-page-status="currentPageStatus"
    />
    <PageSplitLazy
      v-show="currentPageStatus === PageStatusVal.Main"
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleAddNew"
              class="mr-[0.5rem]"
              data-testid="button_createPlan_planInput"
            >
              创建盘点计划
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleAddNewByStrategy"
              class="mr-[0.5rem]"
              data-testid="button_createByStrategy_planInput"
            >
              从策略生成盘点计划
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="startInventory"
              class="mr-[0.5rem]"
              data-testid="button_startInventory_planInput"
            >
              开始盘点
            </Button>
            <Button
              type="primary"
              danger
              @click="handleDel"
              class="mr-[0.5rem]"
              data-testid="button_delete_planInput"
            >
              删除
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <SonChcGrid />
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped>
::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-buttons--wrapper:not(:empty),

) {
  padding: 0 0 0.6em;
}

::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-tools--operate:not(:empty)
) {
  padding: 0 0 0.6em;
}

::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-tools--wrapper:not(:empty)
) {
  padding: 0 0 0.6em;
}

::v-deep(.vxe-cell .ant-btn > svg) {
  margin-right: -4px;
  margin-bottom: 4px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-buttons--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.ant-input-disabled) {
  color: #7c7c7c;
}

::v-deep(.ant-picker .ant-picker-input > input[disabled]) {
  color: #7c7c7c;
}

::v-deep(
  .ant-select-disabled.ant-select:not(.ant-select-customize-input)
    .ant-select-selector
) {
  color: #7c7c7c;
}
</style>
