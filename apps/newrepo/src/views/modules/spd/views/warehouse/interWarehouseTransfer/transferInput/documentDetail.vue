<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { ChcSelect } from '@vben/chc-ui';
import {
  AddActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { dataCommit, deleteLine, modifyLine, saveDo } from './api';
import { isEmpty } from '@vben/utils';

const currentTab = defineModel<number>('currentTab', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const warehouseOption: any = ref({})
const route = useRoute();
const userStore: any = useUserStore();
const globalPrintStore = useGlobalPrintStore();
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
  isScatter: 'Y',
});
const departmentId = ref<number | string>('');
const warehouseId = ref<number | string>('');
const productControlParams = ref({
  productControlLevel: urlParams.productControlLevel,
  warehouseId: '',
});

// const selectRows = ref<any[]>([]); // 存储选中的多行数据
const orderIds = ref<(number | string)[]>([]);
const EDITABLE_FIELDS = new Set(['qtyApply']);

// 是否是新增模式
const isAddMode = computed(() => {
  return detailInfo.value?.type === 'add';
});
const triggerInit = ref({
  departmentId: parentData.value?.departmentId || undefined,
  warehouseId: parentData.value?.warehouseId || undefined,
  toWarehouseId: parentData.value?.toWarehouseId || undefined,
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
      handleReset: () => {
        // console.log('重置');
        ChcGridApi.grid.clearCheckboxRow();
        ChcGridApi.formApi.resetForm();
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
      checkboxConfig: {
        trigger: 'row',
        highlight: true,
        reserve: true, // 保留选中状态
      },
      editConfig: {
        enabled: detailInfo?.value?.type !== 'view',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      pagerConfig: {
        // enabled: true,
      },
      cellStyle: ({ column }: { column: any }) => {
        if (
          EDITABLE_FIELDS.has(column.field) &&
          detailInfo?.value?.type !== 'view'
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
    }),

    gridEvents: {
      // 移除checkboxChange事件，避免编辑时清空选中状态
      // 选中状态在点击"添加"按钮时获取
      // AI-GENERATED-BEGIN
      // @date 2026-07-02
      // @prompt 申请数量输入完回车自动调用添加操作
      // @description 监听编辑激活事件，记录当前编辑的行和列
      editActivated: (scope: any) => {
        currentEditRow.value = scope.row;
        currentField.value = scope.column.field;
      },
      editClosed: () => {
        currentEditRow.value = undefined;
        currentField.value = '';
      },
      // AI-GENERATED-END
    },
  },
  {
    id: 'parent',
    queryUrl: '/storageAction/queryStorageDetail.do',
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        fixed: 'left',
        align: 'center',
      },
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },

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
      {
        field: 'productControlLevelName',
        minWidth: 130,
        title: '商品组',
        sortable: true,
      },
      { field: 'productSpec', title: '规格', minWidth: '90', sortable: true },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: '150',
        sortable: true,
        visible: false,
      },
      { field: 'manufacturer', title: '厂家', minWidth: '150', sortable: true },
      { field: 'uomName', title: '单位', minWidth: '60', sortable: true },
      {
        field: 'qtyAvailable',
        title: '可用数量',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyApply',
        title: '申请数量',
        minWidth: '150',
        align: 'right',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'float',
            min: 0,
            step: 0.01,
            digits: 2,
          },
        },
      },
      {
        field: 'lPackageQty',
        title: '大包装数',
        minWidth: '90',
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
      {
        field: 'qtyOnHand',
        title: '在库数量',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyAllocated',
        title: '分配数量',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyMoving',
        title: '在途数量',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
    ],
    formSchema: [
      {
        fieldName: 'departmentId',
        label: '院区',
        component: 'ChcSelect',
        componentProps: {
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          apiType: 'post',
          disabled: !!parentData.value.orderId,
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择院区',
          paginate: false,
          filterByFrontEnd: true,
          allowClear: true,
          onChange(val: any) {
            console.log('请选择院区-val', val);
            departmentId.value = val;
          },
          showChooseAll: '',
          immediate: false,
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
        },
      },
      {
        label: '调出仓库',
        fieldName: 'warehouseId',
        component: 'ChcSelect',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        // defaultValue: parentData.value.toWarehouseId || undefined,
        componentProps: {
          dictUrl: warehouseIdUrl.value,
          placeholder: '请选择调出仓库',
          triggerFields: ['departmentId', 'regionId'],
          paginate: false,
          disabled: !!parentData.value.orderId,

          allowClear: true,
          onChange(val: any, option: any) {
            let warehouseType = Number(option.warehouseType);
            warehouseOption.value = option
            
            warehouseId.value = val;
            // toWarehouseParams.value = {};
            Object.entries(toWarehouseParams.value).forEach(([key, value]) => {
              toWarehouseParams.value[key] = undefined;
              console.warn('key', key, 'value', value);
            });
            while (warehouseType < 4) {
              toWarehouseParams.value[`level${warehouseType}`] = 'Y';
              warehouseType = warehouseType + 1;
            }
          },
          immediate: false,
          labelField: 'name',
          valueField: 'id',

          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        },
        rules: parentData.value.orderId ? '' : 'required',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          async trigger(values: any) {
            console.log(
              'warehouseId--trigger:',
              detailInfo.value?.type,
              values,
            );
            if (ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef) {
              const warehouseIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('warehouseId');
              if (warehouseIdRef) {
                if (detailInfo.value?.type === 'add') {
                  if (values.departmentId) {
                    warehouseIdRef.params.dependencies = {
                      departmentId: values.departmentId,
                      regionId: values.departmentId,
                    };
                    const selectOptions = await warehouseIdRef.fetchApi();
                    console.log('selectOptions:', selectOptions);
                    // debugger
                    ChcGridApi.formApi?.setFieldValue(
                      'warehouseId',
                      triggerInit.value.warehouseId || undefined,
                    );
                    if (triggerInit.value.warehouseId) {
                     warehouseOption.value = selectOptions.find((item: any) => item.id === triggerInit.value.warehouseId) 
                    } else {
                      warehouseOption.value = {}
                    }
                    triggerInit.value.warehouseId = undefined;
                  } else {
                    warehouseIdRef.clearOptions();
                    ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                  }
                } else {
                  warehouseIdRef.params.dependencies = {
                    departmentId: values.departmentId,
                    regionId: values.departmentId,
                  };
                  const selectOptions = await warehouseIdRef.fetchApi();
                  warehouseOption.value = selectOptions.find((item: any) => item.id === parentData.value.warehouseId)

                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    parentData.value.warehouseId || undefined,
                  );
                  
                }
              }
            }

            // if (
            //   ChcGridApi.formApi?.getFieldComponentRef &&
            //   typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
            //   ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            // ) {
            //   ChcGridApi.formApi.getFieldComponentRef(
            //     'warehouseId',
            //   ).params.dependencies = {
            //     regionId: values.departmentId,
            //     departmentId: values.departmentId,
            //   };
            //   console.warn(
            //     ChcGridApi.formApi.getFieldComponentRef('warehouseId'),
            //     55,
            //   );
            //   ChcGridApi.formApi
            //     ?.getFieldComponentRef('warehouseId')
            //     ?.fetchApi();
            //   ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            // }
          },
        },
      },
      {
        fieldName: 'toWarehouseId',
        label: '调入仓库',
        component: 'ChcSelect',
        rules: parentData.value.orderId ? '' : 'required',

        componentProps: {
          autoChooseFirstOption: true,
          dictUrl: toWarehouseIdUrl.value,

          // showSearch: true,
          placeholder: '请选择调入仓库',
          allowClear: true,
          triggerFields: ['warehouseId'],
          disabled: !!parentData.value.orderId,
          // defaultValue: parentData.value.toWarehouseId || undefined,
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
          immediate: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.filter((item: any) => item.id !== warehouseId.value) ||
              [];
            return { ...res, rows: undefined, records: rows };
          },
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          async trigger(values: any) {
            if (ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef) {
              const toWarehouseIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('toWarehouseId');
              if (toWarehouseIdRef) {
                if (detailInfo.value?.type === 'add') {
                  if (values.warehouseId) {
                    toWarehouseIdRef.params.dependencies = {
                      warehouseId: values.warehouseId,
                    };
                    const selectOptions = await toWarehouseIdRef.fetchApi();
                    console.log('toWarehouseId--selectOptions:', selectOptions);
                    ChcGridApi.formApi?.setFieldValue(
                      'toWarehouseId',
                      triggerInit.value.toWarehouseId || undefined,
                    );
                    triggerInit.value.toWarehouseId = undefined;
                  } else {
                    toWarehouseIdRef.clearOptions();
                    ChcGridApi.formApi?.setFieldValue(
                      'toWarehouseId',
                      undefined,
                    );
                    ChcGridApi.formApi?.setFieldValue(
                      'toWarehouseId',
                      undefined,
                    );
                  }
                } else {
                  toWarehouseIdRef.params.dependencies = {
                    warehouseId: values.warehouseId,
                  };
                  await toWarehouseIdRef.fetchApi();
                  ChcGridApi.formApi?.setFieldValue(
                    'toWarehouseId',
                    parentData.value.toWarehouseId || undefined,
                  );
                }
              }
            }
            console.warn(values, 33);
            // if (
            //   ChcGridApi.formApi?.getFieldComponentRef &&
            //   typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
            //   ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId')
            // ) {
            //   ChcGridApi.formApi.getFieldComponentRef(
            //     'toWarehouseId',
            //   ).params.dependencies = {
            //     warehouseId: values.warehouseId,
            //   };

            //   ChcGridApi.formApi
            //     ?.getFieldComponentRef('toWarehouseId')
            //     ?.fetchApi();
            // }
          },
        },
      },
      {
        component: 'ChcSelect',
        componentProps: {
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
          autoChooseFirstOption: parentData.value?.orderId ? false : true,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        },
        rules: parentData.value.orderId ? '' : 'required',

        fieldName: 'storageStatus',
        label: '库存状态',
      },
      {
        component: 'ChcSelect',
        defaultValue: parentData.value.productControlLevelName || undefined,
        componentProps: {
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
          // showChooseAll: '',
          immediate: false,
          labelField: 'name',
          valueField: 'id',

          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        },
        // rules: parentData.value.orderId ? '' : 'required',
        dependencies: {
          triggerFields: ['warehouseId', 'toWarehouseId'],
          trigger(values: any) {
            console.warn(values, 33);
            if (!ChcGridApi.formApi?.getFieldComponentRef) return;
            const productControlLevelRef =
              ChcGridApi?.formApi?.getFieldComponentRef<
                InstanceType<typeof ChcSelect>
              >('productControlLevel');
            if (productControlLevelRef) {
              productControlLevelRef.params.dependencies = {
                warehouseId: values.warehouseId,
                toWarehouseId: values.toWarehouseId,
              };
              productControlLevelRef.fetchApi();
              if (detailInfo.value?.type !== 'add') {
                // debugger
                if (values.toWarehouseId && values.warehouseId) {
                  ChcGridApi.formApi.getValues().then(async (res: any) => {
                    const sertchData = queryparams(res);
                    ChcGridApi.query(sertchData);
                  });
                }
              }
            }
          },
        },
        fieldName: 'productControlLevel',
        label: '管控类型',
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
    ],
    tableSearchExtraParams: extParams.value,
    // radioChange已改为checkboxChange，使用第一个gridEvents中的逻辑

    beforeFetchFn: (params) => {
      return {
        ...params,
        ...queryparams(params),
        isScatter: 'Y',
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
        toWarehouseId: undefined,
        productControlLevel:
          params.productControlLevel || parentData.value.productControlLevel,
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
const CHILD_EDITABLE_FIELDS = new Set(['description', 'qtyOrdered']);
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
        enabled: detailInfo?.value?.type !== 'view',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      cellStyle: ({ column }: { column: any }) => {
        if (
          CHILD_EDITABLE_FIELDS.has(column.field) &&
          detailInfo?.value?.type !== 'view'
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
      keepSource: true,
    }),
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', minWidth: 50, align: 'center' },
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
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
        title: '申请数量',
        // edit: 'number',
        // verify: 'number|required',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'float',
            min: 0,
            step: 0.01,
            digits: 2,
          },
        },
        minWidth: 150,
        align: 'right',
      },
      {
        field: 'lPackageQty',
        title: '大包装数',
        minWidth: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'pricePO',
        title: '进价',
        minWidth: 80,
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
      },
      {
        field: 'lineAmt',
        title: '金额',
        minWidth: 80,
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
      },
      {
        field: 'lot',
        title: '批号',
        sortable: true,
        minWidth: 90,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        sortable: true,
        minWidth: 80,
      },
      {
        field: 'vendorName',
        title: '供应商',
        sortable: true,
        minWidth: 80,
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
        visible: detailInfo?.value?.type !== 'view',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
      //   {
      // field: "productValue",
      // width: "150",
      // hidden: true
      // }
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
      if (orderIds.value?.length === 0) {
        return false;
      }
      return {
        ...params,
        orderIds: orderIds.value.join(','),
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

                if (action.value === 'commit') {
                  // 提交保存
                  handleComit();
                }
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

onMounted(async () => {
  if (parentData.value.orderId) {
    // 初始化 orderIds
    orderIds.value.push(parentData.value.orderId);
    await nextTick();
    const departmentIdRef =
      ChcGridApi?.formApi.getFieldComponentRef<InstanceType<typeof ChcSelect>>(
        'departmentId',
      );
    const selectOptions = await departmentIdRef?.fetchApi();
    console.warn(selectOptions, parentData.value.departmentId, 33);
    departmentIdRef?.setModelValue(
      Number(parentData.value.departmentId) || undefined,
    );
    // TODO: 院区回显
    // ChcGridApi.formApi?.setFieldValue(
    //   'departmentId',
    //   parentData.value.departmentId,
    // );
    // ChcGridApi.formApi.getValues().then(async (res: any) => {
    //   const sertchData = queryparams(res);
    //   ChcGridApi.query(sertchData);
    // });
    roleGridApi.query();
  }
  // AI-GENERATED-BEGIN
  // @date 2026-07-02
  // @prompt 申请数量输入完回车自动调用添加操作
  // @description 注册全局键盘监听，在 qtyApply 编辑完成后按回车自动触发添加
  window.addEventListener('keydown', handleKeyEnter);
  // AI-GENERATED-END
  await nextTick();
  if (detailInfo.value?.type === 'add') {
    const departmentIdRef =
      ChcGridApi?.formApi.getFieldComponentRef<InstanceType<typeof ChcSelect>>(
        'departmentId',
      );
    await departmentIdRef?.fetchApi();
    ChcGridApi?.formApi?.setFieldValue(
      'departmentId',
      parentData.value.departmentId || undefined,
    );
    // ChcGridApi.formApi.getValues().then(async (res: any) => {
    //   const sertchData = queryparams(res);
    //   ChcGridApi.query(sertchData);
    // });
    // roleGridApi.query();
  }
});

// AI-GENERATED-BEGIN
// @date 2026-07-02
// @prompt 申请数量输入完回车自动调用添加操作
// @description 监听回车键触发添加操作
const handleKeyEnter = async (e: KeyboardEvent) => {
  if (e.key === 'Enter' && currentEditRow.value) {
    // 检查当前编辑的列是否是 qtyApply
    if (currentField.value === 'qtyApply') {
      e.preventDefault();
      const row = currentEditRow.value;
      if (row && row.qtyApply) {
        ChcGridApi.grid.setCheckboxRow(row, true);
        await handleAdd();
      }
    }
  }
};
// AI-GENERATED-END

onUnmounted(() => {
  // AI-GENERATED-BEGIN
  // @date 2026-07-02
  // @prompt 申请数量输入完回车自动调用添加操作
  // @description 页面卸载时移除全局键盘监听
  window.removeEventListener('keydown', handleKeyEnter);
  // AI-GENERATED-END
});

const handleAdd = async () => {
  // AI-GENERATED-BEGIN
  // @date 2026-06-22
  // @prompt 支持多选和批量添加，修复编辑申请数量时取消选中问题
  // @description 修改添加函数，点击添加时直接从表格获取选中数据，避免编辑时状态被清空
  const validate = await ChcGridApi.formApi.validate();

  if (!validate.valid) {
    return message.warn('请完善基础信息');
  }

  // 直接从表格获取当前选中的数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords(true);

  if (selectedRows.length === 0) {
    return message.warn('请选择要添加的数据');
  }

  const hasSpecialMVDrug = selectedRows.some(item => ['麻醉','精一'].includes(item.productControlLevelName))
  if (hasSpecialMVDrug && ![1,'1'].includes(warehouseOption.value.warehouseType)) {
    return message.warn('当前库房没有调拨麻醉药品和第一类精神药品权限，请移除相关药品后重新添加。');
  }
  // 验证所有选中行的申请数量
  const invalidQtyRows = selectedRows.filter(
    (row: any) => !row.qtyApply || row.qtyApply > row.qtyAvailable,
  );
  if (invalidQtyRows.length > 0) {
    return message.warn('请检查申请数量，不能为空且不能大于可用数量');
  }

  ChcGridApi.formApi.getValues().then(async (res: any) => {
    const sertchData = queryparams(res);

    const params: any = {
      ...sertchData,
    };
    params.orderType = 'MO';
    params.returnDoc = 'N';
    params.isOutNeedPick = 'N';
    params.orderId = parentData.value.orderId;

    params.orderIds = orderIds.value.join(',');
    params.isPackaged = 'N';
    // 批量添加选中的所有数据
    params.lineData = JSON.stringify({ data: selectedRows });
    saveDo(params).then((res) => {
      if (res && res.success) {
        if (!parentData.value.orderId) {
          parentData.value = { orderId: res.data.header.orderId };
          ChcGridApi.formApi.setFieldValue('orderId', res.data.header.orderId);
        }
        // 更新 orderIds

        orderIds.value = res.data.header.orderIds?.length
          ? res.data.header.orderIds
          : [res.data.header.orderId];
        message.success(`成功添加${selectedRows.length}条数据`);
        // 清空选中状态
        ChcGridApi.grid.clearCheckboxRow();
        // 刷新表格数据
        ChcGridApi.formApi.getValues().then(async (res: any) => {
          const sertchData = queryparams(res);
          ChcGridApi.query(sertchData);
        });
        roleGridApi.query();
      }
    });
  });
  // AI-GENERATED-END
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
      orderId: scope.row.orderId,
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
    orderId: scope.row.orderId,
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
const action = ref('');
const handleTotalSubmit = async () => {
  const tableData = roleGridApi.grid.getData();
  if (tableData.length === 0) {
    return message.error('请添加需退货的商品！');
  }
  if (roleGridApi.grid.getInsertRecords().length > 0) {
    return message.error('当前表格存在新增行未保存，请保存后再操作！');
  } else if (roleGridApi.grid.getUpdateRecords().length > 0) {
    // return message.error('当前表格存在未保存信息，请保存后再操作！');
    action.value = 'commit';

    return;
  }
  handleComit();
};

const handleComit = () => {
  const orderId = orderIds.value.join(',');
  const params = {
    orderId,
  };
  dataCommit(params).then((res) => {
    if (res && res.success) {
      message.success('单据提交成功');
      Modal.confirm({
        title: '打印提示',
        content: '确认打印调拨单吗？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          globalPrintStore.print({
            pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printApplyDocBatch?id=${orderId}`,
          });
        },
        onCancel() {},
      });
      action.value = '';
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
  <div class="box-border h-full w-full">
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
