<script setup lang="ts">
import { nextTick, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  SearchActionIcon,
  SvgPrintFillIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { dataCommit, invalidateCancel } from './api';
import batchChangePriceModalComp from './modals/batchChangePriceModal.vue';
import ImportModalComp from './modals/importModal.vue';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const parentTableParams = ref<{ [key: string]: any }>({});
const route = useRoute();
const urlParams = route.meta?.urlParams || {};
console.warn('urlParams====>', urlParams);
const globalPrintStore = useGlobalPrintStore();

const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');

const extParams = ref<{
  docStatus?: string;
  page?: string;
  // returnDoc?: string;
}>({
  // docStatus: "'DR','NA'",
  docStatus: 'CO',
  // returnDoc: 'N',
  page: 'input',
});
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});

// 子表
const [RoleGrid, roleGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        // ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        // ['dateGun', ['certValidFrom', 'certValidTo'], 'YYYY-MM-DD'],
      ],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
      pagerConfig: {
        enabled: true,
      },
      // rowStyle:() => {}
      // cellStyle: () => {}
    }),
  },
  {
    gridColumns: [
      {
        type: 'radio',
        width: 60,
        visible: false,
        title: '单选',
      },
      {
        title: '序号',
        minWidth: 50,
        type: 'seq',
        align: 'center',
        // formatter(scope: any) {
        //   return scope.rowIndex + 1;
        // },
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 100,
        sortable: true,
        // formatter(scope: any) {
        //   console.log('药品编码:', scope);
        //   return scope.cellValue;
        // },
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: 200,
        sortable: true,
        visible: false,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        sortable: true,
        minWidth: 120,
      },
      {
        field: 'uomName',
        title: '单位',
        sortable: true,
        minWidth: 100,
      },
      {
        field: 'priceList',
        title: '原零售价',
        sortable: true,
        minWidth: 90,
        align: 'right',
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'priceListNew',
        title: '新零售价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePO',
        title: '原采购价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'pricePONew',
        title: '新采购价',
        width: 90,
        align: 'right',
        sortable: true,
        formatter({ cellValue }: any) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'description',
        title: '备注',
        width: 150,
        sortable: true,
      },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/productAction/queryProductPriceListAdj.do',
    beforeFetchFn: (params) => {
      if (isEmpty(parentTableParams.value?.priceListAdjId)) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
    afterFetchFn: (params) => {
      // 数据加载成功后，自动选中第一行
      if (params.rows && params.rows.length > 0) {
        nextTick(() => {
          roleGridApi.grid.setRadioRow(params.rows[0]);
        });
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const commitRow = ref<any>({});
const [ChcGrid, ChcGridApi, { ImportModal, importModalApi }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values: any) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        highlight: true,
        trigger: 'row',
      },
    }),
  },
  {
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      {
        field: 'sitePriceListAdjId',
        title: '调价单号',
        minWidth: 110,
        sortable: true,
      },
      { field: 'docDate', title: '单据日期', minWidth: 120, sortable: true },
      { field: 'adjNo', title: '调价文号', minWidth: 130, sortable: true },
      {
        field: 'adjTypeName',
        title: '调价类型',
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'effectiveTime',
        title: '生效时间',
        minWidth: 130,
        sortable: true,
      },
      {
        field: 'productCount',
        title: '品种数',
        minWidth: 70,
        align: 'right',
        sortable: true,
      },
      {
        field: 'adjReason',
        title: '调价原因',
        minWidth: 160,
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: 110,
        sortable: true,
      },
      {
        field: 'approveUserName',
        title: '审批人',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'approveTime',
        title: '审批时间',
        minWidth: 160,
        sortable: true,
      },
      { field: 'description', title: '备注', minWidth: 150, sortable: true },
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
        component: 'DateGroup',
        fieldName: 'date',
        label: '单据日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            // .subtract(2, 'week')
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'sitePriceListAdjId',
        label: '调价单号',
        componentProps: () => {
          return {
            placeholder: '请输入调价单号',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '请输入药品',
          };
        },
      },
    ],
    dataTableId: '/productAction/queryPriceListAdj.do',
    id: 'listTable',

    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      totalAmount.value = params.totalPrice || 0;
      console.warn('afterFetchFn:', params.totalPrice);
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: ImportModalComp,
      }),
    },
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.priceListAdjId) {
          commitRow.value = row;
          parentTableParams.value = {
            priceListAdjId: row.priceListAdjId,
          };
          roleGridApi.query({ priceListAdjId: row.priceListAdjId });
        } else {
          // 父表没数据，子表要清空
          commitRow.value = {};
          parentTableParams.value = {};
          roleGridApi.grid.remove();
        }
      },
    },
  },
);

const [batchChangePriceModal, batchChangePriceModalApi] = useVbenModal({
  connectedComponent: batchChangePriceModalComp,
});

// 作废处理函数
const handleCancel = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await invalidateCancel({ priceListAdjId: scope.row?.priceListAdjId })
          .then((res) => {
            if (res && res.success) {
              console.warn('rejectWorkrejectWorkrejectWork', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
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

const handleAddNew = () => {
  parentData.value = {};
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '新建调价单',
    sourcePage: props.thisTab.value,
    type: 'edit',
    typeAction: 'add',
  };
};
const handleEdit = (scope: any, action: 'edit' | 'view') => {
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '编辑调价单',
    sourcePage: props.thisTab.value,
    type: action,
    typeAction: action,
  };
  // currentTab.value = 1;
};

const handleApprove = () => {
  // 先检查是否有选中的行数据
  if (!commitRow.value.priceListAdjId) {
    message.warning('请先选择要提交的数据');
    return;
  }
  if (['CO', 'WU'].includes(commitRow.value.docStatus)) {
    message.warning('调价单已确认，不能重复确认!');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    // title: '提交仓库请领单',
    content: '是否确认？',
    onOk: async () => {
      try {
        const params = {
          priceListAdjId: commitRow.value.priceListAdjId,
        };
        // params.append('priceListAdjId', commitRow.value.priceListAdjId);
        await dataCommit(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('urgeOrderDourgeOrderDourgeOrderDo', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('确认成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('确认失败');
      }
    },
  });
};

const handleImport = () => {
  importModalApi?.open();
};

const handleBatchChangePrice = () => {
  batchChangePriceModalApi.open();
};
const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
};

const handlePrint = () => {
  if (!commitRow.value.priceListAdjId) {
    message.warn('请选择一条记录');
    return;
  }
  Modal.confirm({
    title: '打印提示',
    content: '确认打印调价单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/productAction/printPriceListAdj.do?priceListAdjId=${commitRow.value.priceListAdjId}`,
      });
    },
    onCancel() {},
  });
};

// 查询
const searchContent = ref('');
const handleSearch = () => {
  if (!commitRow.value.sitePriceListAdjId) return;
  roleGridApi.query({
    priceListAdjId: commitRow.value.sitePriceListAdjId,
    productName: searchContent.value.trim(),
  });
};

watch(
  () => currentTab.value,
  (val: number | string) => {
    if (val === props.thisTab.value) {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
);
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ImportModal @close-refresh="handleQuery" />
          <batchChangePriceModal @confirm="handleQuery" />
          <ChcGrid>
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrint"
                data-testid="button_print_infoQuery"
              >
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
                打印
              </Button>
              <Button
                type="primary"
                @click="handleBatchChangePrice"
                class="mr-[0.5rem]"
                data-testid="button_batchChangePrice_infoQuery"
              >
                批量调价
              </Button>
              <Button
                type="primary"
                @click="handleAddNew"
                class="mr-[0.5rem]"
                data-testid="button_addNew_infoQuery"
              >
                新 建
                <template #icon>
                  <AddActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                @click="handleApprove"
                class="mr-[0.5rem]"
                data-testid="button_approve_infoQuery"
              >
                确 认
              </Button>
              <Button
                type="primary"
                @click="handleImport"
                class="mr-[0.5rem]"
                data-testid="button_import_infoQuery"
              >
                导 入
                <template #icon>
                  <UploadActionIcon />
                </template>
              </Button>
            </template>
            <template #toolbar-tools>
              <!-- <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span> -->
            </template>
            <template #priceListAdjId="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleEdit(scope, 'view')"
                :data-testid="`a_edit_${scope.rowIndex}_infoQuery`"
              >
                {{ scope.row.orderNo }}
              </a>
            </template>

            <template #action="scope">
              <Button
                ghost
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleEdit(scope, 'edit')"
                :data-testid="`button_edit_${scope.rowIndex}_infoQuery`"
              >
                编辑
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
              <Button
                danger
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                :disabled="['CO', 'WU'].includes(scope.row.docStatus)"
                @click="handleCancel(scope)"
                :data-testid="`button_delete_${scope.rowIndex}_infoQuery`"
              >
                删除
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <div class="pt-[10px]">
                <label for="searchContent">药品：</label>
                <Input
                  v-model:value="searchContent"
                  class="mr-[0.5rem] w-[240px]"
                  placeholder="编码/拼音码/名称"
                  @keyup.enter="handleSearch"
                  allow-clear
                  data-testid="input_searchContent_infoQuery_childGrid"
                />
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="handleSearch"
                  data-testid="button_search_infoQuery_childGrid"
                >
                  查询
                  <template #icon>
                    <SearchActionIcon />
                  </template>
                </Button>
                <Button
                  type="primary"
                  @click="handleExport"
                  class="mr-[0.5rem]"
                  data-testid="button_export_infoQuery_childGrid"
                >
                  导出
                  <template #icon>
                    <ExportActionIcon />
                  </template>
                </Button>
              </div>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
    </div>
  </Page>
</template>
<style scoped></style>
