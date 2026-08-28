<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { nextTick, onMounted, ref, toRaw, type ComputedRef } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  SvgCloseIcon,
  SvgDeleteIcon,
  SvgSaveIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { delWarehouseProduct, updateStart, updateStop } from './api';
import warehouseProductBatchAddFormCom from './modals/batchAddModal.vue'; // 批量添加弹窗组件
import batchCopyFormCom from './modals/batchCopyModal.vue'; // 批量复制弹窗组件
import copyFormCom from './modals/copyModal.vue'; // 复制弹窗组件
import ImportModalComp from './modals/importModal.vue'; // 导入弹窗组件
import setFixedFormCom from './modals/setFixedModal.vue'; // 批量设置定数弹框
import totalReportVolumeModalCom from './modals/totalReportVolume.vue'; // 报告总量
import warehouseProductBatchCom from './modals/warehouseProductBatchEditForm.vue'; // 批量编辑弹框
import warehouseProductFormCom from './modals/warehouseProductFormModal.vue'; // 新增/编辑弹窗组件
import warehouseProductOutlimitModalCom from './modals/warehouseProductOutlimitModal.vue';
import LazySearch from '#/utils/LazySearch';
import { ChcSelect, type GridColumn } from '@vben/chc-ui';
import { isEmpty } from '@vben/utils';
import { computed } from 'vue';
// 出库限量设置弹框
const userStore: any = useUserStore();
const route = useRoute();

const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
console.warn('userStore', userStore);
const hiddenField: string = urlParams?.hiddenField || '';

const isFirstLoaded = ref(false); // 是否已初次加载完
const checkedRow = ref<Record<string, any>>({});
const extParams = ref<{
  orgId_text?: string;
  vendorId_text?: string;
  warehouseId_text?: string;
}>({});

const lotExtraParam = ref<any>({ regionId: undefined });
const warehouseName = ref(''); // 存储仓库名称
const productCategoryValue = ref(''); // 存储商品类别

const selectController = new LazySearch(2, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});
onMounted(() => {
  selectController.sign(2);
});

// 搜索表单配置
const searchFormSchemas: VbenFormSchema[] = [
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/userOrgList.do',
        // showSearch: true,
        placeholder: '请选择机构',
        // onChange(val: any, option: any) {
        //   console.warn('orgId', val, option);
        // },
        paginate: false,
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
      triggerFields: [''],
      show: () => {
        return userStore.userInfo.isSaas;
      },
    },
    fieldName: 'orgId',
    label: '机构',
  },
  {
    fieldName: 'departmentId',
    label: '院区',
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        autoChooseFirstOption: true,
        showSearch: true,
        placeholder: '请选择院区',
        filterByFrontEnd: true,
        allowClear: true,
        onChange(val: any, option: any) {
          console.warn('departmentId', val, option);
          lotExtraParam.value.regionId = val;
        },
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
  },
  {
    fieldName: 'warehouseId',
    label: '仓库',
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
        autoChooseFirstOption: true,
        placeholder: '请选择仓库',
        triggerFields: ['departmentId', 'regionId'],
        onChange(val: any, option: any) {
          console.warn('warehouseId', val, option);
          warehouseName.value = option.name; // 存储仓库名称
          productCategoryValue.value = option.productCategoryValue || ''; // 存储商品类别
        },
        paginate: false,
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
      triggerFields: ['departmentId', 'regionId'],
      async trigger(values) {
        console.warn('trigger values:', values);
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
              const selectOptions = await warehouseIdRef.fetchApi();
              console.log('selectOptions:', selectOptions);
              // 选第一个不是全部的id
              const item = selectOptions.filter(
                (o: Record<string, any>) => !isEmpty(o?.id),
              )?.[0];
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                item?.id || undefined,
              );
              // 同步仓库名称和商品类别（setFieldValue不会触发onChange）
              warehouseName.value = item?.name || '';
              productCategoryValue.value = item?.productCategoryValue || '';
              if (!isFirstLoaded.value) {
                selectController.sign(1);
              }
            } else {
              warehouseIdRef.clearOptions();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          }
        }
      },
    },
  },
  {
    component: 'DateGroup',
    fieldName: 'dateRange',
    label: '创建时间',
    defaultValue: [],
    formItemClass: 'col-span-1',
  },
  {
    component: 'Input',
    fieldName: 'productName',
    label: '商品',
    componentProps: () => {
      return {
        placeholder: '请输入编码/搜索码/名称',
      };
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        // autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/refList.do?id=1000244',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: '请选择商品组',
        onChange(val: any, option: any) {
          console.warn('productControlLevel', val, option);
        },
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
    fieldName: 'productControlLevel',
    label: '商品组',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/productCategoryList.do',
        placeholder: '请选择商品类别',
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    defaultValue: '',
    fieldName: 'productCategoryId',
    label: '商品类别',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        // autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/refList.do?id=1000380',
        placeholder: '请选择商品分类',
        paginate: false,
        showChooseAll: '',
        immediate: true,
        allowClear: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    defaultValue: '',
    fieldName: 'productType',
    label: '商品分类',
  },
  {
    defaultValue: '',
    fieldName: 'replenishSource',
    label: '补货方式',
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/warehouseAction/replenishSourceList.do',
        placeholder: '请选择补货方式',
        triggerFields: ['warehouseId'],
        paginate: false,
        showChooseAll: '',
        immediate: true,
        allowClear: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          // 过滤出id和name为空的
          const rows = (res?.rows || []).filter(
            (item: any) => item.id && item.name,
          );
          return { ...res, rows: undefined, records: rows };
        },
      };
    },
    dependencies: {
      triggerFields: ['warehouseId'],
      trigger(values) {
        console.warn(values);
        if (
          ChcGridApi.formApi?.getFieldComponentRef &&
          typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
          ChcGridApi.formApi?.getFieldComponentRef('replenishSource') &&
          ChcGridApi.formApi?.getFieldComponentRef('replenishSource').params
        ) {
          ChcGridApi.formApi.getFieldComponentRef(
            'replenishSource',
          ).params.dependencies = {
            warehouseId: values.warehouseId || '-1',
          };
          ChcGridApi.formApi
            ?.getFieldComponentRef('replenishSource')
            ?.fetchApi();
          ChcGridApi.formApi?.setFieldValue('replenishSource', undefined);
        }
      },
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        options: [
          { value: '', label: '全部' },
          { value: 'Y', label: '在用' },
          { value: 'N', label: '停用' },
        ],
        placeholder: '请选择库备状态',
        defaultValue: '',
        paginate: false,
        showChooseAll: '',
        immediate: true,
        // allowClear: true,
      };
    },
    fieldName: 'isActive',
    label: '库备状态',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        options: [
          { value: '', label: '全部' },
          { value: 'Y', label: '在用' },
          { value: 'N', label: '停用' },
        ],
        placeholder: '请选择商品状态',
        defaultValue: '',
        paginate: false,
        showChooseAll: '',
        immediate: true,
        // allowClear: true,
      };
    },
    fieldName: 'isProductActive',
    label: '商品状态',
  },
  {
    component: 'Input',
    fieldName: 'markCode',
    label: '中标编码',
    defaultValue: '',
    componentProps: () => {
      return {
        placeholder: '请输入中标编码',
        defaultValue: '',
      };
    },
  },

  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: false,
        dictUrl: '/baseHandleAction/vendor.do',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: '请选择供应商',
        paginate: false,
        // allowClear: true,
        filterByFrontEnd: true,
        onChange(val: any, option: any) {
          extParams.value.vendorId_text = option.name;
        },
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
    fieldName: 'vendorId',
    label: '供应商',
  },
];

const gridColumns: ComputedRef<GridColumn[]> = computed(() => {
  const cols: GridColumn[] = [
    {
      type: 'radio',
      title: '单选',
      align: 'center',
      width: 50,
      visible: false,
    },
    {
      type: 'seq',
      title: '序号',
      align: 'center',
      width: 50,
    },
    {
      title: '多选',
      type: 'checkbox',
      width: 50,
      align: 'center',
    },
    {
      field: 'orgName',
      title: '机构',
      width: '110',
      sortable: true,
      visible: userStore.userInfo.isSaas as boolean,
    },
    {
      field: 'warehouseName',
      title: '仓库',
      width: '120',
      sortable: true,
    },
    {
      field: 'productCode',
      title: '药品编码',
      width: '120',
      sortable: true,
      slots: { default: 'productCode' },
    },
    {
      field: 'productName',
      title: '药品名称',
      width: '150',
      sortable: true,
    },
    {
      field: 'medicineName',
      title: '通用名',
      width: '150',
      sortable: true,
    },
    {
      field: 'productSpec',
      title: '规格',
      width: '120',
      sortable: true,
    },
    {
      field: 'manufacturer',
      title: '厂家',
      width: '150',
      sortable: true,
    },
    {
      field: 'zoneName',
      title: '默认库房',
      width: '120',
      sortable: true,
      visible: !hiddenField.includes('zoneName'),
    },
    {
      field: 'sectionName',
      title: '默认整件库区',
      width: '120',
      sortable: true,
      visible: !hiddenField.includes('sectionName'),
    },
    {
      field: 'locatorName',
      title: '默认整件货位',
      width: '120',
      sortable: true,
      visible: !hiddenField.includes('locatorName'),
    },
    {
      field: 'pickupSectionName',
      title: '默认散件库区',
      width: '120',
      sortable: true,
      visible: !hiddenField.includes('pickupSectionName'),
    },
    {
      field: 'pickupLocatorName',
      title: '默认散件货位',
      width: '120',
      sortable: true,
      visible: !hiddenField.includes('pickupLocatorName'),
    },
    {
      field: 'poSectionName',
      title: '默认采购库区',
      width: '120',
      sortable: true,
      visible: !hiddenField.includes('poSectionName'),
    },
    {
      field: 'poLocatorName',
      title: '默认采购货位',
      width: '120',
      sortable: true,
      visible: !hiddenField.includes('poSectionName'),
    },
    {
      field: 'replenishSourceName',
      title: '补货方式',
      width: '100',
      sortable: true,
    },
    {
      field: 'replenishWarehouseName',
      title: '补货仓库',
      width: '100',
      sortable: true,
      visible: !hiddenField.includes('replenishWarehouseName'),
    },
    {
      field: 'agentWarehouseName',
      title: '代发仓库',
      width: '100',
      sortable: true,
      visible: !hiddenField.includes('agentWarehouseName'),
    },
    {
      field: 'invoiceRule',
      title: '发票规则',
      width: '100',
      sortable: true,
      visible: !hiddenField.includes('invoiceRule'),
    },
    {
      field: 'isAutoReplenish',
      title: '是否自动补货',
      width: '120',
      sortable: true,
      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'replenishPolicyName',
      title: '自动补货策略',
      width: '120',
      sortable: true,
    },
    {
      field: 'levelMin',
      title: '安全库存',
      width: '100',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('levelMin'),
    },
    {
      field: 'levelMax',
      title: '最高库存',
      width: '100',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('levelMax'),
    },
    {
      field: 'minimumQty',
      title: '最低库存',
      width: '100',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('minimumQty'),
    },
    {
      field: 'levelReplenish',
      title: '补货点',
      width: '100',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('levelReplenish'),
    },
    {
      field: 'replenishPackageQtyText',
      title: '补货定数',
      width: '100',
      sortable: true,
    },
    {
      field: 'levelDay',
      title: '日均销量',
      width: '100',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('levelDay'),
    },
    {
      field: 'levelDay1',
      title: '前7天消耗均值',
      width: '150',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('levelDay1'),
    },
    {
      field: 'levelDay2',
      title: '前30天消耗均值',
      width: '150',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('levelDay2'),
    },
    {
      field: 'levelDay3',
      title: '前7天消耗最大值',
      width: '150',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('levelDay3'),
    },
    {
      field: 'lastReplenishDate',
      title: '上次补货日期',
      width: '130',
      sortable: true,
      visible: !hiddenField.includes('lastReplenishDate'),
    },
    {
      field: 'monthConsumeMax',
      title: '月消耗上限',
      width: '130',
      sortable: true,
    },
    {
      field: 'shortPoQtyMax',
      title: '临采上限',
      width: '130',
      align: 'right',
      sortable: true,
      visible: !hiddenField.includes('shortPoQtyMax'),
    },
    {
      field: 'isActive',
      title: '在用状态',
      width: '100',
      sortable: true,
      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '在用' : '停用';
      },
    },
    {
      field: 'isReportDrug',
      title: '报告药',
      width: '100',
      sortable: true,
      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'reportDrugQty',
      title: '报告总量',
      width: '100',
      align: 'right',
      sortable: true,
      slots: { default: 'reportDrugQty' },
    },
    {
      field: 'isPMSStop',
      title: '发药停用',
      width: '100',
      sortable: true,
      visible: !hiddenField.includes('isPMSStop'),
      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isPOStop',
      title: '采购停用',
      width: '100',
      sortable: true,
      visible: !hiddenField.includes('isPOStop'),
      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isCrossDocking',
      title: '请领自动转直配',
      width: '140',
      sortable: true,
      visible: !hiddenField.includes('isCrossDocking'),
      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'isAutoOut',
      title: '自动出库',
      width: '100',
      sortable: true,
      visible: !hiddenField.includes('isAutoOut'),
      formatter: ({ cellValue }) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },
    {
      field: 'billBpartnerName',
      title: '记账科室',
      width: '120',
      sortable: true,
    },
    {
      field: 'basePackageTypeName',
      title: '单件包装方式',
      width: '130',
      sortable: true,
    },
    {
      field: 'markCode',
      title: '中标编码',
      width: '120',
      sortable: true,
    },
    {
      field: 'createdByUser',
      title: '新增人',
      width: '120',
      sortable: true,
    },
    {
      field: 'created',
      title: '新增时间',
      width: '120',
      sortable: true,
    },
    {
      field: 'changeActiveUser',
      title: '启/停用人',
      width: '120',
      sortable: true,
    },
    {
      field: 'changeActiveTime',
      title: '启/停用时间',
      width: '120',
      sortable: true,
    },
    {
      field: 'description',
      title: '备注',
      width: '150',
      sortable: true,
    },
  ];
  // 之前通过 visible: !hiddenField.includes() 控制可见性的列，以及非 Saas 用户的机构列，
  // 从列定义中彻底移除，避免用户通过自定义列面板手动勾选
  const HIDDEN_FIELD_COLS = [
    'zoneName', // 默认库房
    'sectionName', // 默认整件库区
    'locatorName', // 默认整件货位
    'pickupSectionName', // 默认散件库区
    'pickupLocatorName', // 默认散件货位
    'poSectionName', // 默认采购库区
    'poLocatorName', // 默认采购货位
    'replenishWarehouseName', // 补货仓库
    'agentWarehouseName', // 代发仓库
    'invoiceRule', // 发票规则
    'levelMin', // 安全库存
    'levelMax', // 最高库存
    'minimumQty', // 最低库存
    'levelReplenish', // 补货点
    'levelDay', // 日均销量
    'levelDay1', // 前7天消耗均值
    'levelDay2', // 前30天消耗均值
    'levelDay3', // 前7天消耗最大值
    'lastReplenishDate', // 上次补货日期
    'monthConsumeMax', // 月消耗上限
    'shortPoQtyMax', // 临采上限
    'isPMSStop', // 发药停用
    'isPOStop', // 采购停用
    'isCrossDocking', // 请领自动转直配
    'isAutoOut', // 自动出库
  ];
  const hiddenFields = hiddenField
    ? hiddenField.split(',').filter(Boolean)
    : [];
  return cols.filter((col) => {
    const field = (col as GridColumn).field;
    if (!field) return true;
    if (hiddenFields.includes(field) && HIDDEN_FIELD_COLS.includes(field))
      return false;
    if (field === 'orgName' && !userStore.userInfo.isSaas) return false;
    return true;
  });
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
      showCollapseButton: true,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'warehouseProductGrid',
    // api地址
    queryUrl: '/warehouseAction/queryWarehouseProduct.do',
    gridColumns: gridColumns.value,
    // 表单配置
    formSchema: searchFormSchemas,
    gridEvents: {
      radioChange: (d: any) => {
        console.warn('radioChange', d);
        checkedRow.value = {};
        checkedRow.value = toRaw(d.row);
      },
    },
    // tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      params.orgId = userStore.userInfo?.orgId;

      return params;
    },
    afterFetchFn: (params) => {
      // const rows =
      //   params.rows?.map((item: any) => {
      //     return {
      //       ...item,
      //     };
      //   }) || [];

      // return {
      //   ...params,
      //   records: rows,
      // };
      console.warn('getTableArrDataFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 新增/修改弹窗
const [warehouseProductModal, warehouseProductModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  closeOnClickModal: false,
  // 连接抽离的组件
  connectedComponent: warehouseProductFormCom,
  draggable: true,
});

// 新增
const handleAdd = async () => {
  const formData = await ChcGridApi.formApi.getValues();
  // 如果没有选择仓库 则进行提示
  if (!formData.warehouseId) {
    Modal.error({
      title: '错误',
      content: '请选择仓库！',
      okText: '关闭',
      centered: true,
    });
    return;
  }
  console.warn('存在仓库===>formData:', formData, productCategoryValue.value);
  warehouseProductModalApi
    .setData({
      modalTitle: '添加',
      modalType: 'ADD',
      warehouseId: formData.warehouseId,
      productCategoryValue: productCategoryValue.value || '',
      warehouseName: warehouseName.value,
      callback() {
        ChcGridApi.formApi.getValues().then((res: any) => {
          ChcGridApi.query({ ...res });
        });
      },
    })
    .open();
};

// 编辑
const handleEdit = () => {
  // const row = ChcGridApi.grid.getRadioRecord(true);
  // const unProxyRow: any = toRaw(row);
  // if (isEmpty(unProxyRow)) {
  //   message.warning('请选择一条记录！');
  //   return;
  // }
  const records = ChcGridApi.grid.getCheckboxRecords(true);
  if (records.length === 0 || records.length > 1) {
    message.warning('请选择一条记录！');
    return;
  }
  const unProxyRow: any = toRaw(records[0]);
  console.warn('unProxyRow:', unProxyRow);
  warehouseProductModalApi
    .setData({
      modalTitle: '修改',
      modalType: 'EDIT',
      productCategoryValue: productCategoryValue.value || '',
      row: {
        ...unProxyRow,
        pickupLocatorId: unProxyRow?.pickupLocatorId
          ? Number.parseFloat(unProxyRow?.pickupLocatorId)
          : unProxyRow?.pickupLocatorId,
      },
      callback() {
        ChcGridApi.formApi.getValues().then((res: any) => {
          ChcGridApi.query({ ...res });
        });
      },
    })
    .open();
};

// 批量修改弹框
const [warehouseProductBatchModal, warehouseProductBatchModalApi] =
  useVbenModal({
    class: 'w-[1300px]',
    closable: true,
    closeOnClickModal: false,
    // 连接抽离的组件
    connectedComponent: warehouseProductBatchCom,
    draggable: true,
  });

// 批量修改
const handleBatchEdit = async () => {
  // console.warn('isSaas:', userStore.userInfo);
  const formData = await ChcGridApi.formApi.getValues();
  // console.warn('formData:', formData);
  const orgId = userStore.userInfo?.isSaas ? formData.orgId : '';
  console.warn('orgId:', orgId);
  const records = ChcGridApi.grid.getCheckboxRecords(true);
  console.warn('records:', records);
  if (records.length === 0) {
    message.warning('请选择一条记录！');
    return;
  }

  // 判断所选的品种是否是同一个仓库
  // const warehouseIds = records.map((item: any) => item.warehouseId);
  // const replenishIds = records.map((item: any) => item.replenishId);
  // console.warn('replenishIds:', replenishIds);
  // console.warn('warehouseIds:', warehouseIds);
  // if (warehouseIds.some((item: any) => item !== warehouseIds[0])) {
  //   message.warning('能选择一个仓库的库备记录！');
  //   return;
  // }
  let warehouseId;
  let warehouseName;
  const replenishIds: string[] = [];
  const checkRows = {};
  records.forEach((item: any) => {
    warehouseId = item.warehouseId;
    warehouseName = item.warehouseName;
    checkRows[item.warehouseId] = item.warehouseId;
    replenishIds.push(item.replenishId);
  });
  // console.warn(
  //   'checkRows:',
  //   checkRows,
  //   warehouseId,
  //   warehouseName,
  //   replenishIds,
  // );
  if (Object.keys(checkRows).length > 1) {
    message.warning('能选择一个仓库的库备记录！');
    return;
  }
  warehouseProductBatchModalApi
    ?.setData({
      modalTitle: '批量修改',
      modalType: 'BATCH_EDIT',
      orgId,
      warehouseId,
      warehouseName,
      replenishIds,
      hiddenField,
      productCategoryValue: productCategoryValue.value || '',
      callback() {
        ChcGridApi.formApi.getValues().then((res: any) => {
          ChcGridApi.query({ ...res });
        });
      },
    })
    .open();
};

// 启用
const handleStart = async () => {
  // const currentData = ChcGridApi.grid.getTableData().tableData || [];
  // console.warn('currentData:', currentData);
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: '确定启用？',
    onOk: async () => {
      try {
        const replenishIds = selectedRows.map((row: any) => row.replenishId);
        const params = {
          replenishId: JSON.stringify(replenishIds),
        };
        await updateStart(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('updateStartupdateStartupdateStart', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('操作成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('操作失败');
      }
    },
  });
};

// 停用
const handleStop = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: '确定停用？',
    onOk: async () => {
      try {
        const replenishIds = selectedRows.map((row: any) => row.replenishId);
        const params = {
          replenishId: JSON.stringify(replenishIds),
        };
        await updateStop(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('updateStopupdateStopupdateStop', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('操作成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('操作失败');
      }
    },
  });
};

// 删除
const handleDel = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        const replenishIds = selectedRows.map((row: any) => row.replenishId);
        const params = {
          replenishId: JSON.stringify(replenishIds),
        };
        await delWarehouseProduct(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('删除成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('删除失败');
      }
    },
  });
};

// 导入库备目录
const [ImportModal, ImportModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: ImportModalComp,
  draggable: true,
});

const handleImport = () => {
  ImportModalApi.open();
};

// 批量设置定数
const [SetFixedModal, SetFixedModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: setFixedFormCom,
  draggable: true,
});
const handleBatchSetFixed = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  const replenishIds = selectedRows.map((row: any) => row.replenishId);
  SetFixedModalApi?.setData({
    modalTitle: '批量设置定数',
    replenishId: JSON.stringify(replenishIds),
    callback() {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    },
  }).open();
};

// 复制
const [CopyModal, CopyModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: copyFormCom,
  draggable: true,
});
const handleCopy = () => {
  const records = ChcGridApi.grid.getCheckboxRecords(true);
  if (records.length === 0 || records.length > 1) {
    message.warning('请选择一条记录！');
    return;
  }
  const unProxyRow: any = toRaw(records[0]);
  console.warn('unProxyRow:', unProxyRow);
  CopyModalApi.setData({
    modalTitle: '复制',
    row: unProxyRow,
    hiddenField,
    callback() {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    },
  }).open();
};

// 批量复制
const [BatchCopyModal, BatchCopyModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: batchCopyFormCom,
  draggable: true,
});
const handleBatchCopy = () => {
  const records = ChcGridApi.grid.getCheckboxRecords(true);
  console.warn('records:', records);
  if (!records || records.length === 0) {
    message.warning('请至少选择一条记录');
    return;
  }
  // 判断所选的品种是否是同一个仓库
  const warehouseIds = records.map((item: any) => item.warehouseId);
  console.warn('warehouseIds:', warehouseIds);
  if (warehouseIds.some((item: any) => item !== warehouseIds[0])) {
    // message.warning('只能选择一个仓库的库备记录！');
    Modal.error({
      title: '错误',
      content: '只能选择一个仓库的库备记录！',
      centered: true,
    });
    return;
  }
  BatchCopyModalApi?.setData({
    modalTitle: '批量复制',
    modalType: 'BATCH_COPY',
    rows: records,
    callback() {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    },
  }).open();
};

// 批量新增
const [BatchAddModal, BatchAddModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: warehouseProductBatchAddFormCom,
  draggable: true,
});
const handleBatchAdd = () => {
  BatchAddModalApi?.setData({
    modalTitle: '批量新增',
    modalType: 'BATCH_ADD',
    callback() {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    },
  }).open();
};

// 出库限量设置
const [OutlimitModal, OutlimitModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: warehouseProductOutlimitModalCom,
  draggable: true,
});
const handleBatchSetOutLimit = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  console.warn('selectedRows:', selectedRows);
  if (selectedRows.length === 0 || selectedRows.length > 1) {
    message.warning('请选择一条记录');
    return;
  }
  // 仅一级库可以设置
  if (selectedRows[0].warehouseType !== '1') {
    message.warning('仅一级库可以设置出库限量');
    return;
  }
  OutlimitModalApi?.setData({
    modalTitle: '出库限量设置',
    row: selectedRows[0],
    callback() {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    },
  }).open();
};

// 打开弹框、
const [TotalReportVolumeModal, TotalReportVolumeModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: totalReportVolumeModalCom,
  draggable: true,
});

// 表格对应字段处理
const handleOpenModal = (row: any, field: string) => {
  console.warn('handleOpenModal:', row, field);
  if (field === 'productCode') {
    const unProxyRow: any = toRaw(row);
    console.warn('unProxyRow:', unProxyRow);
    warehouseProductModalApi
      .setData({
        modalTitle: '修改',
        modalType: 'EDIT',
        row: unProxyRow,
        callback() {
          ChcGridApi.formApi.getValues().then((res: any) => {
            ChcGridApi.query({ ...res });
          });
        },
      })
      .open();
  } else if (field === 'reportDrugQty') {
    TotalReportVolumeModalApi?.setData({
      modalTitle: '报告总量变更记录',
      replenishId: row.replenishId,
      callback() {},
    }).open();
  }
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <warehouseProductModal />
    <warehouseProductBatchModal />
    <ImportModal />
    <SetFixedModal />
    <CopyModal />
    <BatchCopyModal />
    <BatchAddModal />
    <OutlimitModal />
    <TotalReportVolumeModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_warehouseProduct"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add_warehouseProduct"
        >
          新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleEdit"
          class="mr-[0.5rem]"
          data-testid="button_edit_warehouseProduct"
        >
          修改
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleBatchEdit"
          class="mr-[0.5rem]"
          data-testid="button_batchEdit_warehouseProduct"
        >
          批量修改
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleStart"
          class="mr-[0.5rem]"
          data-testid="button_start_warehouseProduct"
        >
          启用
          <template #icon>
            <SvgSaveIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleStop"
          class="mr-[0.5rem]"
          data-testid="button_stop_warehouseProduct"
        >
          停用
          <template #icon>
            <SvgCloseIcon />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDel"
          class="mr-[0.5rem]"
          data-testid="button_delete_warehouseProduct"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import_warehouseProduct"
        >
          导入库备目录
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleBatchSetFixed"
          class="mr-[0.5rem]"
          data-testid="button_batchSetFixed_warehouseProduct"
        >
          批量设置定数
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleCopy"
          class="mr-[0.5rem]"
          data-testid="button_copy_warehouseProduct"
        >
          复制
        </Button>
        <Button
          v-if="false"
          type="primary"
          @click="handleBatchCopy"
          class="mr-[0.5rem]"
          data-testid="button_batchCopy_warehouseProduct"
        >
          批量复制
        </Button>
        <Button
          v-if="false"
          type="primary"
          @click="handleBatchAdd"
          class="mr-[0.5rem]"
          data-testid="button_batchAdd_warehouseProduct"
        >
          批量新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleBatchSetOutLimit"
          data-testid="button_outLimit_warehouseProduct"
        >
          出库限量设置
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
      </template>
      <template #productCode="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOpenModal(scope.row, 'productCode')"
          :data-testid="`button_productCode_${scope.rowIndex}_warehouseProduct`"
        >
          {{ scope.row.productCode }}
        </a>
      </template>
      <template #reportDrugQty="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOpenModal(scope.row, 'reportDrugQty')"
          :data-testid="`button_reportDrugQty_${scope.rowIndex}_warehouseProduct`"
        >
          {{ scope.row.reportDrugQty }}
        </a>
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
