<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { computed, nextTick, onMounted, ref, toRaw } from 'vue';

import {
  AntdArrowLeftOutlined,
  SvgDeleteIcon,
  UploadActionIcon,
  UploadCloudIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { requestFormClient } from '#/api/request';
import { deepClone } from '#/utils/util';
// 路由中传递的参数

const props = defineProps<{
  afterSubmit: () => void;
  departmentId: number;
  warehouseId: number;
}>();
const PageStatusVal = {
  Main: 0,
  Add: 1,
} as const;
const currPageStatus = defineModel('currPageStatus');
const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const isProductControlLevel = computed(
  () => userStore?.userInfo?.isProductControlLevel || false,
);
const productControlLevelDictUrl = computed(() => {
  if (isProductControlLevel.value) {
    return `/productAction/productControlLevelList.do?warehouseId=${props.warehouseId}`;
  }
  return '/productAction/productControlLevelList.do';
});

const selectParams = ref<{ [key: string]: any }>({
  warehouseId: props.warehouseId,
});
//  盘点类型
const inventoryType = ref<'all' | 'single'>('all');
const canOperate = computed(() => inventoryType.value === 'single');
const getProductList = () => {
  const c =
    chcSelectRef.value &&
    chcSelectRef.value.fetchApi &&
    typeof chcSelectRef.value.fetchApi === 'function';
  if (c) {
    chcSelectRef.value.fetchApi();
  } else {
    nextTick(() => {
      const c2 =
        chcSelectRef.value &&
        chcSelectRef.value.fetchApi &&
        typeof chcSelectRef.value.fetchApi === 'function';
      if (c2) {
        chcSelectRef.value.fetchApi();
      }
    });
  }
};
const gridData = ref<any[]>([]); // 表格数据

const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};
// 生成表格组件和api
const gridColumns: VxeTableGridOptions['columns'] = [
  { type: 'checkbox', title: '', width: 40, align: 'center' },
  {
    title: '序号',
    type: 'seq',
    width: 40,
    align: 'center',
    sortable: true,
  },
  {
    field: 'productCode',
    title: '药品编码',
    width: 120,
  },
  { field: 'productName', title: '药品名称', width: 220 }, // 其中 edit 的名字需要与弹窗里div的名字一致
  { field: 'productSpec', title: '规格', width: 150 },
  { field: 'modelNo', title: '型号', width: 150, visible: false },
  { field: 'manufacturer', title: '厂家', width: 150 },
  { field: 'uomName', title: '单位', width: 70 },

  {
    // field: 'qtyOnHand',
    field: 'storageQty',
    title: '库存数量',
    width: 90,
    align: 'right',
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: '操作',
    // width: 85,
  },
];
const [ChcGrid, ChcGridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    showCollapseButton: false,
    showDefaultActions: false,
    wrapperClass:
      'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
    compact: true,
    schema: [
      {
        component: 'ChcSelect',
        formItemClass: 'pb-2',
        fieldName: 'departmentId',
        label: '院区',
        defaultValue: props.departmentId,
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: `请选择院区`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            disabled: true,
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: (res.rows || []).map((item: any) => ({
                  id: Number.parseFloat(item.id),
                  name: item.name,
                })),
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        defaultValue: props.warehouseId,
        formItemClass: 'pb-2',
        fieldName: 'warehouseId',
        label: '盘点仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择`,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            disabled: true,
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows.map((item: any) => ({
                  ...item,
                  id: Number.parseFloat(item.id),
                })),
              };
            },
          };
        },
      },

      {
        component: 'ChcSelect',
        fieldName: 'inventoryType',
        label: '盘点类型',
        defaultValue: 'all',
        componentProps: () => {
          return {
            options: [
              { value: 'single', label: '单品盘点' },
              { value: 'all', label: '全盘' },
            ],
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            onChange(val: any) {
              // AI-GENERATED-BEGIN
              // @date 2026-05-28
              // @prompt 切换为全盘时清空表格数据
              // @description 当盘点类型切换为全盘时，清空当前表格的所有数据
              // 为全盘时禁止添加商品
              inventoryType.value = val;
              if (val === 'all') {
                // 清空表格数据
                gridData.value = [];
                // 清空黑名单，使所有商品可以重新选择
                blackList.value = [];
                // 重新加载表格数据以应用更改
                ChcGridApi.grid.reloadData([]);
              }
              // AI-GENERATED-END
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'inventoryParticle',
        label: '盘点粒度',
        defaultValue: 'lot',
        componentProps: () => {
          return {
            options: [
              { value: 'lot', label: '批号' },
              { value: 'product', label: '品种' },
            ],
            placeholder: `请选择盘点粒度`,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        formItemClass: 'pb-2',
        fieldName: 'productControlLevel',
        label: '商品组',
        componentProps: () => {
          return {
            dictUrl: productControlLevelDictUrl.value,
            placeholder: `请选择`,
            showSearch: true,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
            onChange(val: any) {
              selectParams.value.productControlLevel = val;
              getProductList();
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        formItemClass: 'pb-2',
        fieldName: 'sectionId',
        label: '库区',
        componentProps: () => {
          return {
            dictUrl: `/warehouseAction/sectionList.do?warehouseId=${props.warehouseId}`,
            placeholder: `请选择库区`,
            paginate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          trigger(values) {
            const c = isFieldComponentRefExist('sectionId');
            if (c) {
              const refInst = ChcGridApi.formApi.getFieldComponentRef(
                'sectionId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `/warehouseAction/sectionList.do?warehouseId=${values?.warehouseAction}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst?.fetchApi();
                }
                ChcGridApi.formApi?.setFieldValue('sectionId', undefined);
              }
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        formItemClass: 'pb-2',
        fieldName: 'fromLocatorId',
        label: '开始货位',
        componentProps: () => {
          return {
            placeholder: '请选择开始货位',
            immediate: false,
            paginate: true,
            filterByFrontEnd: false,
            labelField: 'name',
            valueField: 'id',
            filterField: 'productName',
            queryModelValueField: 'locatorId',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId', 'sectionId'],
          trigger(values) {
            console.warn('fromLocatorId trigger values', values);
            nextTick(() => {
              const c = isFieldComponentRefExist('fromLocatorId');
              console.warn("isFieldComponentRefExist('fromLocatorId')", c);
              if (c) {
                const refInst = ChcGridApi.formApi.getFieldComponentRef(
                  'fromLocatorId',
                ) as unknown as SelectComponentRef;
                console.warn('fromLocatorId refInst', refInst);
                if (refInst && refInst.params) {
                  refInst.params.dictUrl = `/warehouseAction/locatorList.do?warehouseId=${values?.warehouseId}${isEmpty(values?.sectionId) ? '' : `&type=locator&sectionId=${values?.sectionId}`}`;
                  console.warn('fromLocatorId fetchApi', refInst?.fetchApi);
                  if (typeof refInst?.fetchApi === 'function') {
                    refInst?.fetchApi();
                  }
                  ChcGridApi.formApi?.setFieldValue('fromLocatorId', undefined);
                }
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
        formItemClass: 'pb-2',
        fieldName: 'toLocatorId',
        label: '结束货位',
        componentProps: () => {
          return {
            placeholder: '请选择结束货位',
            immediate: false,
            paginate: true,
            filterByFrontEnd: false,
            labelField: 'name',
            valueField: 'id',
            filterField: 'productName',
            queryModelValueField: 'locatorId',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId', 'sectionId'],
          trigger(values) {
            console.warn('toLocatorId trigger values', values);
            nextTick(() => {
              const c = isFieldComponentRefExist('toLocatorId');
              console.warn("isFieldComponentRefExist('toLocatorId')", c);
              if (c) {
                const refInst = ChcGridApi.formApi.getFieldComponentRef(
                  'toLocatorId',
                ) as unknown as SelectComponentRef;
                console.warn('toLocatorId refInst', refInst);
                if (refInst && refInst.params) {
                  refInst.params.dictUrl = `/warehouseAction/locatorList.do?warehouseId=${values?.warehouseId}${isEmpty(values?.sectionId) ? '' : `&type=locator&sectionId=${values?.sectionId}`}`;
                  console.warn('toLocatorId fetchApi', refInst?.fetchApi);
                  if (typeof refInst?.fetchApi === 'function') {
                    refInst?.fetchApi();
                  }
                  ChcGridApi.formApi?.setFieldValue('toLocatorId', undefined);
                }
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isFee',
        label: '是否计价',
        // defaultValue: '',
        componentProps: () => {
          return {
            options: [
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: `请选择是否计价`,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            onChange(val: any) {
              selectParams.value.isFee = val;
              getProductList();
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        formItemClass: 'pb-2',
        fieldName: 'defaultVendorId',
        label: '默认供应商',
        componentProps: () => {
          return {
            dictUrl: `/baseHandleAction/vendor.do`,
            placeholder: `请选择`,
            showSearch: true,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
            onChange(val: any) {
              selectParams.value.defaultVendorId = val;
              getProductList();
            },
          };
        },
        dependencies: {
          triggerFields: ['inventoryType'],
          show: (values) => values.inventoryType === 'single',
        },
      },
      {
        component: 'ChcSelect',
        // defaultValue: '',
        formItemClass: 'pb-2',
        fieldName: 'productCategory',
        label: '商品类别',
        componentProps: () => {
          return {
            dictUrl: `/productAction/productCategoryList.do`,
            placeholder: `请选择`,
            showSearch: true,
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
            onChange(val: any) {
              selectParams.value.productCategoryIds = val;
              getProductList();
            },
          };
        },
        dependencies: {
          triggerFields: ['inventoryType'],
          show: (values) => values.inventoryType === 'single',
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isZero',
        label: '含零库存',
        defaultValue: 'N',
        componentProps: () => {
          return {
            options: [
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            onChange(val: any) {
              selectParams.value.isZero = val;
              if (
                chcSelectRef.value &&
                chcSelectRef.value.fetchApi &&
                typeof chcSelectRef.value.fetchApi === 'function'
              ) {
                chcSelectRef.value.fetchApi();
              }
            },
          };
        },
      },
    ],
  },
  gridOptions: {
    keyboardConfig: {
      isEdit: true,
    },
    size: 'small',
    editConfig: {
      enabled: false,
      mode: 'row',
      trigger: 'dblclick',
      showStatus: false,
      showIcon: false,
      autoClear: true,
    },
    checkboxConfig: {
      trigger: 'default',
      checkMethod: ({ row }: any) => {
        return row.orderPlanLineId;
      },
    },
    keepSource: true,
    height: 'auto',
    pagerConfig: {
      enabled: false,
    },
    showOverflow: true,
    proxyConfig: {
      autoLoad: false,
    },
    border: true,
    cellConfig: {
      height: 32,
    },
    data: gridData.value,
    rowConfig: {
      isCurrent: false,
    },
    columns: gridColumns,
  },
  gridEvents: {
    editActivated: (scope: any) => {
      // 用于获取当前正在操作行和列的赋值
      currentEditRow.value = scope.row;
      currentField.value = scope.column.field;
    },
    editClosed: async ({ row }: any) => {
      console.warn('editClosed', row);
    },
  },
});

// 选择一个商品  新增行
const handleChoose = async (val: any, item: any) => {
  console.warn('handleChoose val', val);
  console.warn('handleChoose item', item);
  if (submitLoading.value) {
    return;
  }
  if (!props.warehouseId) {
    message.warning('请选择仓库');
    return;
  }
  const editRowData: Record<string, any> = {};
  try {
    const res = await requestFormClient.post(
      '/orderPlanAction/queryStorage.do',
      {
        productId: item.productId,
        warehouseId: props.warehouseId,
      },
    );
    editRowData.qtyOnHand = res.qtyOnHand || 0;
  } catch (error) {
    console.error(error);
    return;
  }
  const existingRows =
    deepClone(ChcGridApi.grid.getTableData().tableData) || [];
  const productIdIds = toRaw(existingRows).map((o: any) => o.productId);
  if (productIdIds.includes(item.productId)) {
    message.error('选择的商品有重复!');
    return;
  }
  // 先往黑名单里加数据，放后面会造成表格新增数据异常
  blackList.value.push(val);
  await nextTick();
  chcSelectRef.value.modelValue = undefined; // 清空下拉组件
  const formValue = await ChcGridApi.formApi.getValues();
  console.warn('handleChoose: formValue', formValue);
  const p: Record<string, any> = {};
  gridColumns.forEach((item: any) => {
    if (
      item.field !== 'checkbox' &&
      item.field !== 'action' &&
      item.field !== 'seq'
    ) {
      p[item.field] = undefined;
    }
  });

  const record = {
    ...p,
    ...item,
    ...editRowData,
  };
  console.warn('handleChoose p', p);
  gridData.value.push(record);
  // 重新加载表格数据
  await ChcGridApi.grid.reloadData(gridData.value);
  //   // 更新表格数据状态
  // const existingTableData = ChcGridApi.grid.getTableData().tableData || [];
  // hasTableData.value = existingTableData.length > 0;
};
// 点击删除按钮  删除行
const handleDeleteRow = async (scope: any) => {
  console.warn('handleDeleteRow scope', scope);
  // 从 gridData 数组中移除对应的行
  const rowIndex = gridData.value.findIndex((item) => {
    // 通过多个字段来匹配行数据
    return (
      item.productCode === scope.row.productCode &&
      item.productName === scope.row.productName
    );
  });
  if (rowIndex !== -1) {
    gridData.value.splice(rowIndex, 1);

    // 重新加载表格数据
    await ChcGridApi.grid.reloadData(gridData.value);
  }
  // 从黑名单中移除对应的商品编码，使其可以重新选择
  const blackListIndex = blackList.value.indexOf(scope.row.productCode);
  if (blackListIndex !== -1) {
    blackList.value.splice(blackListIndex, 1);
  }
};
// 右下角全部 保存 提交 返回功能
const submitLoading = ref(false); // 整体操作loading控制
// 整体提交
const handleSubmit = async (isByVendor: boolean) => {
  if (submitLoading.value) {
    return;
  }
  const submitRows = ChcGridApi.grid.getTableData().tableData || [];
  const notProxyRows = toRaw(submitRows);
  console.warn('handleSubmit submitRows', submitRows);

  // if (notProxyRows.length === 0) {
  //   return message.error('请添加数据后再提交！');
  // }

  const res = await ChcGridApi.formApi.getValues();
  console.warn('handleSubmit res', res);
  const warehouseId = res.warehouseId;
  if (!warehouseId) {
    message.warning('请选择盘点仓库！');
    return false;
  }
  const inventoryType = res.inventoryType;
  if (!inventoryType) {
    message.warning('请选择盘点类型！');
    return false;
  }
  const inventoryParticle = res.inventoryParticle;
  if (!inventoryParticle) {
    message.warning('请选择盘点粒度！');
    return false;
  }
  let productIdIds: (number | string)[] = [];
  if (inventoryType === 'single') {
    productIdIds = notProxyRows.map((item) => item.productId);
  }

  const params = {
    warehouseId: res.warehouseId,
    zoneId: isEmpty(res.zoneId) ? '' : res.zoneId,
    sectionId: isEmpty(res.sectionId) ? '' : res.sectionId,
    fromLocatorId: isEmpty(res.fromLocatorId) ? '' : res.fromLocatorId,
    toLocatorId: isEmpty(res.toLocatorId) ? '' : res.toLocatorId,
    inventoryType: isEmpty(res.inventoryType) ? '' : res.inventoryType,
    inventoryParticle: isEmpty(res.inventoryParticle)
      ? ''
      : res.inventoryParticle,
    productIds: JSON.stringify(productIdIds),
    locatorIds: JSON.stringify([]),
    productControlLevel: isEmpty(res.productControlLevel)
      ? ''
      : res.productControlLevel,
    productCategory: isEmpty(res.productCategory) ? '' : res.productCategory,
    isByVendor: isByVendor ? 'Y' : 'N',
    defaultVendorId: isEmpty(res.defaultVendorId) ? '' : res.defaultVendorId,
    isFee: isEmpty(res.isFee) ? '' : res.isFee,
    isZero: isEmpty(res.isZero) ? '' : res.isZero,
  };
  console.warn('handleSubmit params', params);
  submitLoading.value = true;
  requestFormClient
    .post('/inventoryPlanAction/createInventoryPlan.do', params)
    .then((res) => {
      if (res.success) {
        message.success('创建成功！');
        currPageStatus.value = PageStatusVal.Main;
        props.afterSubmit();
      } else {
        message.error(`创建失败：${res.msg}`);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      submitLoading.value = false;
    });
};
const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field

// 控制添加商品以及黑名单逻辑
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const chcSelectRef = ref(); // 商品选择下拉组件

// 页面初始化加载行数据以及黑名单数据
onMounted(() => {});
// 用于标记产品下拉是否打开，用来自定义下拉开启时的键盘左右箭头操作
const selectOpen = ref(false);
const handleDropdownVisibleChange = (open: boolean) => {
  selectOpen.value = !!open;
};

const handleBack = () => {
  currPageStatus.value = PageStatusVal.Main;
};
const importPartnerProduct = () => {
  if (submitLoading.value) {
    return;
  }
  handleSubmit(true);
};
</script>
<template>
  <div class="relative h-full">
    <ChcGrid>
      <template #toolbar-actions>
        <ChcSelect
          data-testid="ChcSelect_productName_addTable"
          :paginate="true"
          :allow-clear="false"
          :autofocus="true"
          ref="chcSelectRef"
          placeholder="请输入药品编码、药品名称、规格"
          class="mr-[0.5rem] w-[380px]"
          dict-url="/productAction/query.do"
          popup-class-name="productSelection"
          @dropdown-visible-change="handleDropdownVisibleChange"
          api-type="post"
          request-content-type="application/x-www-form-urlencoded"
          :page-size="25"
          :immediate="false"
          :extra-params="selectParams"
          :black-list="blackList"
          :filter-by-front-end="false"
          :show-search="true"
          @change="handleChoose"
          filter-field="productName"
          :disabled="!canOperate"
          :handle-params="
            (params: any) => {
              return {
                ...params,
                current: undefined,
                pageNum: params.current,
                pageSize: params.size,
                size: undefined,
              };
            }
          "
          label-field="productName"
          value-field="productCode"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            }
          "
          :option-columns="[
            {
              header: '药品编码',
              name: 'productCode',
              width: 80,
            },
            {
              header: '药品名称',
              name: 'productName',
              width: 160,
            },
            {
              header: '规格',
              name: 'productSpec',
              width: 80,
            },
            {
              header: '型号',
              name: 'modelNo',
              width: 100,
              visible: false,
            },
            {
              header: '单位',
              name: 'uomName',
              width: 80,
            },
            {
              header: '采购价',
              name: 'price',
              width: 80,
            },
            {
              header: '库存',
              name: 'storageQty',
              width: 80,
            },
          ]"
        />
        <Button
          type="primary"
          @click="importPartnerProduct"
          :disabled="!canOperate"
          class="mr-[0.5rem]"
          data-testid="button_importPartnerProduct_addTable"
        >
          导入供应商品种
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          type="primary"
          ghost
          danger
          @click="handleDeleteRow(scope)"
          :loading="scope.row.loading"
          :disabled="!canOperate"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_deleteRow_${scope.rowIndex}_addTable`"
        >
          删行
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <template #bottom>
        <div class="flex items-center justify-center pt-[10px]">
          <div class="flex gap-[10px]">
            <Button
              type="primary"
              @click="handleBack"
              data-testid="button_back_addTable"
            >
              <AntdArrowLeftOutlined class="mb-[4px]" />
              返回
            </Button>
            <Button
              type="primary"
              @click="handleSubmit(false)"
              :loading="submitLoading"
              data-testid="button_submit_addTable"
            >
              提交
              <template #icon>
                <UploadCloudIcon />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-grid--form-wrapper form div.grid) {
  padding-bottom: 0.5rem;
}

::v-deep(.vxe-tools--wrapper .ant-input) {
  padding: 2px 7px;
}
</style>
