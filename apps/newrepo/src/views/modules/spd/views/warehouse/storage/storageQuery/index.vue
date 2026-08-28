<script lang="ts" setup>
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import {
  h,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  toRaw,
  useTemplateRef,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Button,
  message,
  Modal,
  RadioButton,
  RadioGroup,
} from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepClone, deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { RouteMappingManager } from '../routeMapping';
import movingDetailModal from './modals/movingDetailModal.vue';
import reserveDetailModal from './modals/reserveDetailModal.vue';
import lotDetail from './tables/lotDetail.vue';
import lotSummaryTable from './tables/lotSummaryTable.vue';
import packageSummaryTable from './tables/packageSummaryTable.vue';
import packageTable from './tables/packageTable.vue';

const router = useRouter();
const route = useRoute();
console.warn('route', route);
const routeManager = new RouteMappingManager(route.name as string);
// const settlementId = ref<number | string>('');
const userStore = useUserStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('urlParams', urlParams);
const isBelowLimit = urlParams?.isBelowLimit || ''; // 库存预警
const readWrite = urlParams?.readWrite || '';
const isShowStatus = urlParams?.isShowStatus || 'Y'; // 默认显示库存状态
// const m = urlParams?.m === 'w2' ? 'w2' : 'w1';
const isNarcotic = urlParams?.isNarcotic || '';
// const parentTableParams = ref<{ [key: string]: any }>({});
const isFirstLoaded = ref(false); // 是否已初次加载完

const TabVal = {
  LotDetail: 'lotDetail',
  LotSummary: 'lotSummary',
  Package: 'package',
  PackageSummary: 'packageSummary',
} as const;

const lotDetailRef = useTemplateRef('lotDetailRef');
const lotSummaryTableRef = useTemplateRef('lotSummaryTableRef');
const packageTableRef = useTemplateRef('packageTableRef');
const packageSummaryTableRef = useTemplateRef('packageSummaryTableRef');
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(3, async () => {
  await nextTick();
  // ChcGridApi.query();
  isFirstLoaded.value = true;
});

// 父表
const summaryRow = reactive<{
  totalPOAmt: number | string;
  totalPricePOAmt: number | string;
  totalQtyOnHand: number | string;
}>({
  totalQtyOnHand: '0.00',
  totalPOAmt: '0.00',
  totalPricePOAmt: '0.00',
});
const [ReserveDetailModal, ReserveDetailModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: reserveDetailModal,
});
const [MovingDetailModal, MovingDetailModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: movingDetailModal,
});

/**
 * 通用的批次查询跳转函数
 */
const navigateToDetailQuery = (row: any, options?: any) => {
  router.push({
    path: routeManager.getRoute('storageDetailQuery'),
    query: {
      autoLoad: 'Y',
      warehouseId: row.warehouseId,
      productName: `=${row.productCode}`,
      storageStatus: row.storageStatus,
      isReload: 'Y',
      ...options,
    },
  });
};

// 父表列定义 — 中心库与非中心库使用不同的列顺序
const _baseColumns: Record<
  string,
  GridColumn & { searchOptions?: SearchOptions }
> = {
  productCode: {
    field: 'productCode',
    title: '药品编码',
    width: '100',
    sortable: true,
  },
  productUserCode: {
    field: 'productUserCode',
    title: '自定义编码',
    width: '120',
    sortable: true,
  },
  productName: {
    field: 'productName',
    title: '药品名称',
    width: '170',
    sortable: true,
  },
  productSpec: {
    field: 'productSpec',
    title: '规格',
    width: '90',
    formatter: ({ row }: { row: any }) => {
      return (
        row.productSpec +
        (row.modelNo && row.modelNo !== row.productSpec
          ? `/${row.modelNo}`
          : '')
      );
    },
    sortable: true,
  },
  manufacturer: {
    field: 'manufacturer',
    title: '厂家',
    width: '150',
    sortable: true,
  },
  insurance: {
    field: 'insurance',
    title: '医保编码',
    width: '150',
    sortable: true,
  },
  standardCode: {
    field: 'standardCode',
    title: '贯标编码',
    width: '150',
    sortable: true,
    visible: false,
  },
  uomName: {
    field: 'uomName',
    title: '单位',
    width: '40',
    sortable: false,
  },
  defaultVendorName: {
    field: 'defaultVendorName',
    title: '默认供应商',
    width: '100',
    sortable: false,
  },
  qtyAvailable: {
    field: 'qtyAvailable',
    title: '可用数量',
    width: 90,
    align: 'right',
    sortable: true,
  },
  qtyMinAvailable: {
    field: 'qtyMinAvailable',
    title: '可用最小数量',
    width: 120,
    align: 'right',
    sortable: true,
  },
  qtyOnHand: {
    field: 'qtyOnHand',
    title: '在库数量',
    width: 90,
    align: 'right',
    sortable: true,
    slots: {
      default: (scope) => {
        return h(
          Button,
          {
            size: 'small',
            type: 'link',
            'data-testid': `button_qtyOnHand_${scope.rowIndex}`,
            onClick: () => {
              console.warn('单元格点击', scope);
              navigateToDetailQuery(scope.row);
            },
          },
          { default: () => scope.row.qtyOnHand },
        );
      },
    },
  },
  qtyMinOnHand: {
    field: 'qtyMinOnHand',
    title: '在库最小数量',
    width: 120,
    align: 'right',
    sortable: true,
  },
  baseUomName: {
    field: 'baseUomName',
    title: '最小数量单位',
    width: 110,
  },
  qtyOnHandMPackage: {
    field: 'qtyOnHandMPackage',
    title: '在库中包数',
    width: '100',
    align: 'right',
    sortable: true,
    slots: {
      default: (scope) => {
        return h(
          Button,
          {
            size: 'small',
            type: 'link',
            'data-testid': `button_qtyOnHandMPackage_${scope.rowIndex}`,
            onClick: () => {
              console.warn('单元格点击', scope);
            },
          },
          { default: () => scope.row.qtyOnHandMPackage },
        );
      },
    },
  },
  qtyReserved: {
    field: 'qtyReserved',
    title: '保留数量',
    width: 90,
    align: 'right',
    sortable: true,
    slots: {
      default: (scope) => {
        return h(
          Button,
          {
            size: 'small',
            type: 'link',
            'data-testid': `button_qtyReserved_${scope.rowIndex}`,
            onClick: () => {
              console.warn('单元格点击', scope);
              ReserveDetailModalApi.setData({
                row: scope.row,
              }).open();
            },
          },
          { default: () => scope.row.qtyReserved },
        );
      },
    },
  },
  qtyMoving: {
    field: 'qtyMoving',
    title: '院内在途',
    width: 90,
    align: 'right',
    sortable: true,
    slots: {
      default: (scope) => {
        return h(
          Button,
          {
            size: 'small',
            type: 'link',
            'data-testid': `button_qtyMoving_${scope.rowIndex}`,
            onClick: () => {
              console.warn('单元格点击', scope);
              MovingDetailModalApi.setData({
                row: scope.row,
              }).open();
            },
          },
          { default: () => scope.row.qtyMoving },
        );
      },
    },
  },
  proQtyMoving: {
    field: 'proQtyMoving',
    title: '采购在途',
    width: 120,
    align: 'right',
    sortable: true,
  },
  qtyBundleOnHand: {
    field: 'qtyBundleOnHand',
    title: '整件在库',
    width: 90,
    align: 'right',
    sortable: true,
    slots: {
      default: (scope) => {
        return h(
          Button,
          {
            size: 'small',
            type: 'link',
            'data-testid': `button_qtyBundleOnHand_${scope.rowIndex}`,
            onClick: () => {
              console.warn('单元格点击', scope);
              router.push({
                path: '/warehouse/package/query',
                query: {
                  autoLoad: 'Y',
                  warehouseId: scope.row.warehouseId,
                  productName: `=${scope.row.productCode}`,
                  storageStatus: scope.row.storageStatus,
                  packageStatus:
                    scope.column.field === 'qtyBundleOnHand' ? 'S' : 'M',
                  isReload: 'Y',
                },
              });
            },
          },
          { default: () => scope.row.qtyBundleOnHand },
        );
      },
    },
  },
  qtyScatterOnHand: {
    field: 'qtyScatterOnHand',
    title: '散件在库',
    width: 90,
    align: 'right',
    sortable: true,
    slots: {
      default: (scope) => {
        return h(
          Button,
          {
            size: 'small',
            type: 'link',
            'data-testid': `button_qtyScatterOnHand_${scope.rowIndex}`,
            onClick: () => {
              console.warn('单元格点击', scope);
              navigateToDetailQuery(scope.row, {
                isScatter: 'Y',
              });
            },
          },
          { default: () => scope.row.qtyScatterOnHand },
        );
      },
    },
  },
  priceList: {
    field: 'priceList',
    title: '当前零售价',
    width: 100,
    align: 'right',
    sortable: true,
    formatter({ cellValue }: any) {
      return handlePriceToFixedTwo(cellValue);
    },
  },
  priceListAmt: {
    field: 'priceListAmt',
    title: '当前零售金额',
    width: 120,
    align: 'right',
    sortable: true,
  },
  poAmt: {
    field: 'poAmt',
    title: '库存金额',
    width: 90,
    align: 'right',
    formatter({ cellValue }: any) {
      return handlePriceToFixedTwo(cellValue);
    },
    sortable: true,
  },
  pricePoAmt: {
    field: 'pricePoAmt',
    title: '进价金额',
    width: 90,
    align: 'right',
    formatter({ cellValue }: any) {
      return handlePriceToFixedTwo(cellValue);
    },
    sortable: true,
  },
  storageConditionName: {
    field: 'storageConditionName',
    title: '存储条件',
    width: 120,
    sortable: true,
  },
  storageStatusName: {
    field: 'storageStatusName',
    title: '库存状态',
    width: 120,
    visible: isBelowLimit === 'Y' || isShowStatus === 'N',
    sortable: true,
  },
  hasCert: {
    field: 'hasCert',
    title: '有无证照',
    width: '90',
    formatter: ({ cellValue }) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    sortable: true,
  },
  departmentName: {
    field: 'departmentName',
    title: '院区',
    width: '150',
    sortable: true,
  },
  warehouseName: {
    field: 'warehouseName',
    title: '仓库',
    width: '120',
    sortable: true,
  },
  insurancePaymentTypeName: {
    field: 'insurancePaymentTypeName',
    title: '医保支付类别',
    width: '120',
    sortable: true,
  },
  insurancePaymentRate: {
    field: 'insurancePaymentRate',
    title: '医保自付比例',
    width: '120',
    sortable: true,
  },
  certificateNo: {
    field: 'certificateNo',
    title: '批准文号',
    width: '100',
    sortable: true,
  },
  levelMax: {
    field: 'levelMax',
    title: '库存上限',
    width: 90,
    align: 'right',
    sortable: true,
  },
  levelMin: {
    field: 'levelMin',
    title: '库存下限',
    width: 90,
    align: 'right',
    sortable: true,
  },
};

/** 非中心库列顺序（旧顺序） */
const normalColumnOrder = [
  'productCode', // 药品编码
  'productUserCode', // 自定义编码
  'productName', // 药品名称
  'productSpec', // 规格
  'manufacturer', // 厂家
  'insurance', // 医保编码
  'standardCode', // 贯标编码
  'uomName', // 单位
  'defaultVendorName', // 默认供应商
  'qtyAvailable', // 可用数量
  'qtyMinAvailable', // 可用最小数量
  'qtyOnHand', // 在库数量
  'qtyMinOnHand', // 在库最小数量
  'baseUomName', // 最小数量单位
  'qtyOnHandMPackage', // 在库中包数
  'qtyReserved', // 保留数量
  'qtyMoving', // 院内在途
  'proQtyMoving', // 采购在途
  'qtyBundleOnHand', // 整件在库
  'qtyScatterOnHand', // 散件在库
  'priceList', // 当前零售价
  'priceListAmt', // 当前零售金额
  'poAmt', // 库存金额
  'pricePoAmt', // 进价金额
  'storageConditionName', // 存储条件
  'storageStatusName', // 库存状态
  'hasCert', // 有无证照
  'departmentName', // 院区
  'warehouseName', // 仓库
  'insurancePaymentTypeName', // 医保支付类别
  'insurancePaymentRate', // 医保自付比例
  'certificateNo', // 批准文号
  'levelMax', // 库存上限
  'levelMin', // 库存下限
];

/** 中心库列顺序（新顺序） */
const centralColumnOrder = [
  'productCode', // 药品编码
  'productUserCode', // 自定义编码
  'productName', // 药品名称
  'productSpec', // 规格
  'manufacturer', // 厂家
  'warehouseName', // 仓库
  'qtyOnHand', // 在库数量
  'qtyAvailable', // 可用数量
  'uomName', // 单位
  'qtyMinOnHand', // 在库最小数量
  'qtyMinAvailable', // 可用最小数量
  'baseUomName', // 最小数量单位
  'qtyMoving', // 院内在途
  'proQtyMoving', // 采购在途
  'qtyReserved', // 保留数量
  'priceList', // 当前零售价
  'poAmt', // 库存金额
  'pricePoAmt', // 进价金额
  'priceListAmt', // 当前零售金额
  'storageStatusName', // 库存状态
  'storageConditionName', // 存储条件
  'certificateNo', // 批准文号
  'defaultVendorName', // 默认供应商
  'departmentName', // 院区
  'insurancePaymentTypeName', // 医保支付类别
];

/** 中心库需隐藏的列 */
const centralHiddenFields = new Set([
  'qtyOnHandMPackage',
  'qtyBundleOnHand',
  'qtyScatterOnHand',
  'hasCert',
  'insurancePaymentRate',
  'levelMax',
  'levelMin',
]);

/** 构建列配置数组 */
function buildColumns(
  order: string[],
  isCentral: boolean,
): (GridColumn & { searchOptions?: SearchOptions })[] {
  const result: (GridColumn & { searchOptions?: SearchOptions })[] = [];

  // 根据是否预警添加 checkbox 或 radio
  if (isBelowLimit === 'Y') {
    result.push({
      type: 'checkbox',
      align: 'center',
      title: '多选',
      width: 50,
    });
  } else {
    result.push({
      type: 'radio',
      width: 60,
      visible: false,
      title: '单选',
    });
  }

  // 序号列
  result.push({ title: '序号', type: 'seq', width: 50, align: 'center' });

  // 按顺序添加业务列
  for (const field of order) {
    const col = { ..._baseColumns[field] } as GridColumn & {
      searchOptions?: SearchOptions;
    };

    // 中心库隐藏部分列
    if (isCentral && centralHiddenFields.has(field)) {
      col.visible = false;
    }

    result.push(col);
  }

  return result;
}

// 根据当前路由判断是否中心库，构建对应的列配置
const isCentralNow =
  route?.meta?.menuPageId === 'spd.web.wms.storage.query' ||
  route?.meta?.title === '中心库库存查询';

const fatherGridColumns: (GridColumn & { searchOptions?: SearchOptions })[] =
  isCentralNow
    ? buildColumns(centralColumnOrder, true)
    : buildColumns(normalColumnOrder, false);
const fatherTableCheckedRow = ref<Record<string, any>>({});
provide('fatherTableCheckedRow', fatherTableCheckedRow);
const formSchema = [
  {
    component: 'ChcSelect',
    fieldName: 'departmentId',
    label: '院区',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        placeholder: `请选择院区`,
        allowClear: true,
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          ChcGridApi.formApi?.setFieldValue(
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
    fieldName: 'warehouseId',
    label: '仓库',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/warehouse.do',
        placeholder: `请选择仓库`,
        triggerFields: ['departmentId', 'regionId'],
        paginate: false,
        showChooseAll: '',
        immediate: false,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          ChcGridApi.formApi?.setFieldValue(
            'warehouseId',
            isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
          );
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
            ChcGridApi.formApi?.getFieldComponentRef &&
            typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
            ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
            ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
          if (cond) {
            ChcGridApi.formApi.getFieldComponentRef(
              'warehouseId',
            ).params.dependencies = {
              regionId: values?.departmentId || -1,
              departmentId: values?.departmentId || -1,
            };
            ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            ChcGridApi.formApi?.getFieldComponentRef('warehouseId')?.fetchApi();
          }
        });
      },
    },
  },
  {
    component: 'Input',
    fieldName: 'productName',
    label: '药品',
    defaultValue: '',
    componentProps: () => {
      return {
        placeholder: '请输入药品',
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
    label: '药品类别',
  },
  {
    component: 'ChcSelect',
    fieldName: 'storageStatus',
    label: '库存状态',
    defaultValue: '',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/refList.do?id=1000346',
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
    fieldName: 'defaultVendorId',
    label: '默认供应商',
    defaultValue: '',
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
    component: 'ChcSelect',
    fieldName: 'hasCert',
    label: '有无证照',
    defaultValue: '',
    componentProps: () => {
      return {
        options: [
          { value: '', label: '全部' },
          { value: 'Y', label: '有' },
          { value: 'N', label: '无' },
        ],
        placeholder: ``,
        defaultValue: '',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
  },
  {
    component: 'ChcSelect',
    fieldName: 'isBelowLimit',
    label: '低于下限',
    defaultValue: '',
    componentProps: () => {
      return {
        options: [
          { value: '', label: '全部' },
          { value: 'N', label: '否' },
          { value: 'Y', label: '是' },
        ],
        placeholder: ``,
        defaultValue: '',
        paginate: false,
        filterByFrontEnd: true,
        showChooseAll: '',
        immediate: true,
      };
    },
  },
  {
    component: 'Input',
    fieldName: 'productUserCode',
    label: '自定义编码',
    defaultValue: '',
    componentProps: () => {
      return {
        placeholder: '请输入自定义编码',
        defaultValue: '',
      };
    },
  },
  {
    component: 'Checkbox',
    fieldName: 'isShowZero',
    label: '显示零库存',
    defaultValue: false,
    componentProps: () => {
      return {
        defaultValue: false,
      };
    },
  },
].filter((item) => {
  if (item.fieldName === 'isBelowLimit' && isBelowLimit === 'Y') {
    return false;
  }
  return true;
});
const [ChcGrid, ChcGridApi, { FormModal, LogModal, handleExport }] = useSpdGrid(
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
        if (row?.neerGuaranteeDate === 'Y') {
          return { color: 'red' };
        }
        return {};
      },
    }),
  },
  {
    id: 'storageQuery',
    // api地址
    queryUrl: '/storageAction/queryStorage.do',
    // showRadioRowTag: true,
    gridColumns: fatherGridColumns,
    showRadioRowTag: isBelowLimit === 'Y',
    // 表单配置
    formSchema,
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        console.warn('radioChange', row);
        // 请求子表  多个子表请求
        console.warn('子表请求 currentTab', currentTab.value);
        fatherTableCheckedRow.value = deepClone(row);
        if (isEmpty(row)) {
          fatherTableCheckedRow.value = {};
          lotDetailRef.value?.removeData();
          lotSummaryTableRef.value?.removeData();
          packageTableRef.value?.removeData();
          packageSummaryTableRef.value?.removeData();
          return;
        }
        switch (currentTab.value) {
          case TabVal.LotDetail: {
            lotDetailRef.value?.reload();

            break;
          }
          case TabVal.LotSummary: {
            lotSummaryTableRef.value?.reload();

            break;
          }
          case TabVal.Package: {
            packageTableRef.value?.reload();

            break;
          }
          case TabVal.PackageSummary: {
            packageSummaryTableRef.value?.reload();

            break;
          }
          // No default
        }
        await ChcGridApi.grid.clearCheckboxRow();
        ChcGridApi.grid.setCheckboxRow(row, true);
      },
    },
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      console.warn('beforeFetchFn params', params);
      params.isShowZero = params.isShowZero ? 'Y' : undefined;
      params.isNarcotic = isNarcotic;
      params.readWrite = readWrite;
      params.isShowStatus = isShowStatus;
      if (isBelowLimit === 'Y') {
        params.isBelowLimit = isBelowLimit;
      }
      return params;
    },
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      summaryRow.totalQtyOnHand =
        Math.round((params.summaryRow.totalQtyOnHand || 0) * 100) / 100;
      summaryRow.totalPOAmt =
        Math.round((params.summaryRow.totalPOAmt || 0) * 100) / 100;
      summaryRow.totalPricePOAmt =
        Math.round((params.summaryRow.totalPricePOAmt || 0) * 100) / 100;
      if (isEmpty(params?.rows)) {
        // 移除所有子表数据
        fatherTableCheckedRow.value = {};
        lotDetailRef.value?.removeData();
        lotSummaryTableRef.value?.removeData();
        packageTableRef.value?.removeData();
        packageSummaryTableRef.value?.removeData();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const headerTabs = ref([
  {
    label: '批号明细',
    value: 'lotDetail',
    disabled: false,
  },
  {
    label: '批号汇总',
    value: 'lotSummary',
    disabled: false,
  },
  {
    label: '定数明细',
    value: 'package',
    disabled: false,
  },
  {
    label: '定数汇总',
    value: 'packageSummary',
    disabled: false,
  },
]);

const currentTab = ref<(typeof TabVal)[keyof typeof TabVal]>(TabVal.LotDetail);

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  console.warn(
    '枚举值',
    TabVal.LotDetail,
    TabVal.LotSummary,
    TabVal.Package,
    TabVal.PackageSummary,
  );
  // 触发自动查询
  // searchController.sign();
});
const createPoPlan = () => {
  const records = ChcGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(records)) {
    message.warning('请选择记录！');
    return;
  }
  console.warn('createPoPlan', records);
  let total = 0;
  const created: any[] = [];
  let error = false;
  let msg = '';
  (records as any[]).forEach((item, index) => {
    if (!item.productId) {
      msg = `第${index + 1}选择行缺少商品！`;
      error = true;
      return;
    }

    created.push(item);
    total = total + 1;
  });
  if (error) {
    message.error(`错误: ${msg}`);
    return;
  }
  if (total <= 0) {
    message.error('请选择缺货品种生成采购计划！');
    return;
  }
  const lineData = { created };
  Modal.confirm({
    title: '提示',
    content: `确认创建${total}个品种，数量从当前库存到库存上限的采购计划吗？`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        const res = await requestFormClient.post(
          '/orderPlanAction/creatOrderPlanByBelowLimit.do',
          {
            lineData: JSON.stringify(lineData),
          },
        );
        if (res.success) {
          message.success('创建采购计划成功！');
          ChcGridApi.query();
        } else {
          message.error(`创建失败: ${res.msg}`);
        }
      } catch (error_) {
        console.error(error_);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ReserveDetailModal />
    <MovingDetailModal />
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <LogModal />
        <FormModal />
        <ChcGrid>
          <template #toolbar-tools>
            <span>在库数量汇总：{{ summaryRow.totalQtyOnHand }}</span>
            <span class="mx-5"> 库存总金额：{{ summaryRow.totalPOAmt }} </span>
            <span class=""> 进价总金额：{{ summaryRow.totalPricePOAmt }} </span>
          </template>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleExport"
              class="mr-[0.5rem]"
              data-testid="button_export_index"
            >
              导 出
              <template #icon>
                <ExportActionIcon />
              </template>
            </Button>
            <Button
              v-if="isBelowLimit === 'Y'"
              type="primary"
              @click="createPoPlan"
              class="mr-[0.5rem]"
              data-testid="button_create_po_plan_index"
            >
              生成采购
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <div
          class="relative box-border flex h-full w-full flex-col items-start justify-start bg-white"
        >
          <div class="box-border w-full bg-white p-[8.4px_8px]">
            <RadioGroup v-model:value="currentTab" button-style="solid">
              <template v-for="item in headerTabs" :key="item.value">
                <RadioButton :value="item.value" :disabled="item.disabled">
                  {{ item.label }}
                </RadioButton>
              </template>
            </RadioGroup>
          </div>
          <!-- absolute h-[calc(100%_-_45px)] -->
          <div class="bg-pink relative box-border w-full flex-1">
            <div class="absolute box-border h-full w-full">
              <lotDetail
                ref="lotDetailRef"
                v-show="currentTab === TabVal.LotDetail"
                v-model:current-tab="currentTab"
                :this-tab="headerTabs[0] as PageTab"
              />

              <lotSummaryTable
                ref="lotSummaryTableRef"
                v-show="currentTab === TabVal.LotSummary"
                v-model:current-tab="currentTab"
                :this-tab="headerTabs[1] as PageTab"
              />
              <packageTable
                ref="packageTableRef"
                v-show="currentTab === TabVal.Package"
                v-model:current-tab="currentTab"
                :this-tab="headerTabs[2] as PageTab"
              />
              <packageSummaryTable
                ref="packageSummaryTableRef"
                v-show="currentTab === TabVal.PackageSummary"
                v-model:current-tab="currentTab"
                :this-tab="headerTabs[3] as PageTab"
              />
            </div>
          </div>
        </div>
      </template>
    </PageSplitLazy>
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
