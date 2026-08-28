<script lang="ts" setup>
import { h, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ExportActionIcon, IconfontBasicView } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
const router = useRouter();
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
  if (urlParams?.autoLoad === 'Y') {
    searchController.sign();
  }
});
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};
// const locatorIdRef = useTemplateRef('locatorIdRef');
// const locatorOptions = ref<
//   {
//     id: number | string;
//     name: string;
//   }[]
// >([]);
// const getLocatorOptions = () => {
//   requestFormClient
//     .post('/warehouseAction/locatorList.do')
//     .then((res) => {
//       locatorOptions.value = res.data || [];
//     })
//     .catch((error) => {
//       message.error(error.message);
//       locatorOptions.value = [];
//     });
//   return [];
// };

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
    id: 'serNoQuery',
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
        field: 'serNo',
        title: '厂家码',
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
        field: 'qtyText',
        title: '数量',
        width: '80',
        sortable: true,
      },
      {
        field: 'price',
        title: '价格',
        width: '80',
        align: 'right',
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
        field: 'warehouseName',
        title: '仓库',
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
        field: 'created',
        title: '创建时间',
        width: '180',
        sortable: true,
      },
      {
        field: 'action',
        fixed: 'right',
        title: '操作',
        width: 200,
        align: 'center',
        slots: {
          default: (scope) => {
            return [
              h(
                Button,
                {
                  type: 'primary',
                  ghost: true,
                  class:
                    'h-[24px] pb-0 pl-[6px] pr-[6px] pt-0 text-[14px] mr-[6px]',
                  onClick: () => {
                    console.warn('单元格点击', scope);
                    handlePrintByRow(scope.row);
                  },
                  'data-testid': `button_print_tag_${scope.rowIndex}`,
                },
                {
                  default: () => '打印标签',
                  // icon: () => h(IconfontBasicView),
                },
              ),
              h(
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
                  'data-testid': `button_package_detail_${scope.rowIndex}`,
                },
                {
                  default: () => '包装明细',
                  icon: () => h(IconfontBasicView),
                },
              ),
            ];
          },
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
            autoChooseFirstOption: true,
            // onChange(value: any) {
            //   console.warn('onChange warehouseId', value);
            //   // getLocatorOptions();
            // },
            afterFetch(res: any) {
              nextTick(() => {
                const c = isFieldComponentRefExist('locatorId');
                console.warn(
                  'warehouseId isFieldComponentRefExist locatorId',
                  c,
                );
                if (c) {
                  const c = isFieldComponentRefExist('locatorId');
                  console.warn('locatorId isFieldComponentRefExist', c);
                  const warehouseId = res.rows[0] ? res.rows[0].id : '';
                  if (c) {
                    const refInst = ChcGridApi.formApi.getFieldComponentRef(
                      'locatorId',
                    ) as unknown as SelectComponentRef;
                    console.warn('locatorId refInst', refInst);
                    if (refInst && refInst.params) {
                      const dictUrl =
                        route.query.locatorId ||
                        warehouseId ||
                        route.query?.warehouseId
                          ? `/warehouseAction/locatorList.do?warehouseId=${
                              warehouseId || route.query?.warehouseId
                            }`
                          : `/warehouseAction/locatorList.do?validation=${encodeURIComponent('1=2')}`;
                      console.warn('locatorId dictUrl', dictUrl);
                      refInst.params.dictUrl = dictUrl;
                      if (typeof refInst?.fetchApi === 'function') {
                        refInst.fetchApi();
                      }
                      ChcGridApi.formApi.setFieldValue('locatorId', '');
                    }
                  }
                }
              });
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
        // component: 'Input',
        component: 'ChcSelect',
        fieldName: 'locatorId',
        label: '货位',
        defaultValue: route.query?.locatorId
          ? Number.parseFloat(route.query.locatorId as string)
          : '',
        componentProps: () => {
          return {
            // dictUrl: route.query?.locatorId
            //   ? `/warehouseAction/locatorList.do?warehouseId=${
            //       route.query?.warehouseId
            //     }`
            //   : '/warehouseAction/locatorList.do?validation=1=2',
            placeholder: '请选择货位',
            paginate: false,
            showChooseAll: '',
            // immediate: true,
            labelField: 'name',
            valueField: 'id',
            // apiType: 'post',
            // requestContentType: 'application/x-www-form-urlencoded',
            // triggerFields: ['warehouseId'],
            afterFetch(res: any) {
              ChcGridApi?.formApi?.setFieldValue('locatorId', undefined);
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
          triggerFields: ['warehouseId'],
          trigger(values: any) {
            console.warn('locatorId values', values);
            nextTick(() => {
              const c = isFieldComponentRefExist('locatorId');
              console.warn('locatorId isFieldComponentRefExist', c);
              if (c) {
                const refInst = ChcGridApi.formApi.getFieldComponentRef(
                  'locatorId',
                ) as unknown as SelectComponentRef;
                console.warn('locatorId refInst', refInst);
                if (refInst && refInst.params) {
                  const dictUrl =
                    values?.locatorId || values?.warehouseId
                      ? `/warehouseAction/locatorList.do?warehouseId=${
                          values?.warehouseId
                        }`
                      : `/warehouseAction/locatorList.do?validation=${encodeURIComponent('1=2')}`;
                  console.warn('locatorId dictUrl', dictUrl);
                  refInst.params.dictUrl = dictUrl;
                  if (typeof refInst?.fetchApi === 'function') {
                    console.warn(7777);
                    refInst.fetchApi();
                  }
                  ChcGridApi.formApi.setFieldValue('locatorId', '');
                }
              }
            });
          },
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
            defaultValue: '',
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
      // TODO:medicine cencel 定数
      // {
      //   component: 'InputNumber',
      //   fieldName: 'unitPackQty',
      //   label: '定数规格',
      //   defaultValue: route.query.unitPackQty || '',
      //   componentProps: () => {
      //     return {
      //       placeholder: '定数规格',
      //     };
      //   },
      // },
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
        fieldName: 'isPrecious',
        label: '高值',
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
        label: '操作时间',
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

const handlePrintByRow = (row: any) => {
  globalPrintStore.print({
    pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${row.packageId}`,
  });
};
const handlePrint = () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  console.warn('handlePrint rows:', rows);
  if (rows.length <= 0) {
    message.warning('请选择一条记录');
    return;
  }
  const paramLine = rows.map((o: any) => o.packageId);
  console.warn('handlePrint paramLine:', paramLine);
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
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid>
      <!-- <template #locatorId="scope">
        <ChcSelect
          ref="locatorIdRef"
          v-model="scope.row.locatorId"
          class="w-full"
          dict-url="/warehouseAction/locatorList.do"
          placeholder="请选择"
          :paginate="false"
          :show-search="false"
          :extra-params="{}"
          :immediate="false"
          label-field="name"
          value-field="id"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            }
          "
          :options="locatorOptions"
        />
      </template> -->
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handlePrint"
          class="mr-[0.5rem]"
          data-testid="button_print"
        >
          打印标签
        </Button>
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
