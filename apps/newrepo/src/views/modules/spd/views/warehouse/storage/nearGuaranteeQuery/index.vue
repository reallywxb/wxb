<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const userStore = useUserStore();
// const route = useRoute();

const isFirstLoaded = ref(false); // 是否已初次加载完
// const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query({ ...formValues });
});
const summaryData = ref<Record<string, any>>({});
const extraParams = ref<Record<string, any>>({});
const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
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
      cellStyle: ({ row }: { row: any }) => {
        if (row.leaveDays < 90) {
          return { color: 'red' };
        } else if (row.leaveDays <= 180 && row.leaveDays >= 90) {
          return { color: '#8552a1' };
        } else return '';
      },
    }),
  },
  {
    id: 'nearGuaranteeQuery',
    // api地址
    queryUrl: 'storageAction/queryStorageLot.do?showPrice=Y&readWrite=Y',
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
        width: '250',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '150',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '160',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '60',
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
        width: '100',
        sortable: true,
      },
      {
        field: 'leaveDays',
        title: '剩余天数',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'maintainDays',
        title: '维持天数',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '200',
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        title: '数量',
        width: '60',
        align: 'right',
        sortable: true,
      },
      {
        field: 'price',
        title: '采购价',
        width: '80',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '金额',
        width: '70',
        align: 'right',
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
        width: '150',
        sortable: true,
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
    // 表单配置
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: `请选择院区`,
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseIds',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            mode: 'multiple',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                chcGridApi?.formApi?.getFieldComponentRef &&
                typeof chcGridApi?.formApi?.getFieldComponentRef ===
                  'function' &&
                chcGridApi?.formApi?.getFieldComponentRef('warehouseIds') &&
                chcGridApi?.formApi?.getFieldComponentRef('warehouseIds').params;
              if (cond) {
                chcGridApi.formApi.getFieldComponentRef(
                  'warehouseIds',
                ).params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                chcGridApi?.formApi?.setFieldValue('warehouseIds', []);
                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  chcGridApi?.formApi
                    ?.getFieldComponentRef('warehouseIds')
                    ?.fetchApi();
                }, 100);
              }
            });
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productControlLevel',
        label: '药品组',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/productAction/productControlLevelList.do',
            placeholder: ``,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productCategoryId',
        label: '药品类别',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/productCategoryList.do',
            placeholder: ``,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: ``,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'InputNumber',
        fieldName: 'neerGuaranteeDays',
        label: '效期剩余天数',
        defaultValue: 180,
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {
      ...extraParams.value,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      console.warn('beforeFetchFn:', params);
      if (isEmpty(params?.neerGuaranteeDays)) {
        params.neerGuaranteeDays = 180;
      }
      return {
        ...params,
        warehouseId: params.warehouseId?.length ? params.warehouseId.join(',') : undefined,
      }
        ;
    },
    afterFetchFn: (params) => {
      console.warn('getTableArrDataFn:', params);
      let lineAmt = 0;
      params.rows.forEach((item: any) => {
        lineAmt += Math.round((item.lineAmt || 0) * 1000);
      });
      // 保留3位小数
      summaryData.value.lineAmt = Math.round(lineAmt) / 1000;
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
      label: '金额汇总',
      value: summaryData.value.lineAmt,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
const generateNotice = (row: any) => {
  Modal.confirm({
    title: '提示',
    content: '确认生成公告吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await requestFormClient.post('/storageAction/saveNearGuaranteeNotice', {
          productName: row.productName,
          productSpec: row.productSpec,
          modelNo: row.modelNo,
          lot: row.lot,
          guaranteeDate: row.guaranteeDate,
          qtyOnHand: row.qtyOnHand,
          warehouseName: row.warehouseName,
        });
        message.success('生成成功');
        const formValues = chcGridApi?.formApi?.getValues();
        chcGridApi.query({
          ...formValues,
        });
      } catch (error) {
        console.error('生成公告失败', error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span>金额汇总：{{ summaryData.lineAmt }}</span> -->
        <Summarize
          ref="summarizeRef"
          :calculate-summarize="calculateSummarize"
        />
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          :loading="scope.row?.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="generateNotice(scope.row)"
          :data-testid="`button_generateNotice_${scope.rowIndex}`"
        >
          生成公告
        </Button>
      </template>
    </ChcGrid>
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
