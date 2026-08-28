<script lang="ts" setup>
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { computed, h, nextTick, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SvgDeleteIcon } from '@vben/chc-icons';
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

import chooseLotModalUi from './modals/chooseLotModal.vue';

const globalPrintStore = useGlobalPrintStore();

const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const route = useRoute();
// const settlementId = ref<number | string>('');
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
let docType = urlParams?.docType || '';
if (docType === 'I ') {
  docType = 'I+';
}
const isProductControlLevel = computed(() => {
  return userStore?.userInfo?.isProductControlLevel;
});
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
const [ChooseLotModal, ChooseLotModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: chooseLotModalUi,
  draggable: true,
});
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});

let fatherGridColumns: (GridColumn & { searchOptions?: SearchOptions })[] = [
  {
    type: 'radio',
    title: '单选',
    width: 0,
    align: 'center',
    visible: false,
  },
  {
    type: 'checkbox',
    align: 'center',
    title: '多选',
  },
  { title: '序号', type: 'seq', width: 50, align: 'center' },

  {
    field: 'inventoryNo',
    title: '申请单号',
    width: '110',
    sortable: true,
  },
  {
    field: 'movementDate',
    title: '申请时间',
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
    title: '仓库',
    width: '200',
    sortable: true,
  },
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
    width: '150',
    sortable: true,
  },
  {
    field: 'productControlLevelName',
    title: '管控类型',
    visible: !isProductControlLevel.value,
    width: '110',
    sortable: true,
  },
  {
    field: 'uomName',
    title: '单位',
    width: '70',
    sortable: true,
  },
  {
    field: 'qty',
    title: `${docType === 'I-' ? '报损' : '报溢'}数量`,
    width: '100',
    align: 'right',
    sortable: true,
  },
  {
    field: 'totalAmt',
    title: `${docType === 'I-' ? '报损' : '报溢'}金额`,
    width: '100',
    align: 'right',
    sortable: true,
    formatter: ({ cellValue }) => {
      return cellValue.toFixed(2);
    },
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
];
fatherGridColumns = fatherGridColumns.filter((item) => {
  if (
    item.field === 'action' ||
    item.type === 'radio' ||
    item.type === 'checkbox'
  ) {
    return true;
  }
  if (item.visible !== undefined && item.visible === false) {
    return false;
  }
  return true;
});
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
        trigger: 'row',
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'outCommit',
    // api地址
    queryUrl: `/inventoryAction/query.do?page=commit&docType=${encodeURIComponent(docType)}`,
    showRadioRowTag: true,
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '申请时间',
        defaultValue: [
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'), // 七天前
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            autoChooseFirstOption: true,
            onChange(val: any, option: any) {
              console.warn('warehouseId', val, option);
              searchController.sign();
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: ``,
          };
        },
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.inventoryId) {
          fatherTableCheckedRow.value = row;
          SonChcGridApi.reload({
            inventoryId: row.inventoryId,
          });
          await ChcGridApi.grid.clearCheckboxRow();
          ChcGridApi.grid.setCheckboxRow(row, true);
        } else {
          fatherTableCheckedRow.value = {};
          SonChcGridApi.grid.remove(SonChcGridApi.grid.getFullData());
        }
      },
      // 单个复选框变化事件
      // checkboxChange: (v: any) => {
      //   console.warn('父表格 checkboxChange', v);

      //   if (v.checked) {
      //     fatherTableCheckedRow.value = {};
      //     fatherTableCheckedRow.value = v.row;
      //     SonChcGridApi.query();
      //   } else if (
      //     v.checked === false &&
      //     !isEmpty(v.row.inventoryId) &&
      //     !isEmpty(fatherTableCheckedRow.value.inventoryId) &&
      //     fatherTableCheckedRow.value.inventoryId === v.row.inventoryId
      //   ) {
      //     fatherTableCheckedRow.value = {};
      //     SonChcGridApi.grid.remove();
      //   }
      // },
      // 全选/全不选事件
      checkboxAll: (v: any) => {
        console.warn('父表格 checkboxAll', v);
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      SonChcGridApi.grid.reloadData([]);
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
    formSchema: [],
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'qty',
        title: `${docType === 'I-' ? '报损' : '报溢'}数量`,
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price',
        title: '采购价',
        width: '90',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue.toFixed(2);
        },
      },
      {
        field: 'lineAmt',
        title: `${docType === 'I-' ? '报损' : '报溢'}金额`,
        width: '100',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue.toFixed(2);
        },
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '180',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '110',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '110',
        sortable: true,
      },
      {
        field: 'productionDate',
        title: '生产日期',
        width: '110',
        sortable: true,
      },
      {
        field: 'productArea',
        title: '产地',
        width: '110',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '180',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'inventoryReasonName',
        title: '损溢原因',
        width: '150',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        width: '150',
        sortable: true,
      },
      {
        field: 'action',
        fixed: 'right',
        title: '操作',
        align: 'center',
        width: 150,
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                type: 'primary',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  ChooseLotModalApi.setData({
                    row: { ...scope.row },
                    warehouseId: fatherTableCheckedRow.value.warehouseId,
                  }).open();
                },
              },
              { default: () => '指定批号' },
            );
          },
        },
      },
    ],
    id: 'outCommit_son',
    queryUrl: '/inventoryAction/queryDetail.do',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      if (!isEmpty(fatherTableCheckedRow.value.inventoryId)) {
        params.inventoryId = fatherTableCheckedRow.value.inventoryId;
      }
      if (!fatherTableCheckedRow.value.inventoryId) {
        return false;
      }

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

const afterSubmit = () => {
  ChcGridApi.query();
};
const handleDel = async () => {
  const checkedRows = ChcGridApi.grid.getCheckboxRecords();
  const unProxyRows = toRaw(checkedRows);
  console.warn('handleSubmit unProxyRows', unProxyRows);
  if (unProxyRows.length <= 0) {
    message.warning(`请选择${docType === 'I-' ? '报损' : '报溢'}申请！`);
    return;
  }
  const params: Record<string, any> = {};
  params.inventoryId = JSON.stringify(
    unProxyRows.map((item: any) => item.inventoryId),
  );

  Modal.confirm({
    title: '提示',
    content: `确认作废${unProxyRows.length}笔${
      docType === 'I-' ? '报损' : '报溢'
    }申请吗？`,
    onOk: async () => {
      try {
        await requestFormClient.post(`/inventoryAction/cancel.do`, params);
        message.success('作废成功');
        ChcGridApi.query();
      } catch (error) {
        console.error('作废失败', error);
      }
    },
  });
};
const handlePrintAfterSubmit = (ids: (number | string)[]) => {
  const str = ids.join(',');
  Modal.confirm({
    title: '打印提示',
    content: `确认打印${docType === 'I-' ? '报损' : '报溢'}单吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inventoryAction/printInventory${
          docType === 'I-' ? 'Out' : 'In'
        }Doc.do?id=${str}`,
      });
    },
    onCancel() {},
  });
};

const handleSubmit = async () => {
  const checkedRows = ChcGridApi.grid.getCheckboxRecords();
  const unProxyRows = toRaw(checkedRows);
  console.warn('handleSubmit unProxyRows', unProxyRows);
  if (!checkedRows || checkedRows.length === 0) {
    message.error(`请选择${docType === 'I-' ? '报损' : '报溢'}申请！`);
    return;
  }
  const params: Record<string, any> = {};

  const paramLine = unProxyRows.map((o: any) => o.inventoryId);
  params.inventoryId = JSON.stringify(paramLine);
  Modal.confirm({
    title: '提示',
    content: `确认提交${unProxyRows.length}笔${
      docType === 'I-' ? '报损' : '报溢'
    }申请吗？`,
    onOk: async () => {
      try {
        await requestFormClient.post(`/inventoryAction/commit.do`, params);
        message.success('提交成功');
        handlePrintAfterSubmit(paramLine);
        ChcGridApi.query();
      } catch {
        message.error('删除失败');
      }
    },
  });
};
const handlePrint = () => {
  const checkedRows = ChcGridApi.grid.getCheckboxRecords(true);
  console.warn('checkedRows', checkedRows);

  if (!checkedRows || checkedRows.length === 0) {
    message.error('请选择一条记录');
    return;
  }
  if (checkedRows.length > 1) {
    message.error(`每次打印一张${docType === 'I-' ? '报损' : '报溢'}单`);
    return;
  }
  let headerId: number | string | undefined;
  if (checkedRows && checkedRows[0]) {
    headerId = checkedRows[0].inventoryId;
  }

  Modal.confirm({
    title: '打印提示',
    content: `确认打印${docType === 'I-' ? '报损' : '报溢'}单吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inventoryAction/printInventory${
          docType === 'I-' ? 'Out' : 'In'
        }Doc.do?id=${headerId}`,
      });
    },
    onCancel() {},
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChooseLotModal :after-submit="afterSubmit" />
    <PageSplitLazy
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
              @click="handlePrint"
              class="mr-[0.5rem]"
              data-testid="button_print_outCommit"
            >
              打印
            </Button>
            <Button
              type="primary"
              @click="handleSubmit"
              class="mr-[0.5rem]"
              data-testid="button_submit_outCommit"
            >
              提交
            </Button>
            <Button
              type="primary"
              danger
              @click="handleDel"
              class="mr-[0.5rem]"
              data-testid="button_delete_outCommit"
            >
              作废
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
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
