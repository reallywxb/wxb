<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, UploadCloudIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
const route = useRoute();

const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const searchController = new LazySearch(1, async () => {
  await nextTick();
  // 获取url参数
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  if (urlParams?.autoLoad === 'Y' || route.query?.autoLoad === 'Y') {
    searchController.sign();
  }
});
const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
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
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'batchMerge',
    // api地址
    queryUrl: '/packageAction/query.do?isPicking=N',
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
        title: '多选',
      },
      {
        type: 'seq',
        width: 50,
        align: 'center',
        title: '序号',
      },

      {
        field: 'packageNo',
        title: '包装号',
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
        width: '150',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: true,
      },
      {
        field: 'qtyText',
        title: '数量',
        width: '80',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
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
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'packageStatusName',
        title: '包装状态',
        width: '110',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '操作人',
        width: '110',
        sortable: true,
      },
      {
        field: 'created',
        title: '操作时间',
        width: '180',
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
        width: '110',
        sortable: true,
      },
      {
        field: 'moveInTime',
        title: '入库时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'isSplitPick',
        title: '拣货拆零',
        width: 80,

        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        defaultValue: route.query?.warehouseId
          ? Number.parseFloat(route.query.warehouseId as string)
          : '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows.map((item: any) => {
                  return {
                    ...item,
                    id: Number.parseFloat(item.id),
                  };
                }),
              };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            console.warn(values);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'vendor',
        label: '供应商编码',
        componentProps: () => {
          return {
            placeholder: '编码/名称/搜索码',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        defaultValue: route.query?.vendorId
          ? Number.parseFloat(route.query.vendorId as string)
          : '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows.map((item: any) => {
                  return {
                    ...item,
                    id: Number.parseFloat(item.id),
                  };
                }),
              };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: route.query.productName || '',
        componentProps: () => {
          return {
            placeholder: '编码/拼音码/名称',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        defaultValue: route.query.lot || '',
      },
      {
        component: 'InputNumber',
        fieldName: 'unitPackQty',
        label: '定数规格',
        defaultValue: route.query?.unitPackQty || '',
        componentProps: () => {
          return {
            placeholder: '定数规格',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'packageStatus',
        label: '包装状态',
        defaultValue: route.query?.packageStatus || 'S',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000466',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isSplitPick',
        label: '拣货拆零',
        defaultValue: '',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '加工时间',
      },
      {
        component: 'InputNumber',
        fieldName: 'recievedDays',
        label: '入库天数',
        defaultValue: 10,
        componentProps: () => {
          return {
            placeholder: '入库时间显示天数',
          };
        },
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
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
const handleSubmit = () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  if (rows.length <= 0) {
    message.warning('请选择一条记录');
    return;
  }
  const paramLine = rows.map((o: any) => ({
    packageNo: o.packageNo,
  }));
  Modal.confirm({
    title: '提醒',
    content: '确认并包吗?',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await requestFormClient.post('/packageAction/merge.do', {
          data: JSON.stringify({ line: paramLine }),
        });
        console.warn('handleSubmit res', res);
        globalPrintStore.print({
          pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${res.data}`,
        });
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
    onCancel() {},
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
        <Button
          type="primary"
          @click="handleSubmit"
          class="mr-[0.5rem]"
          data-testid="button_submit"
        >
          提 交
          <template #icon>
            <UploadCloudIcon />
          </template>
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

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
