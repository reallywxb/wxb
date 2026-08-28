<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { usePreferences } from '@vben/preferences';

import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';
import { isEmpty } from '@vben/utils';
import { ChcSelect } from '@vben/chc-ui';

import approveLogModal from './modals/approveLogModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

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
// const globalPrintStore = useGlobalPrintStore();

const { contentIsMaximize } = usePreferences();
const [ApproveLogModal, approveLogModalApi] = useVbenModal({
  connectedComponent: approveLogModal,
});

const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  page?: string;
  returnDoc?: string;
}>({
  commitStatus: 'CO',
  approvalStatus: 'CO',
  returnDoc: 'N',
  page: 'input',
});
const totalAmount = ref(0);
const hospitalId = ref(null);
const currentTab = defineModel<number>('currentTab', { required: true });
// 仓库联动额外参数
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
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
      },
      handleReset: async () => {
        await ChcGridApi.formApi.resetForm();
        // const formValues = await ChcGridApi.formApi.getValues();
        // ChcGridApi.formApi.setLatestSubmissionValues(formValues);
        // ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orderPlanNo',
        minWidth: 120,
        sortable: true,
        title: '采购计划单号',
        slots: { default: 'orderPlanNo' },
      },
      {
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '采购订单号',
      },
      {
        field: 'approveTime',
        minWidth: 140,
        sortable: true,
        title: '采购计划审核时间',
      },
      {
        field: 'deliveryPlanDate',
        minWidth: 135,
        sortable: true,
        title: '要求送达时间',
      },
      // TODO:medicine add 医院
      {
        field: 'hospitalName',
        minWidth: 150,
        sortable: true,
        title: '需求医院',
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
        title: '采购来源',
      },
      {
        field: 'createdByName',
        minWidth: 100,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        minWidth: 135,
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
        field: 'commitTime',
        minWidth: 100,
        sortable: true,
        title: '提交时间',
      },
      {
        field: 'approveUserName',
        minWidth: 100,
        sortable: true,
        title: '审核人',
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
        width: 150,
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
      },
      // TODO:medicine add 医院
      {
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
        fieldName: 'hospitalId',
        label: '医院',
      },
      // TODO:medicine add 院区
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
              console.warn('departmentId', val, option);
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            extraParams: warehouseIdExtraParams.value,
            placeholder: '请选择采购仓库',
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
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
        fieldName: 'warehouseId',
        label: '采购仓库',
      },
      {
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
            filterByFrontEnd: true,
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
        fieldName: 'applyBPartnerId',
        label: '需求仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000369',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择采购来源',
            paginate: false,
            defaultValue: '',
            filterByFrontEnd: true,
            showChooseAll: '',
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
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
      {
        component: 'Input',
        fieldName: 'insurance',
        label: '医保药品编码',
        componentProps: {
          placeholder: '请输入医保药品编码',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
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
                  ChcGridApi.formApi?.setFieldValue('vendorId', undefined);
                } else {
                  vendorIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('vendorId', undefined);
                }
              }
            }
          },
        },
        fieldName: 'vendorId',
        label: '供应商',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择优先级',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
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
      //       defaultValue: '',
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: '请选择高值',
      //       paginate: false,
      //       filterByFrontEnd: true,
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
    dataTableId: '/orderPlanAction/queryByPlan',
    id: 'hasCheck',
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
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '采购总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

const handleOrderPlanClick = (scope: any) => {
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
</script>
<template>
  <div
    :style="{
      height: contentIsMaximize ? 'calc(100vh - 38px)' : 'calc(100vh - 158px)',
      overflowY: 'hidden',
    }"
  >
    <ApproveLogModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_hasCheck"
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
          :data-testid="`link_order_plan_no_${scope.rowIndex}_hasCheck`"
        >
          {{ scope.row.orderPlanNo }}
        </a>
      </template>
      <template #toolbar-tools>
        <!-- <span>采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #action="scope">
        <!--          -->
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          :data-testid="`button_approval_record_${scope.rowIndex}_hasCheck`"
        >
          审批记录
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
