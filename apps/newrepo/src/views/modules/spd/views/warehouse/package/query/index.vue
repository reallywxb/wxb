<script lang="ts" setup>
import { h, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ExportActionIcon, IconfontBasicView } from '@vben/chc-icons';
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
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const router = useRouter();
const route = useRoute();

const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const hiddenField = urlParams?.hiddenField || '';
const hiddenFields = hiddenField.split(',');
console.warn('urlParams', urlParams);
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});
onMounted(() => {
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
    id: 'pacageDetailquery',
    // api地址
    queryUrl: '/packageAction/query.do',
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
        width: '180',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'insurance',
        title: '医保编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'standardCode',
        title: '贯标编码',
        width: '120',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
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
        field: 'qty',
        title: '定数',
        width: '80',
        align: 'right',
        sortable: true,
      },
      {
        field: 'costPrice',
        title: '价格',
        width: '80',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => {
          return handlePriceToFixedTwo(cellValue);
        },
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
        width: '160',
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
        width: '100',
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
        field: 'certificateNo',
        title: '批准文号',
        width: '180',
        sortable: true,
      },
      {
        field: 'serNo',
        title: '厂家码',
        visible: !hiddenField.includes('serNo'),
        width: '300',
        sortable: true,
      },
      {
        field: 'serialNo',
        title: '流水码',
        width: '100',
        sortable: true,
      },
      {
        field: 'parentPackageNo',
        title: '父包装',
        width: '150',
        sortable: true,
      },
      {
        field: 'storageConditionName',
        title: '存储条件',
        width: '110',
        sortable: true,
      },
      {
        field: 'receiveTime',
        title: '操作时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'printeNum',
        title: '打印次数',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        width: '180',
        sortable: true,
      },
      {
        field: 'isPicked',
        title: '拣货中',
        width: 80,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'pickListNo',
        title: '拣货单号',
        width: '90',
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '订单号',
        width: '90',
        sortable: true,
      },
      {
        field: 'action',
        fixed: 'right',
        title: '操作',
        width: 150,
        align: 'center',
        slots: {
          default: (scope) => {
            return h(
              Button,
              {
                type: 'primary',
                ghost: true,
                class: 'h-[24px] pb-0 pl-[6px] pr-[6px] pt-0 text-[14px]',
                onClick: () => {
                  console.warn('单元格点击', scope);
                  router.push({
                    path: '/warehouse/package/logQuery',
                    query: {
                      autoLoad: 'Y',
                      packageNo: scope.row.packageNo,
                      isReload: 'Y',
                    },
                  });
                },
                'data-testid': `button_package_log_${scope.rowIndex}`,
              },
              {
                default: () => '包装追溯',
                icon: () => h(IconfontBasicView),
              },
            );
          },
        },
      },
    ],
    // 表单配置
    formSchema: [
      {
        // TODO：动态显隐
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        disabled: hiddenFields.includes('packageNo'),
      },
      {
        // TODO：动态显隐
        component: 'Input',
        fieldName: 'serNo',
        label: '厂家码',
        disabled: hiddenFields.includes('serNo'),
      },
      {
        // TODO：动态显隐
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        disabled: hiddenFields.includes('warehouseId'),
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
            defaultValue: '',
            autoChooseFirstOption: true,
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
        defaultValue: route.query.unitPackQty || '',
      },
      {
        component: 'Input',
        fieldName: 'locatorValue',
        label: '货位',
        defaultValue: route.query.locatorValue || '',
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
            defaultValue: '',
            // autoChooseFirstOption: true,
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
            defaultValue: '',
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
        fieldName: 'storageStatus',
        label: '库存状态',
        defaultValue: route.query?.storageStatus || 'S',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
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
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '操作时间',
      },
      {
        component: 'InputNumber',
        fieldName: 'recievedDays',
        label: '入库天数',
      },
      {
        // TODO：动态显隐
        component: 'ChcSelect',
        fieldName: 'isPrecious',
        label: '高值',
        disabled: hiddenFields.includes('isPrecious'),
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
        component: 'ChcSelect',
        fieldName: 'isPrinted',
        label: '已打印',
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
        // TODO：动态显隐
        component: 'ChcSelect',
        fieldName: 'isPicking',
        label: '拣货中',
        disabled: hiddenFields.includes('isPicking'),
        defaultValue: route.query?.isPicking || '',
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
const handlePrint = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  console.warn('handlePrint rows:', rows);
  if (rows.length <= 0) {
    message.warning('请选择一条记录');
    return;
  }
  const paramLine = rows.map((o: any) => o.packageId);
  console.warn('handlePrint paramLine:', paramLine);
  try {
    const res = await requestFormClient.post(
      '/packageAction/checkPrintPackageDoc.do',
      {
        isCheckPrinted: 'Y',
        id: JSON.stringify(paramLine),
      },
    );
    console.warn('handlePrint res:', res);
    if (res.success) {
      Modal.confirm({
        title: '打印提示',
        content: `确认批量打印${paramLine.length}张标签吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          globalPrintStore.print({
            pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${paramLine.join(',')}`,
          });
        },
        onCancel() {},
      });
    }
  } catch (error) {
    console.error(error);
    if (error?.success === false && error?.msg === '单据已打印，不可重复打印') {
      Modal.confirm({
        title: '打印提示',
        content: `确认批量重复打印${paramLine.length}张标签吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          globalPrintStore.print({
            pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${paramLine.join(',')}`,
          });
        },
        onCancel() {},
      });
    }
  }
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handlePrint"
          class="mr-[0.5rem]"
          data-testid="button_print"
        >
          打印标签
        </Button>
        <!-- TODO: rfid 旧代码未发现功能 -->
        <!-- <Button type="primary" class="mr-[0.5rem]"> rfid </Button> -->

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
