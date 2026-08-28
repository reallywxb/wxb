<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  ExportActionIcon,
  SvgDeleteIcon,
  UploadActionIcon,
} from '@vben/chc-icons';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import { dataCommit, invalidateCancel } from './api';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();
const urlParams = route.meta?.urlParams || {};

class LazySelect {
  callBack;
  count;
  nowNum = 0;
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign() {
    this.nowNum++;
    if (this.nowNum === this.count) {
      this.callBack();
    }
  }
}
// 用于控制表格的查询在所有select下拉框查询完并赋值后触发
const selectController = new LazySelect(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});
const extParams = ref({});
const selectedAmount = ref(0);
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const isFirstLoaded = ref(false);
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['createdFrom', 'createdTo'], 'YYYY-MM-DD'],
          ['dateCommit', ['commitFrom', 'commitTo'], 'YYYY-MM-DD'],
        ],
        handleSubmit: async (values: any) => {
          console.warn('values', values);
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          ChcGridApi.reload(formValues);
        },
        commonConfig: {
          labelClass: 'w-[90px]',
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        checkboxConfig: {
          highlight: true,
        },
        proxyConfig: {
          autoLoad: true,
        },
      }),

      // 添加表格事件监听
      gridEvents: {
        // 单个复选框变化事件
        checkboxChange: ({ records }: { records: any[] }) => {
          calculateSelectedAmount(records);
        },
        // 全选/全不选事件
        checkboxAll: ({ records }: { records: any[] }) => {
          calculateSelectedAmount(records);
        },
      },
    },
    {
      gridColumns: [
        {
          title: '多选',
          type: 'checkbox',
          width: 50,
          align: 'center',
        },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'deliveryNo',
          minWidth: 120,
          sortable: true,
          title: '入库单号',
          slots: { default: 'deliveryNo' },
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          field: 'invoiceStatus',
          minWidth: 90,
          sortable: true,
          title: '开票状态',
          formatter({ row }: any) {
            const statusMap: Record<string, string> = {
              Y: '已开票',
              N: '未开票',
            };
            return statusMap[row.invoiceStatus] || '';
          },
        },
        {
          field: 'bpartnerName',
          minWidth: 120,
          sortable: true,
          title: '供应商',
        },
        {
          field: 'warehouseName',
          minWidth: 150,
          sortable: true,
          title: '采购仓库',
        },
        {
          field: 'totalAmt',
          minWidth: 90,
          sortable: true,
          title: '金额',
          align: 'right',
        },
        {
          field: 'docStatusName',
          minWidth: 120,
          sortable: true,
          title: '单据状态',
        },
        {
          field: 'createdByName',
          minWidth: 100,
          sortable: true,
          title: '创建人',
        },
        {
          field: 'created',
          minWidth: 150,
          sortable: true,
          title: '创建时间',
        },
        {
          field: 'confirmUserName',
          minWidth: 100,
          sortable: true,
          title: '提交人',
        },
        {
          field: 'confirmTime',
          minWidth: 150,
          sortable: true,
          title: '提交时间',
        },
        {
          field: 'description',
          minWidth: 150,
          sortable: true,
          title: '备注',
        },
        // {
        //   field: 'isCrossDocking',
        //   minWidth: 150,
        //   sortable: true,
        //   title: '是否直供',
        //   formatter({ row }: any) {
        //     return row.isCrossDocking === 'Y' ? '是' : '否';
        //   },
        // },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: '操作',
          width: 180,
        },
      ],
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'dateOrdered',
          label: '创建时间',
          defaultValue: [
            dayjs(dayjs().format('YYYY-MM-DD'))
              .subtract(7, 'day')
              .format('YYYY-MM-DD'),
          ],
          formItemClass: 'col-span-1',
        },
        {
          component: 'DateGroup',
          fieldName: 'dateCommit',
          label: '入库提交时间',
          formItemClass: 'col-span-1',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              autoChooseFirstOption: true,
              dictUrl:
                '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y&categoryType=2',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              placeholder: '请选择采购仓库',
              onChange(val: any, option: any) {
                console.warn('warehouseId', val, option);
                selectController.sign();
              },
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
          fieldName: 'warehouseId',
          label: '采购仓库',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/vendor.do?categoryType=2',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择供应商',
              paginate: false,
              filterByFrontEnd: true,
              // onChange(val: any, option: any) { },
              // mode: 'multiple',
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
          fieldName: 'bpartnerId',
          label: '供应商',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              defaultValue: '',
              dictUrl: '/baseHandleAction/refList.do?id=131',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择单据状态',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                // 只保留新建(DR)和已确认(CO)选项
                const rows =
                  res &&
                  res.rows?.filter(
                    (item: any) => item.id === 'DR' || item.id === 'CO',
                  );
                return { ...res, rows: undefined, records: rows };
              },
            };
          },
          fieldName: 'docStatus',
          label: '单据状态',
        },
        {
          component: 'Input',
          fieldName: 'asnNo',
          label: '入库单号',
          componentProps: {
            placeholder: '请输入入库单号',
          },
        },
        {
          component: 'Input',
          fieldName: 'productName',
          label: '商品',
          componentProps: {
            placeholder: '请输入商品',
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              options: [
                { value: '', label: '全部' },
                { value: 'Y', label: '已开票' },
                { value: 'N', label: '未开票' },
              ],
              placeholder: '请选择开票状态',
              paginate: false,
              filterByFrontEnd: true,
              showChooseAll: '',
              immediate: true,
            };
          },
          fieldName: 'invoiceStatus',
          label: '开票状态',
        },
      ],
      dataTableId:
        '/asnAction/query.do?asnType=PO&page=input&isPackaged=&invoiceMethod=&isGt=N',
      id: 'manualInfoHandleCheck',
      commonFormOptions,
      viewFormOptions,
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      afterFetchFn: (params) => {
        let amout = 0;
        params.rows?.forEach((item: any) => {
          if (item.totalAmt) {
            amout += Number.parseFloat(item.totalAmt);
          }
        });
        totalAmount.value = Number(amout.toFixed(2));
        console.warn('getTableArrDataFn:', params.totalPrice);
        setTimeout(() => {
          calculateSummarize();
        }, 200);
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
    },
  );

const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = Number.parseFloat(total.toFixed(2));
  calculateSummarize();
};

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '勾选金额',
      value: selectedAmount.value,
    },
    {
      label: '总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
// 新增(已开票/未开票)
const handleAddNew = (typeAction: 'invoice' | 'noInvoice' = 'invoice') => {
  parentData.value = {};
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '新建手工入库单',
    sourcePage: props.thisTab.value,
    type: 'edit',
    typeAction,
  };
};
// 明细提交
const handleEdit = (scope: any) => {
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;
  const typeAction =
    scope.row.invoiceStatus === 'Y' ? 'invoiceEdit' : 'noInvoiceEdit';
  detailInfo.value = {
    detailTitle: '编辑手工入库单',
    sourcePage: props.thisTab.value,
    type: 'edit',
    typeAction,
  };
};
const handleImport = () => {
  importModalApi?.open();
};

// 查看
const handleOrderPlanClick = (scope: any) => {
  console.warn('点击采购计划单号:', scope.row);
  // 这里可以添加跳转到单据明细的逻辑
  // 类似 waitToSubmit.vue 中的编辑功能
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;
  const typeAction =
    scope.row.invoiceStatus === 'Y' ? 'invoiceView' : 'noInvoiceView';
  detailInfo.value = {
    detailTitle: '查看手工入库单',
    sourcePage: props.thisTab.value,
    type: 'view',
    typeAction,
  };
};
// 提交通过处理函数
const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要提交的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: `是否将选中的手工入库单提交？`,
    onOk: async () => {
      try {
        const asnIds = selectedRows.map((row: any) => row.asnId);
        // const params = new URLSearchParams();
        // params.append('asnId', JSON.stringify(asnIds));
        const params = {
          asnId: JSON.stringify(asnIds),
        };
        await dataCommit(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('dataCommitdataCommitdataCommit', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('提交成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('提交失败');
      }
    },
  });
};

// 作废处理函数
const handleCancel = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `是否将此手工入库单删除？`,
    onOk: async () => {
      try {
        await invalidateCancel({ asnId: scope.row?.asnId })
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

onMounted(() => {
  console.warn('urlParams:', urlParams);
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
});
</script>
<template>
  <div class="h-full">
    <ImportModal />
    <ChcGrid>
      <template #deliveryNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`link_delivery_no_${scope.rowIndex}_handleCheck`"
        >
          {{ scope.row.deliveryNo }}
        </a>
      </template>
      <template #toolbar-tools>
        <Summarize ref="summarizeRef" />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAddNew('invoice')"
          class="mr-[0.5rem]"
          data-testid="button_add_invoice_handleCheck"
        >
          新建已开票单据
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleAddNew('noInvoice')"
          class="mr-[0.5rem]"
          data-testid="button_add_no_invoice_handleCheck"
        >
          新建未开票单据
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_approve_handleCheck"
        >
          提 交
        </Button>
        <Button
          type="primary"
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import_handleCheck"
        >
          导 入
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_handleCheck"
        >
          导 出
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
          @click="handleEdit(scope)"
          :data-testid="`button_edit_${scope.rowIndex}_handleCheck`"
        >
          明细提交
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleCancel(scope)"
          :data-testid="`button_delete_${scope.rowIndex}_handleCheck`"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
