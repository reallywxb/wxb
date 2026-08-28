<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { dataCommit, deleteLine, modifyLine, saveDo } from './api';

const currentTab = defineModel<number>('currentTab', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});

const route = useRoute();
const userStore: any = useUserStore();

const urlParamsObj: any = route.meta?.urlParams;
const urlParams: any = {
  productControlLevel: urlParamsObj?.productControlLevel || '',
  isProductControlLevel: urlParamsObj?.isProductControlLevel
    ? urlParamsObj?.isProductControlLevel === 'Y'
    : userStore.userInfo.isProductControlLevel,
  module: urlParamsObj?.m === null ? '' : urlParamsObj?.m,
};
// console.log(urlParams, 'urlParams');

const warehouseIdUrl = ref('');
const toWarehouseIdUrl = ref('');
if (urlParams.module === 'w1') {
  // 允许一级库向其他所有类型仓库调拨
  warehouseIdUrl.value = `/baseHandleAction/warehouse.do?level1=Y&readWrite=Y`;
  toWarehouseIdUrl.value = '/baseHandleAction/warehouse.do?accessAll=Y';
} else if (urlParams.module === 'w2') {
  // 允许除了一级库之外的所有类型仓库调拨
  warehouseIdUrl.value = `/baseHandleAction/warehouse.do?level1=N&readWrite=Y`;
  toWarehouseIdUrl.value =
    '/baseHandleAction/warehouse.do?level1=N&?accessAll=Y';
} else {
  // 默认允许平级调拨
  warehouseIdUrl.value = `/baseHandleAction/warehouse.do?readWrite=Y`;
  toWarehouseIdUrl.value = '/baseHandleAction/warehouse.do?accessAll=Y';
}

const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const toWarehouseParams = ref<any>({});
const extParams = ref<any>({
  isPicking: 'N',
  packageStatus: 'S',
});
const departmentId = ref<number | string>('');
const warehouseId = ref<number | string>('');
const productControlParams = ref({
  productControlLevel: urlParams.productControlLevel,
  warehouseId: '',
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      // keepSource: true,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      checkboxConfig: {
        highlight: true,
      },
      editConfig: {
        enabled: detailInfo.value?.type === 'edit',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      pagerConfig: {
        // enabled: true,
      },
    }),

    gridEvents: {
      checkBoxChange: ({ row }: { row: any }) => {
        if (!row.qtyApply) {
          message.warn('请输入申请数量');
          ChcGridApi.grid.clearCheckboxRow(row);
        }
      },
    },
  },
  {
    id: 'documentDetailTable',
    queryUrl: '/packageAction/query.do',
    gridColumns: [
      {
        type: 'checkbox',
        title: '',
        width: 40,
        align: 'center',
        fixed: 'left',
      },
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'packageNo',
        title: '包装号',
        minWidth: '170',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },

      { field: 'productSpec', title: '规格', minWidth: '200', sortable: true },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '150',
        sortable: true,
        visible: false,
      },
      { field: 'manufacturer', title: '厂家', minWidth: '150', sortable: true },
      { field: 'uomName', title: '单位', minWidth: '72', sortable: true },
      {
        field: 'qty',
        title: '数量',
        minWidth: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'price',
        title: '进价',
        minWidth: '80',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
        align: 'right',
      },
      { field: 'lot', title: '批号', minWidth: '100' },
      { field: 'guaranteeDate', title: '效期', minWidth: '100' },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '80',
      },

      { field: 'locatorName', title: '货位', minWidth: '120', sortable: true },
      {
        field: 'storageStatusName',
        title: '库存状态',
        minWidth: '120',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择院区',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            onChange(val: any) {
              departmentId.value = val;
            },
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // if (!departmentId.value) {
              //   ChcGridApi.formApi.getFieldComponentRef(
              //     'warehouseId',
              //   ).params.dependencies = {
              //     regionId: -1,
              //     departmentId: -1,
              //   };
              //   ChcGridApi.formApi
              //     ?.getFieldComponentRef('warehouseId')
              //     ?.fetchApi();
              // }
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: warehouseIdUrl.value,

            // showSearch: true,
            placeholder: '请选择调出仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            disabled: !!parentData.value.warehouseId,
            defaultValue: parentData.value.toWarehouseId || undefined,
            allowClear: true,
            onChange(val: any, option: any) {
              let warehouseType = Number(option.warehouseType);
              warehouseId.value = val;
              // toWarehouseParams.value = {};
              Object.entries(toWarehouseParams.value).forEach(
                ([key, value]) => {
                  toWarehouseParams.value[key] = undefined;
                  console.warn('key', key, 'value', value);
                },
              );
              while (warehouseType < 4) {
                toWarehouseParams.value[`level${warehouseType}`] = 'Y';
                warehouseType = warehouseType + 1;
              }
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',

            afterFetch(res: any) {
              if (res.rows?.length) {
                const firstOption = res.rows[0];
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  firstOption.id,
                );
                let warehouseType = Number(firstOption.warehouseType);
                // toWarehouseParams.value = {};
                Object.entries(toWarehouseParams.value).forEach(
                  ([key, value]) => {
                    toWarehouseParams.value[key] = undefined;
                    console.warn('key', key, 'value', value);
                  },
                );
                warehouseId.value = firstOption.id;
                while (warehouseType < 4) {
                  toWarehouseParams.value[`level${warehouseType}`] = 'Y';
                  warehouseType = warehouseType + 1;
                }

                ChcGridApi.formApi.getFieldComponentRef(
                  'toWarehouseId',
                ).params.dependencies = {
                  ...toWarehouseParams.value,
                  warehouseId: firstOption.id,
                };

                ChcGridApi.formApi
                  ?.getFieldComponentRef('toWarehouseId')
                  ?.fetchApi();
              }
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        rules: parentData.value.orderId ? '' : 'required',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              console.warn(
                ChcGridApi.formApi.getFieldComponentRef('warehouseId'),
                55,
              );
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },

        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '调出仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: toWarehouseIdUrl.value,

            // showSearch: true,
            placeholder: '请选择调入仓库',
            allowClear: true,
            triggerFields: ['warehouseId'],
            disabled: !!parentData.value.orderId,
            defaultValue: parentData.value.toWarehouseId || undefined,
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              productControlParams.value.warehouseId = val;
              // console.warn('selectToWarehouseId', selectToWarehouseId);
              // selectToWarehouseId.value = option.id;
              // selectController.sign();
            },
            extraParams: toWarehouseParams.value,
            paginate: false,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              const rows =
                res.rows?.filter(
                  (item: any) => item.id !== warehouseId.value,
                ) || [];
              return { ...res, rows: undefined, records: rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          trigger(values: any) {
            console.warn(values, 33);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'toWarehouseId',
              ).params.dependencies = {
                warehouseId: values.warehouseId,
              };

              ChcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
            }
          },
        },
        rules: parentData.value.orderId ? '' : 'required',

        fieldName: 'toWarehouseId',
        label: '调入仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/productAction/productControlLevelList.do?',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            triggerFields: ['toWarehouseId'],
            extraParams: productControlParams.value,
            placeholder: '请选择管控类型',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            disabled: !!parentData.value.orderId,
            defaultValue: parentData.value.productControlLevelName || undefined,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',

            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        rules: parentData.value.orderId ? '' : 'required',
        dependencies: {
          triggerFields: ['warehouseId', 'toWarehouseId'],
          trigger(values: any) {
            console.warn(values, 33);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('productControlLevel')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'productControlLevel',
              ).params.dependencies = {
                warehouseId: values.toWarehouseId,
                toWarehouseId: values.toWarehouseId,
              };

              ChcGridApi.formApi
                ?.getFieldComponentRef('productControlLevel')
                ?.fetchApi();
            }
          },
        },
        fieldName: 'productControlLevel',
        label: '管控类型',
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择库存状态',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            disabled: !!parentData.value.orderId,
            defaultValue: parentData.value.storageStatus || undefined,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        rules: parentData.value.orderId ? '' : 'required',

        fieldName: 'storageStatus',
        label: '库存状态',
      },
      {
        component: 'Input',
        fieldName: 'description',
        label: '备注',
        componentProps: {
          defaultValue: parentData.value!.description || undefined,
          placeholder: '请输入备注',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: {
          placeholder: '请输入包装号',
        },
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {},

    beforeFetchFn: (params) => {
      return {
        ...params,
        ...queryparams(params),
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
        toWarehouseId: undefined,
        productControlLevel: undefined,
        limit: params.pageSize,
        start: (params.pageNum - 1) * params.pageSize || 0,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
      editConfig: {
        enabled: detailInfo.value?.type === 'edit',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      keepSource: true,
    }),
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', minWidth: 50, align: 'center' },
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'packageNo',
        title: '包装号',
        minWidth: 170,
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 200,
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: 100,
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: 130,
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '数量',
        minWidth: 90,
        align: 'right',
      },
      {
        field: 'pricePO',
        title: '进价',
        minWidth: 80,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: 80,
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: 150,
        editRender: {
          name: 'VxeInput',
        },
      },
      {
        align: 'center',
        field: 'action',
        visible: detailInfo.value?.type === 'edit',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        minWidth: 100,
      },
    ],

    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    // queryUrl: '/orderAction/queryLine.do?page=woInput&specShowType=from',
    queryUrl: '/orderAction/queryLine.do?specShowType=from&page=moInput',
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        orderId: parentData.value.orderId,
        start: undefined,
        limit: 0,
      };
    },
    gridEvents: {
      editActivated: (scope: any) => {
        // 用于获取当前正在操作行和列的赋值
        currentEditRow.value = scope.row;
        currentField.value = scope.column.field;
      },
      editClosed: async ({ row }: any) => {
        currentInsertRows.value = roleGridApi.grid.getInsertRecords();
        currentUpdateRows.value = roleGridApi.grid.getUpdateRecords();

        if (autoSaveController.value === 'onSaving') {
          currentEditRow.value = undefined;
          currentField.value = '';
        } else {
          autoSaveController.value = 'onSaving';

          if (
            roleGridApi.grid.isInsertByRow(row) ||
            roleGridApi.grid.isUpdateByRow(row)
          ) {
            currentEditRow.value = undefined;
            currentField.value = '';

            // 对该行数据进行保存
            handleSaveOrder({
              $grid: roleGridApi.grid,
              row,
            })
              .then(() => {
                autoSaveController.value = 'wait';
                currentInsertRows.value = [];
                currentUpdateRows.value = [];
              })
              .catch(() => {
                autoSaveController.value = 'error';
                currentInsertRows.value = [];
                currentUpdateRows.value = [];
              });
          } else {
            autoSaveController.value = 'wait';
          }
        }
      },
    },
  },
);

const currentInsertRows = ref<any[]>([]); // 当前插入的临时数据行
const currentUpdateRows = ref<any[]>([]); // 当前有更新的数据行
const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait'); // 自动保存控制字段， error上一轮保存保存了 onSaving上一轮还在保存中 wait上一轮保存结束，等待下一次保存
const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field

onMounted(() => {
  if (parentData.value.orderId) {
    ChcGridApi.formApi.getValues().then(async (res: any) => {
      const sertchData = queryparams(res);
      ChcGridApi.query(sertchData);
    });
    roleGridApi.query();
  }
});

const handleAdd = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();

  if (selectedRows.length === 0) return message.warning('请先选择数据');

  ChcGridApi.formApi.getValues().then(async (res: any) => {
    const sertchData = queryparams(res);

    const params: any = {
      ...sertchData,
    };
    const lineData = selectedRows.map((item: any) => {
      return {
        ...item,
        pricePO: item.price,
      };
    });
    params.orderType = 'MO';
    params.returnDoc = 'N';
    params.isOutNeedPick = 'N';
    params.orderId = parentData.value.orderId;
    params.isPackaged = 'Y';
    params.lineData = JSON.stringify({ data: lineData });
    saveDo(params).then((res) => {
      if (res && res.success) {
        if (!parentData.value.orderId) {
          parentData.value = { orderId: res.data.header.id };
          ChcGridApi.formApi.setFieldValue('orderId', res.data.header.id);
        }
        message.success('添加成功');
        // ChcGridApi.query();
        ChcGridApi.formApi.getValues().then(async (res: any) => {
          const sertchData = queryparams(res);
          ChcGridApi.query(sertchData);
        });
        roleGridApi.query();
      }
    });
  });
};

const queryparams = (formValues: any) => {
  return {
    warehouseId: formValues.warehouseId || parentData.value.warehouseId,
    toWarehouseId: formValues.toWarehouseId || parentData.value.toWarehouseId,
    orderId: formValues.orderId || parentData.value.orderId,
    departmentId: formValues.departmentId || parentData.value.departmentId,
    storageStatus: formValues.storageStatus || parentData.value.storageStatus,
    description: formValues.description || parentData.value.description,
    productControlLevel:
      formValues.productControlLevel || parentData.value.productControlLevel,
  };
};

const hasChildEditStatus = (row: any) => {
  return roleGridApi.grid?.isEditByRow(row);
};

const handleSaveOrder = (scope: any) => {
  return new Promise((resolve) => {
    const params = {
      orderId: parentData.value.orderId,
      lineData: JSON.stringify({ data: [scope.row] }),
    };
    modifyLine(params).then((res) => {
      if (res && res.success) {
        message.success('修改成功');
        const sertchData = queryparams(res);
        ChcGridApi.query(sertchData);
        roleGridApi.query();
        resolve(res);
      }
    });
  });
};

const handleDeleteRow = (scope: any) => {
  const params = {
    orderId: parentData.value.orderId,
    lineData: JSON.stringify({ data: [scope.row] }),
  };
  deleteLine(params).then((res) => {
    if (res && res.success) {
      message.success('删除成功');
      const sertchData = queryparams(res);
      ChcGridApi.query(sertchData);
      roleGridApi.query();
    }
  });
};
const totalHandleLoading = ref(false);
const handleTotalSubmit = () => {
  const tableData = roleGridApi.grid.getData();
  if (tableData.length === 0) {
    return message.error('请添加需退货的商品！');
  }
  if (roleGridApi.grid.getInsertRecords().length > 0) {
    return message.error('当前表格存在新增行未保存，请保存后再操作！');
  } else if (roleGridApi.grid.getUpdateRecords().length > 0) {
    return message.error('当前表格存在未保存信息，请保存后再操作！');
  }
  const params = {
    orderId: parentData.value.orderId,
  };
  dataCommit(params).then((res) => {
    if (res && res.success) {
      message.success('单据提交成功');
      currentTab.value = 0;
    }
  });
};
const productName = ref('');
const handleSearch = (e: any) => {
  console.warn('handleSearch', e.target.value, productName.value);
  roleGridApi.query({
    orderId: parentData.value.orderId,
    productName: productName.value,
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                v-if="detailInfo?.type !== 'view'"
                type="primary"
                @click="handleAdd"
                class="mr-[0.5rem]"
                data-testid="button_add_documentDetail"
              >
                添 加
                <template #icon>
                  <AddActionIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <div class="mt-[10px]">
                <Input
                  v-model:value="productName"
                  class="mr-[0.5rem] w-[240px]"
                  placeholder="编码/拼音码/名称"
                  @keyup.enter="handleSearch"
                  allow-clear
                  data-testid="input_product_name_documentDetail"
                />
                <Button
                  type="primary"
                  @click="handleSearch"
                  data-testid="button_search_product_documentDetail"
                >
                  搜索
                  <template #icon>
                    <SearchActionIcon />
                  </template>
                </Button>
              </div>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                ghost
                danger
                @click="handleDeleteRow(scope)"
                :loading="scope.row.loading"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                v-if="
                  !hasChildEditStatus(scope.row) &&
                  detailInfo?.value?.type !== 'view'
                "
                :data-testid="`button_delete_row_${scope.rowIndex}_documentDetail`"
              >
                删行
                <template #icon>
                  <SvgDeleteIcon />
                </template>
              </Button>
            </template>
            <template #bottom>
              <div class="flex items-center justify-center pt-[10px]">
                <Button
                  type="primary"
                  @click="handleTotalSubmit"
                  :loading="totalHandleLoading"
                  v-if="detailInfo?.value?.type !== 'view'"
                  data-testid="button_submit_documentDetail"
                >
                  提交
                </Button>
              </div>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
    </div>
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
