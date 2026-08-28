<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw, watch } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, hospitalChange } from '#/utils/util';

import { approveWork, rejectWork } from './api';
import ImportModalComp from './importModal.vue';
import approveLogModal from './modals/approveLogModal.vue';
import { commonFormOptions, viewFormOptions } from './options';
import { ChcSelect } from '@vben/chc-ui';
import { isEmpty } from '@vben/utils';
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

const userStore = useUserStore();

const [ApproveLogModal, approveLogModalApi] = useVbenModal({
  connectedComponent: approveLogModal,
});

const searchController = new LazySearch(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});

const isFirstLoaded = ref(false);
const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  isGift?: string;
}>({
  commitStatus: "'CO'",
  approvalStatus: "'WA'",
  isGift: 'N',
});
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});
const selectedAmount = ref(0);
const hospitalId = ref(null);
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const [ChcGrid, ChcGridApi, { handleExport, ImportModal }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        if (!formValues.hospitalId) {
          message.warn('医院必选，请选择医院');
          return;
        }
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
        // ChcGridApi.formApi.getValues().then((res: any) => {
        //   console.log('getValues', res);
        //   ChcGridApi.query({ ...res });
        // });
      },
      handleReset: async () => {
        await ChcGridApi.formApi.resetForm();
        // const formValues = await ChcGridApi.formApi.getValues();
        // ChcGridApi.formApi.setLatestSubmissionValues(formValues);
        // ChcGridApi.reload(formValues);
      },
    }),
    // formOptions: {
    //   fieldMappingTime: [
    //     ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
    //   ],
    //   compact: true,
    //   layout: 'horizontal',
    //   submitButtonOptions: {
    //     content: '查询',
    //   },
    // },
    // gridOptions: {
    //   checkboxConfig: {
    //     highlight: true,
    //   },
    //   proxyConfig: {
    //     autoLoad: false,
    //   },
    // },
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
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
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orderPlanNo',
        minWidth: 120,
        sortable: true,
        title: '采购计划单号',
        slots: { default: 'orderPlanNo' },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'commitTime',
        minWidth: 170,
        sortable: true,
        title: '采购计划提交计划时间',
      },
      // TODO: medicine add 医院
      {
        field: 'hospitalName',
        minWidth: 150,
        sortable: true,
        title: '医院',
      },
      // TODO: medicine add 院区
      {
        field: 'departmentName',
        minWidth: 150,
        sortable: true,
        title: '院区',
      },
      {
        field: 'deliveryPlanDate',
        minWidth: 135,
        sortable: true,
        title: '要求送达时间',
      },
      {
        field: 'warehouseName',
        minWidth: 150,
        sortable: true,
        title: '采购仓库',
      },
      {
        field: 'applyBPartnerName',
        minWidth: 150,
        sortable: true,
        title: '需求仓库',
      },
      {
        field: 'priorityRuleName',
        minWidth: 70,
        sortable: true,
        title: '优先级',
      },
      {
        field: 'totalAmt',
        minWidth: 90,
        sortable: true,
        title: '金额',
        align: 'right',
      },
      {
        field: 'lineCount',
        minWidth: 120,
        sortable: true,
        title: '采购品种数量',
        align: 'right',
      },
      {
        field: 'totalCount',
        minWidth: 90,
        sortable: true,
        title: '采购数量',
        align: 'right',
      },
      {
        field: 'sourceTypeName',
        minWidth: 95,
        sortable: true,
        title: '采购来源', // 暂无
      },
      {
        field: 'createdByName',
        minWidth: 100,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        minWidth: 100,
        sortable: true,
        title: '创建时间',
      },
      {
        field: 'commitUserName',
        minWidth: 100,
        sortable: true,
        title: '提交人',
      },
      {
        field: 'description',
        minWidth: 150,
        sortable: true,
        title: '备注',
      },
      {
        field: 'isCrossDocking',
        minWidth: 150,
        sortable: true,
        title: '是否直供',
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
        width: 180,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '计划提交时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        fieldName: 'hospitalId',
        label: '医院',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/hospitalAction/queryHospList?dataType=all',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'hospitalName',
            valueField: 'orgId',
            onChange(val: any, option: any) {
              console.warn('hospitalId', val, option);
              hospitalId.value = val;
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res?.data || [] };
            },
          };
        },
      },
      {
        fieldName: 'departmentId',
        label: '院区',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['hospitalId'],
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              warehouseIdExtraParams.value.hospitalId = hospitalId.value || '';
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['hospitalId'],
          async trigger(values) {
            console.warn('trigger values:', values);
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );
            warehouseIdExtraParams.value.hospitalId = values?.hospitalId || '';
            if (cond) {
              const departmentIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('departmentId');
              if (departmentIdRef) {
                if (values?.hospitalId) {
                  departmentIdRef.params.dependencies = {
                    hospitalId: values.hospitalId,
                  };
                  const selectOptions = await departmentIdRef.fetchApi();
                  // 选第一个不是全部的id
                  const item = selectOptions.filter(
                    (o: Record<string, any>) => !isEmpty(o?.id),
                  )?.[0];
                  ChcGridApi.formApi?.setFieldValue(
                    'departmentId',
                    item?.id || undefined,
                  );
                } else {
                  departmentIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('departmentId', undefined);
                }
              }
            }
          },
        },
      },
      {
        fieldName: 'warehouseId',
        label: '采购仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            placeholder: '请选择采购仓库',
            onChange() {
              searchController.sign();
            },
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            extraParams: warehouseIdExtraParams.value,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          async trigger(values: any) {
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );
            if (cond) {
              const warehouseIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('warehouseId');
              if (warehouseIdRef) {
                if (values?.departmentId) {
                  warehouseIdRef.params.dependencies = {
                    departmentId: values.departmentId,
                    regionId: values.departmentId,
                  };
                  await warehouseIdRef.fetchApi();
                  ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                } else {
                  warehouseIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                }
              }
            }
          },
        },
      },
      {
        fieldName: 'applyBPartnerId',
        label: '需求仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择需求仓库',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange() {
              searchController.sign();
            },
            // mode: 'multiple',
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['hospitalId'],
          async trigger(values) {
            console.warn('trigger values:', values);
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );

            if (cond) {
              const applyBPartnerIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('applyBPartnerId');
              if (applyBPartnerIdRef) {
                if (values?.hospitalId) {
                  applyBPartnerIdRef.params.dependencies = {
                    hospitalId: values.hospitalId,
                  };
                  applyBPartnerIdRef.fetchApi();
                  // const selectOptions = await applyBPartnerIdRef.fetchApi();
                  // // 选第一个不是全部的id
                  // const item = selectOptions.filter(
                  //   (o: Record<string, any>) => !isEmpty(o?.id),
                  // )?.[0];
                  ChcGridApi.formApi?.setFieldValue(
                    'applyBPartnerId',
                    undefined,
                  );
                } else {
                  applyBPartnerIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue(
                    'applyBPartnerId',
                    undefined,
                  );
                }
              }
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000369',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择采购来源',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
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
        label: '采购来源',
      },
      {
        component: 'Input',
        fieldName: 'orderPlanNo',
        label: '采购计划单号',
        componentProps: {
          placeholder: '请输入采购计划单号',
        },
      },
      {
        // TODO:medicine change 药品
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
      {
        // TODO:medicine change 医保药品编码
        component: 'Input',
        fieldName: 'insurance',
        label: '医保药品编码',
        componentProps: {
          placeholder: '请输入医保药品编码',
        },
      },
      {
        fieldName: 'vendorId',
        label: '供应商',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
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
        dependencies: {
          triggerFields: ['hospitalId'],
          async trigger(values) {
            console.warn('trigger values:', values);
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );

            if (cond) {
              const vendorIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('vendorId');
              if (vendorIdRef) {
                if (values?.hospitalId) {
                  vendorIdRef.params.dependencies = {
                    hospitalId: values.hospitalId,
                  };
                  vendorIdRef.fetchApi();
                  // const selectOptions = await vendorIdRef.fetchApi();
                  // // 选第一个不是全部的id
                  // const item = selectOptions.filter(
                  //   (o: Record<string, any>) => !isEmpty(o?.id),
                  // )?.[0];
                  ChcGridApi.formApi?.setFieldValue('vendorId', undefined);
                } else {
                  vendorIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('vendorId', undefined);
                }
              }
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择优先级',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
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
        label: '优先级',
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       // autoChooseFirstOption: true,
      //       // dictUrl: '/orderPlanAction/commit.do',
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: '请选择高值',
      //       defaultValue: '',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       // onChange(val: any, option: any) {
      //       //   extParams.value.isPrecious_text = option.label;
      //       // },
      //       showChooseAll: '',
      //       immediate: true,
      //     };
      //   },
      //   fieldName: 'isPrecious',
      //   label: '高值',
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
            placeholder: `请选择是否直供`,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isCrossDocking',
        label: '是否直供',
      },
    ],
    dataTableId: '/orderPlanAction/query.do?page=workflowApprove&orderType=PO',
    id: 'waitToCheck',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
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
      selectedAmount.value = 0;
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
      label: '采购总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
const handleEdit = (scope: any) => {
  props.goToDetailPage(
    { ...scope.row, hospitalId: hospitalId.value },
    {
      detailTitle: '审核采购计划',
      sourcePage: props.thisTab.value,
      type: 'edit',
    },
  );
};

// 审核通过处理函数
const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要审核的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '审核通过',
    content: `是否审核通过勾选的 ${selectedRows.length} 条采购计划单？`,
    onOk: async () => {
      try {
        const wfActivityIds = selectedRows.map((row: any) => row.wfActivityId);
        // const params = new URLSearchParams();
        // params.append('wfActivityId', JSON.stringify(wfActivityIds));
        const params = {
          wfActivityId: JSON.stringify(wfActivityIds),
        };
        await approveWork(params)
          .then((res) => {
            if (res && res.success) {
              // 刷新表格数据
              ChcGridApi.query();
              message.success('审核通过成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('审核通过失败');
      }
    },
  });
};

// 作废处理函数
const handleCancel = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要拒绝的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '审核不通过',
    content: `是否拒绝勾选的 ${selectedRows.length} 条采购计划单？`,
    onOk: async () => {
      try {
        const wfActivityIds = selectedRows.map((row: any) => row.wfActivityId);
        // const params = new URLSearchParams();
        // params.append('wfActivityId', JSON.stringify(wfActivityIds));
        const params = {
          wfActivityId: JSON.stringify(wfActivityIds),
        };
        await rejectWork(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('拒绝成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('拒绝失败');
      }
    },
  });
};

const handleOrderPlanClick = async (scope: any) => {
  // TODO: 增加入参 医院id hospitalId
  props.goToDetailPage(
    { ...scope.row, hospitalId: hospitalId.value },
    {
      detailTitle: '查看采购计划',
      sourcePage: props.thisTab.value,
      type: 'view',
    },
  );
};
const handleDetail = (scope: any) => {
  approveLogModalApi!
    .setData({
      processId: scope.row?.wfProcessId,
      orderPlanId: scope.row?.orderPlanId,
    })
    .open();
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

onMounted(() => {
  console.warn('urlParams');
  console.warn(userStore.userInfo);
});
</script>
<template>
  <div class="h-full">
    <ImportModal />
    <ApproveLogModal />
    <ChcGrid>
      <template #toolbar-tools>
        <!-- <span>勾选金额：{{ selectedAmount }}元</span>
        <span style="margin-left: 20px">采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleApprove"
          data-testid="button_batch_approval_waitToCheck"
        >
          审核通过
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleCancel"
          data-testid="button_cancel_waitToCheck"
        >
          审核不通过
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_waitToCheck"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #orderPlanNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`button_order_plan_no_${scope.rowIndex}_waitToCheck`"
        >
          {{ scope.row.orderPlanNo }}
        </a>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope)"
          :data-testid="`button_edit_${scope.rowIndex}_waitToCheck`"
        >
          明细审核
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          data-testid="button_detail_waitToCheck"
        >
          审批记录
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
