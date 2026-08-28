<script setup lang="ts">
import { nextTick, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
// import { usePreferences } from '@vben/preferences';

import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import { isEmpty } from '@vben/utils';
import { ChcSelect } from '@vben/chc-ui';

import { commonFormOptions, viewFormOptions } from './options';

const hospitalId = ref(null);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});

const extParams = ref<{
  commitStatus?: string;
}>({ commitStatus: 'CO' });
const totalAmount = ref(0);
const totalType = ref(1); // 默认值为1
const isFirstLoaded = ref(false);
// 仓库联动额外参数
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});
// 包含所有columns项的数组
const commonGridColumns = [
  { title: '序号', type: 'seq' as const, width: 50, align: 'center' as const },
  {
    field: 'applyBPartnerName',
    minWidth: 110,
    sortable: true,
    title: '需求库房',
    formatter: (params: any) => {
      return params.row.applyBPartnerName || '';
    },
  },
  {
    // TODO:medicine change 药品编码
    field: 'productCode',
    minWidth: 110,
    sortable: true,
    title: '药品编码',
  },
  {
    // TODO:medicine change 药品名称
    field: 'productName',
    minWidth: 110,
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
    field: 'hospitalName',
    minWidth: 150,
    sortable: true,
    title: '需求医院',
  },
  {
    field: 'manufacturer',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'uomName',
    minWidth: 90,
    sortable: true,
    title: '单位',
  },
  {
    // TODO:medicine add 最小单位
    field: 'minUom',
    minWidth: 120,
    sortable: true,
    title: '最小单位',
  },
  {
    field: 'totalQtyPlaned',
    minWidth: 90,
    sortable: true,
    title: '数量',
    align: 'right' as const,
  },
  {
    // TODO:medicine add 采购单价
    field: 'price',
    minWidth: 100,
    sortable: true,
    title: '采购单价',
    align: 'right' as const,
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.price);
    },
  },
  // {
  //   field: 'price',
  //   minWidth: 100,
  //   sortable: true,
  //   title: '采购价',
  //   align: 'right' as const,
  //   formatter({ row }: any) {
  //     return handlePriceToFixedTwo(row.price);
  //   },
  // },
  {
    field: 'totalOrderAmount',
    minWidth: 90,
    sortable: true,
    title: '金额',
    align: 'right' as const,
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.totalOrderAmount);
    },
  },
  {
    field: 'vendorname',
    minWidth: 100,
    sortable: true,
    title: '供应商',
  },
  {
    // TODO:medicine change 医保药品编码
    field: 'insurance',
    minWidth: 130,
    sortable: true,
    title: '医保药品编码',
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
];
// 根据不同业务需求，从总columns内筛选需要的
const getColumns = (type = 1) => {
  return type === 1
    ? commonGridColumns.filter((item) => {
        return item.field !== 'applyBPartnerName';
      })
    : commonGridColumns;
};

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        // ['dateOrdered', ['dateApprovalFrom', 'dateApprovalTo'], 'YYYY-MM-DD'],
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
        if (totalType.value === 2) {
          ChcGridApi.setGridOptions({
            columns: getColumns(2),
          });
        } else {
          ChcGridApi.setGridOptions({
            columns: getColumns(1),
          });
        }
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
        ChcGridApi.formApi.setValues({
          totalType: 1,
        });
        // const formValues = await ChcGridApi.formApi.getValues();
        // ChcGridApi.formApi.setLatestSubmissionValues(formValues);
        // ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: {
        // highlight: true,
      },
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    gridColumns: getColumns(1),
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            options: [
              // TODO:medicine change
              { value: 1, label: '按药品汇总' },
              { value: 2, label: '按药品+需求库房汇总' },
            ],
            placeholder: '请选择查询维度',
            paginate: false,
            filterByFrontEnd: true,
            onChange(val: any) {
              totalType.value = val; // 更新查询维度值
            },
            immediate: true,
          };
        },
        fieldName: 'totalType',
        label: '查询维度',
      },
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
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
            placeholder: '请选择采购仓库',
            extraParams: warehouseIdExtraParams.value,
            onChange() {
              searchController.sign();
            },
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
        // defaultValue: 1_000_007,
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
            onChange() {
              searchController.sign();
            },
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
            defaultValue: '',
            dictUrl: '/baseHandleAction/refList.do?id=1000369',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择采购来源',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.sourceType_text = option.name;
            // },
            // mode: 'multiple',
            showChooseAll: '',
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
            placeholder: '请选择审核结果',
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
        label: '审核结果',
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
            onChange() {
              searchController.sign();
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
            // autoChooseFirstOption: true,
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择赠品',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isGift',
        label: '赠品',
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
    // showExportBtn: true,
    dataTableId: '/orderPlanAction/totalDetail.do',
    id: 'summaryQuery',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      // totalAmount.value = params.totalPrice || 0;
      let amout = 0;
      params.rows?.forEach((item: any) => {
        if (item.totalOrderAmount) {
          amout += Number.parseFloat(item.totalOrderAmount);
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
    // customModals: {
    //   'AddNewModal-addNewModalApi': {
    //     class: 'w-[800px]',
    //     closable: true,
    //     // 连接抽离的组件
    //     connectedComponent: CustomModal,
    //     draggable: true,
    //   },
    // },
  },
);
// const handleView = () => {
//   headerTabs.value[3]!.disabled = false;
//   currentTab.value = 3;
// };

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
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #toolbar-actions>
        <!-- <Button type="primary" @click="handleView" class="mr-[0.5rem]">
          汇总查询
        </Button> -->
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_summaryQuery"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span>采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
