<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  SvgCopyIcon,
  SvgDeleteIcon,
  UploadActionIcon,
  UploadCloudIcon,
  viewActionIcon,
} from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { $t } from '#/locales';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { copyPlan, dataCommit, invalidateCancel } from './api';
import actionLogModal from './modals/actionLogModal.vue';
import autoCreatPlanModalComp from './modals/autoCreatPlanModal.vue';
import ImportModalComp from './modals/importModal.vue';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();

const urlParams = route.meta?.urlParams || {}; // 路由给过来的参数

// const [AutoCreatPlanModal, autoCreatPlanModalApi] = useVbenModal({
//   connectedComponent: autoCreatPlanModalComp,
// });

// 定义查询控制器 用于控制表格的查询在所有select下拉框查询并赋值后触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
});
// 表格查询的额外参数
const extParams = ref<{
  commitStatus?: string;
  page?: string;
  returnDoc?: string;
}>({
  commitStatus: 'WC',
  returnDoc: 'N',
  page: 'input',
});
const selectedAmount = ref(0); // 勾选金额
const totalAmount = ref(0); // 采购总金额

const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab的value值
const [
  ChcGrid,
  ChcGridApi,
  {
    handleExport,
    ImportModal,
    importModalApi,
    AutoCreatPlanModal,
    autoCreatPlanModalApi,
  },
] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      commonConfig: {
        labelClass: 'w-[90px]',
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
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
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
        field: 'orderPlanNo',
        minWidth: 120,
        sortable: true,
        title: $t('purchasePlan.buyPlan.orderPlanNo'),
        slots: { default: 'orderPlanNo' },
      },
      {
        field: 'datePlaned',
        minWidth: 170,
        sortable: true,
        title: $t('purchasePlan.buyPlan.datePlaned'),
      },
      {
        field: 'deliveryPlanDate',
        minWidth: 135,
        sortable: true,
        title: $t('purchasePlan.buyPlan.deliveryPlanDate'),
      },
      {
        field: 'warehouseName',
        minWidth: 150,
        sortable: true,
        title: $t('purchasePlan.buyPlan.warehouseName'),
      },
      {
        field: 'applyBPartnerName',
        minWidth: 150,
        sortable: true,
        title: $t('purchasePlan.buyPlan.applyBPartnerName'),
      },
      // 新增采购计划类型
      {
        field: 'isPreToOrderPlan',
        minWidth: 100,
        sortable: true,
        title: $t('purchasePlan.buyPlan.isTransferToPurchasing'),
        formatter({ row }: any) {
          return row.isPreToOrderPlan === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'priorityRuleName',
        minWidth: 70,
        sortable: true,
        title: $t('purchasePlan.buyPlan.priorityRuleName'),
      },
      {
        field: 'totalAmt',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.totalAmt'),
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.totalAmt);
        },
      },
      {
        field: 'lineCount',
        minWidth: 120,
        sortable: true,
        title: $t('purchasePlan.buyPlan.lineCount'),
        align: 'right',
      },
      {
        field: 'totalCount',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.totalCount'),
        align: 'right',
      },
      {
        field: 'sourceTypeName',
        minWidth: 95,
        sortable: true,
        title: $t('purchasePlan.buyPlan.sourceTypeName'),
      },
      {
        field: 'createdByName',
        minWidth: 130,
        sortable: true,
        title: $t('purchasePlan.buyPlan.createdByName'),
      },
      {
        field: 'description',
        minWidth: 150,
        sortable: true,
        title: $t('purchasePlan.buyPlan.description'),
      },
      {
        field: 'isCrossDocking',
        minWidth: 90,
        sortable: true,
        title: $t('purchasePlan.buyPlan.isCrossDocking'),
        formatter({ row }: any) {
          return row.isCrossDocking === 'Y' ? '是' : '否';
        },
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 280,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: $t('purchasePlan.buyPlan.dateOrdered'),
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            placeholder: `请选择${$t('purchasePlan.buyPlan.warehouseName')}`,
            onChange() {
              searchController.sign(1);
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
        label: $t('purchasePlan.buyPlan.warehouseName'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.applyBPartnerName')}`,
            paginate: false,
            filterByFrontEnd: true,
            onChange() {
              searchController.sign(1);
            },
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'applyBPartnerId',
        defaultValue: '',
        label: $t('purchasePlan.buyPlan.applyBPartnerName'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000369',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.sourceTypeName')}`,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            defaultValue: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'sourceType',
        label: $t('purchasePlan.buyPlan.sourceTypeName'),
      },
      {
        component: 'Input',
        fieldName: 'orderPlanNo',
        label: $t('purchasePlan.buyPlan.orderPlanNo'),
        componentProps: {
          placeholder: `请输入${$t('purchasePlan.buyPlan.orderPlanNo')}`,
        },
      },
      {
        component: 'Input',
        // TODO:medicine change 药品
        fieldName: 'productName',
        label: $t('purchasePlan.buyPlan.productName'),
        componentProps: {
          placeholder: `请输入${$t('purchasePlan.buyPlan.productName')}`,
        },
      },
      {
        // TODO:medicine change 医保药品编码
        component: 'Input',
        fieldName: 'insurance',
        label: $t('purchasePlan.buyPlan.insurance'),
        componentProps: {
          placeholder: `请输入${$t('purchasePlan.buyPlan.insurance')}`,
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.bpartnerId')}`,
            paginate: false,
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
        fieldName: 'bpartnerId',
        label: $t('purchasePlan.buyPlan.bpartnerId'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择${$t('purchasePlan.buyPlan.priorityRuleName')}`,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            defaultValue: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'priorityRule',
        label: $t('purchasePlan.buyPlan.priorityRuleName'),
      },
      // TODO: medicine delete 高值
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: `请选择${$t('purchasePlan.buyPlan.isPrecious')}`,
      //       defaultValue: '',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       showChooseAll: '',
      //       immediate: true,
      //     };
      //   },
      //   fieldName: 'isPrecious',
      //   label: $t('purchasePlan.buyPlan.isPrecious'),
      // },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: `请选择${$t('purchasePlan.buyPlan.isGift')}`,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isGift',
        label: $t('purchasePlan.buyPlan.isGift'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: `请选择${$t('purchasePlan.buyPlan.isCrossDocking')}`,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isCrossDocking',
        label: $t('purchasePlan.buyPlan.isCrossDocking'),
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: `请选择${$t('purchasePlan.buyPlan.isTransferToPurchasing')}`,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isPreToOrderPlan',
        label: $t('purchasePlan.buyPlan.isTransferToPurchasing'),
      },
    ],
    // queryColumnConfigUrl: '/userPageAction/query.do',
    dataTableId: '/orderPlanAction/queryNew.do',
    showCustomBtn: true,
    id: 'wait',
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      // totalAmount.value = params.totalPrice || 0;
      let amout = 0;
      params.rows?.forEach((item: any) => {
        if (item.totalAmt) {
          amout += Number.parseFloat(item.totalAmt);
        }
      });
      totalAmount.value = Number(amout.toFixed(2));
      calculateSelectedAmount([]);
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
    // autoLoadColumnConfig: true,
    customModals: {
      'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: ImportModalComp,
      }),
      'AutoCreatPlanModal-autoCreatPlanModalApi': deepMerge(
        importModalDefaultOptions,
        {
          // 连接抽离的组件
          connectedComponent: autoCreatPlanModalComp,
        },
      ),
    },
  },
);
// 计算勾选金额
const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  // 保留小数点后两位，四舍五入
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
      label: '采购总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

// 新建采购计划
const handleAddNew = () => {
  props.goToDetailPage(
    {},
    {
      detailTitle: '新建采购计划',
      sourcePage: props.thisTab.value,
      type: 'add',
    },
  );
};
// 编辑采购计划
const handleEdit = (scope: any) => {
  props.goToDetailPage(scope.row, {
    detailTitle: '编辑采购计划',
    sourcePage: props.thisTab.value,
    type: 'edit',
  });
};
// 打开导入弹窗
const handleImport = () => {
  importModalApi?.open();
};
// 点击采购单号
const handleOrderPlanClick = (scope: any) => {
  props.goToDetailPage(scope.row, {
    detailTitle: '查看采购计划',
    sourcePage: props.thisTab.value,
    type: 'view',
  });
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
    content: `是否提交勾选的采购计划单？`,
    onOk: async () => {
      try {
        const orderPlanIds = selectedRows.map((row: any) => row.orderPlanId);
        // const params = new URLSearchParams();
        // params.append('orderPlanId', JSON.stringify(orderPlanIds));
        const params = {
          orderPlanId: JSON.stringify(orderPlanIds),
        };
        await dataCommit(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
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
    content: `是否整单作废？`,
    onOk: async () => {
      try {
        await invalidateCancel({ orderPlanId: scope.row?.orderPlanId })
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('作废成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('作废失败');
      }
    },
  });
};
// 复制处理函数
const handleCopy = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认复制采购计划单？`,
    onOk: async () => {
      try {
        await copyPlan({ orderPlanId: scope.row?.orderPlanId })
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('复制成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('复制失败');
      }
    },
  });
};

const handleAutoCreatePlan = () => {
  autoCreatPlanModalApi!.open();
};
// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: number, oldVal: number) => {
    const detailPageConfig = props.getDetailPageConfig();
    if (
      val === props.thisTab.value &&
      (oldVal !== detailPageConfig.detailPageValue ||
        (oldVal === detailPageConfig.detailPageValue &&
          detailPageConfig.detailPageType !== 'view'))
    ) {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
);
// 定义操作记录弹窗
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});
// 查看操作记录
const handleDetail = (scope: any) => {
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      orderPlanNo: scope.row?.orderPlanNo,
    })
    .open();
};
// 初始化加载
onMounted(() => {
  console.warn('urlParams:', urlParams);
});

const refreshTable = () => {
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
};
</script>
<template>
  <div class="h-full">
    <ImportModal @close="refreshTable" />
    <AutoCreatPlanModal />
    <ActionLogModal />
    <ChcGrid>
      <template #orderPlanNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`button_order_plan_no_${scope.rowIndex}_waitToSubmit`"
        >
          {{ scope.row.orderPlanNo }}
        </a>
      </template>
      <template #toolbar-tools>
        <!-- <span>勾选金额：{{ selectedAmount }}元</span>
        <span style="margin-left: 20px">采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAddNew"
          class="mr-[0.5rem]"
          data-testid="button_add_new_waitToSubmit"
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
          data-testid="button_approve_waitToSubmit"
        >
          <template #icon>
            <UploadCloudIcon />
          </template>
          提 交
        </Button>
        <Button
          type="primary"
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import_waitToSubmit"
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
          data-testid="button_export_waitToSubmit"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleAutoCreatePlan"
          class="mr-[0.5rem]"
          data-testid="button_auto_create_plan_waitToSubmit"
        >
          智能生成采购计划
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope)"
          data-testid="button_edit_waitToSubmit"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleCopy(scope)"
          data-testid="button_copy_waitToSubmit"
        >
          复制
          <template #icon>
            <SvgCopyIcon />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          data-testid="button_action_log_waitToSubmit"
        >
          操作记录
          <template #icon>
            <viewActionIcon />
          </template>
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleCancel(scope)"
          data-testid="button_cancel_waitToSubmit"
        >
          作废
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
  display: none;
}
</style>
