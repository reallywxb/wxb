<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';

import { ExportActionIcon, viewActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';
import { isEmpty } from '@vben/utils';
import { ChcSelect } from '@vben/chc-ui';

import ImportModalComp from './importModal.vue';
import actionLogModal from './modals/actionLogModal.vue';
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
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

// const searchController = new LazySearch(2, async () => {
//   await nextTick();
//   ChcGridApi.formApi.getValues().then((res: any) => {
//     ChcGridApi.query({ ...res });
//     isFirstLoaded.value = true;
//   });
// });

const extParams = ref<{
  commitStatus?: string;
  // bpartnerId_text?: string;
  page?: string;
  returnDoc?: string;
}>({
  commitStatus: 'CO',
  returnDoc: 'N',
  page: 'input',
});
const totalAmount = ref(0);
const hospitalId = ref(null);
const currentTab = defineModel<number>('currentTab', { required: true });
// const isFirstLoaded = ref(false);
// 仓库联动额外参数
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});
const [ChcGrid, ChcGridApi, { handleExport, ImportModal }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
        ['dateApproval', ['dateApprovalFrom', 'dateApprovalTo'], 'YYYY-MM-DD'],
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
    // formOptions: {
    //   fieldMappingTime: [
    //     ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
    //     [
    //       'dateApproval',
    //       ['dateApprovalFrom', 'dateApprovalTo'],
    //       'YYYY-MM-DD',
    //     ],
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
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      // {
      //   field: 'status',
      //   minWidth: 90,
      //   sortable: false,
      //   title: '状态',
      //   // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      // },
      {
        field: 'orderPlanNo',
        minWidth: 120,
        sortable: true,
        title: '采购计划单号',
        slots: { default: 'orderPlanNo' },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '采购订单单号',
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        // TODO:medicine change 药品编码
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
      },
      {
        // TODO:medicine change 药品名称
        field: 'productName',
        minWidth: 100,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 90,
        sortable: true,
        title: '规格',
      },
      // {
      //   field: 'modelNo',
      //   minWidth: 90,
      //   sortable: true,
      //   title: '型号',
      // },
      {
        field: 'uomName',
        minWidth: 90,
        sortable: true,
        title: '单位',
      },
      {
        // TODO:medicine add 最小单位
        field: 'minUnit',
        minWidth: 100,
        sortable: true,
        title: '最小单位',
        align: 'right',
      },
      {
        field: 'qtyPlaned',
        minWidth: 100,
        sortable: true,
        title: '采购数量',
        align: 'right',
      },
      {
        field: 'price',
        minWidth: 100,
        sortable: true,
        title: '采购单价',
        align: 'right',
      },
      {
        field: 'lineAmt',
        minWidth: 90,
        sortable: true,
        title: '金额',
        align: 'right',
      },
      {
        field: 'hospitalName',
        minWidth: 150,
        sortable: true,
        title: '需求医院',
      },
      {
        field: 'vendorName',
        minWidth: 100,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'manufacturer',
        minWidth: 110,
        sortable: true,
        title: '生产厂家',
      },
      {
        field: 'lPackageQty',
        minWidth: 110,
        sortable: true,
        align: 'right',
        title: '大包装数',
      },
      {
        field: 'mPackageQty',
        minWidth: 110,
        sortable: true,
        align: 'right',
        title: '中包装数',
      },
      {
        field: 'qtyOnHand',
        minWidth: 160,
        sortable: true,
        align: 'right',
        title: '需求库房库存数量',
      },
      {
        field: 'insurance',
        minWidth: 120,
        sortable: true,
        title: '医保药品编码',
      },
      {
        field: 'allWarehouseLevelDay',
        minWidth: 130,
        sortable: true,
        align: 'right',
        title: '全院日均消耗',
      },
      {
        field: 'parentLevelMax',
        minWidth: 130,
        sortable: true,
        align: 'right',
        title: '中心库库存上限',
      },
      {
        field: 'parentLevelMin',
        minWidth: 130,
        sortable: true,
        align: 'right',
        title: '中心库库存下限',
      },
      {
        field: 'levelDay',
        minWidth: 140,
        sortable: true,
        align: 'right',
        title: '需求库房日均消耗',
      },
      {
        field: 'levelMax',
        minWidth: 140,
        sortable: true,
        align: 'right',
        title: '需求库房库存上限',
      },
      {
        field: 'levelMin',
        minWidth: 140,
        sortable: true,
        align: 'right',
        title: '需求库房库存下限',
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
        width: 100,
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
      {
        component: 'DateGroup',
        fieldName: 'dateApproval',
        label: '计划审核时间',
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
            onChange(val: any) {
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
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000369',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择采购来源',
            paginate: false,
            // allowClear: true,
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
        fieldName: 'sourceType', // 暂无字段
        label: '采购来源',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=1000648',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择审核状态',
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
        fieldName: 'approvalStatus',
        label: '审核状态',
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
        fieldName: 'insurance', // 暂无字段
        label: '医保药品编码',
        componentProps: {
          placeholder: '请输入医保药品编码',
        },
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'Y', label: '是' },
      //         { value: 'N', label: '否' },
      //       ],
      //       placeholder: '请选择高值',
      //       defaultValue: '',
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
              const bpartnerIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('bpartnerId');
              if (bpartnerIdRef) {
                if (values?.hospitalId) {
                  bpartnerIdRef.params.dependencies = {
                    hospitalId: values.hospitalId,
                  };
                  bpartnerIdRef.fetchApi();
                  ChcGridApi.formApi?.setFieldValue('bpartnerId', undefined);
                } else {
                  bpartnerIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('bpartnerId', undefined);
                }
              }
            }
          },
        },
        fieldName: 'bpartnerId',
        label: '供应商',
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
      //       onChange(val: any, option: any) {
      //         extParams.value.isPrecious_text = option.label;
      //       },
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
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=319',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择活跃状态',
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
        fieldName: 'isActive',
        label: '活跃状态',
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
    dataTableId: '/orderPlanAction/queryLine.do?page=woInput&specShowType=from',
    id: 'detaileQ',
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
    customModals: {
      'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: ImportModalComp,
      }),
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
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      // replenishSource: 'P',
      // handleBatchChoose,
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
  <div class="h-full">
    <ActionLogModal />
    <ImportModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_detailQuery"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span style="margin-left: 20px">采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #orderPlanNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`link_order_plan_no_${scope.rowIndex}_detailQuery`"
        >
          {{ scope.row.orderPlanNo }}
        </a>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          :data-testid="`button_action_record_${scope.rowIndex}_detailQuery`"
        >
          操作记录
          <template #icon>
            <viewActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
