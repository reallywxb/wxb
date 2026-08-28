<script lang="ts" setup>
import type { GridColumn, SearchOptions } from '@vben/chc-ui';

import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  SvgDeleteIcon,
  SvgPrintFillIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import addAsnTraceCodeModalComp from './modals/addAsnTraceCodeModal.vue';
import editAsnTraceCodeModalComp from './modals/editAsnTraceCodeModal.vue';
import sonGridRowDetailModalComp from './modals/sonGridRowDetailModal.vue';

const globalPrintStore = useGlobalPrintStore();
const route = useRoute();
const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('urlParams', urlParams);
const isProductControlLevel = computed(
  () => userStore.userInfo?.isProductControlLevel,
);
const isSaas = computed(() => userStore.userInfo?.isSaas);
const isCrossDocking = urlParams?.isCrossDocking || '';
const isSurgery = urlParams?.isSurgery || '';
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(4, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  const formValues = await fatherGridApi?.formApi?.getValues();
  console.log(
    'searchController formValues',
    JSON.parse(JSON.stringify(formValues)),
  );
  fatherGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;

  fatherGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(4);
});
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    fatherGridApi.formApi?.getFieldComponentRef &&
    typeof fatherGridApi.formApi?.getFieldComponentRef === 'function' &&
    fatherGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};
const fatherTableCheckedRow = ref<Record<string, any>>({});
let fatherGridColumns: (GridColumn & { hidden?: boolean } & {
  searchOptions?: SearchOptions;
})[] = [
  { title: '单选', type: 'radio', width: 120, visible: false },
  {
    type: 'checkbox',
    title: '多选',
    align: 'center',
    width: 50,
  },
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'orgName',
    title: '机构',
    width: '110',
    sortable: true,
    hidden: !isSaas.value,
  },
  {
    field: 'asnNo',
    title: '配送单号',
    width: '110',
    sortable: true,
  },
  {
    field: 'dateArrived',
    title: '配送时间',
    width: '100',
    sortable: true,
  },
  {
    field: 'bpartnerName',
    title: '供应商',
    width: '200',
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
    title: '采购仓库',
    width: '150',
    sortable: true,
  },
  {
    field: 'asnStatusName',
    title: '验收状态',
    width: '100',
    sortable: true,
  },
  {
    field: 'productControlLevelName',
    title: '商品组',
    hidden: !isProductControlLevel.value,
    width: '100',
    sortable: true,
  },
  {
    field: 'totalAmt',
    title: '金额',
    width: '100',
    sortable: true,
    align: 'right',
  },
  {
    field: 'receiptTypeName',
    title: '采购类型',
    width: '100',
    sortable: true,
  },
  {
    field: 'description',
    title: '备注',
    // width: '150',
    sortable: true,
  },
];
fatherGridColumns = fatherGridColumns.filter((item) => {
  if (item?.hidden === true) {
    return false;
  }
  return true;
});

const onCheckboxChange = ({ row, checked }: { checked: boolean; row: any }) => {
  console.warn('onCheckboxChange', row, checked);
  if (checked) {
    fatherGridApi.grid.setCheckboxRow(row, true);
    fatherTableCheckedRow.value = row;
    sonGridApi.reload();
  } else {
    const checkedRows = fatherGridApi.grid.getCheckboxRecords(true);
    // console.warn('checkedRows', checkedRows[0].asnId);
    if (checkedRows.length === 0) {
      fatherTableCheckedRow.value = {};
      sonGridApi.grid.remove(sonGridApi.grid.getFullData());
      grandSonApi.grid.remove(grandSonApi.grid.getFullData());
    }
  }
};

const orgFirstOptionId = ref('');
const [FatherGrid, fatherGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateRange', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      handleReset: async () => {
        await fatherGridApi?.formApi?.resetForm();
        const formValues = await fatherGridApi?.formApi?.getValues();
        const realFormValues = {
          ...formValues,
          orgId: orgFirstOptionId.value,
        };
        console.warn('handleReset', realFormValues);
        await fatherGridApi?.formApi?.setValues({ ...realFormValues });
        setTimeout(() => {
          // 定时器主要是防止和dependencies的请求重复导致orgId为-1
          nextTick(() => {
            const c = isFieldComponentRefExist('warehouseId');
            console.warn('handleReset isFieldComponentRefExist warehouseId', c);
            if (c) {
              const refInst = fatherGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                fatherGridApi.formApi?.setFieldValue('warehouseId', undefined);
                refInst.params.dictUrl = `/baseHandleAction/warehouse.do?readWrite=Y&orgId=${realFormValues?.orgId || -1}&regionId=${realFormValues?.departmentId || -1}`;
                if (typeof refInst?.fetchApi === 'function') {
                  console.warn('handleReset warehouseId fetchApi');
                  refInst.fetchApi();
                }
              }
            }
          });
        }, 100);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      // checkboxConfig: {
      //   trigger: 'row',
      //   highlight: true,
      // },
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
    id: 'asnTraceCode',
    queryUrl: `/asnAction/query.do?page=query&asnType=PO&isSurgery=${
      isSurgery
    }&isCrossDocking=${isCrossDocking}`,
    showRadioRowTag: true,
    gridColumns: fatherGridColumns,
    // 表单配置
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'orgId',
        label: '机构',
        formItemClass: `col-span-1${isSaas.value ? '' : ' hidden'}`,
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/userOrgList.do',
            defaultValue: '',
            placeholder: '请选择机构',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              fatherGridApi.formApi?.setFieldValue(
                'orgId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              orgFirstOptionId.value = res.rows[0]?.id || '';
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '配送时间',
        formItemClass: 'col-span-1',
        defaultValue: [
          // 七天前
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        ],
      },
      {
        component: 'ChcSelect',
        fieldName: 'bpartnerId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            defaultValue: '',
            placeholder: '请选择供应商',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: false,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              fatherGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              searchController.sign(2);
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        label: '采购仓库',
        fieldName: 'warehouseId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择采购仓库',
            paginate: false,
            showChooseAll: '',
            labelField: 'name',
            immediate: false,
            valueField: 'id',
            triggerFields: ['departmentId', 'orgId', 'regionId'],
            afterFetch(res: any) {
              // 此页面的采购仓库只有一级库   禅道489
              const filteredRows =
                res.rows?.filter(
                  (item: any) =>
                    item.warehouseType === '1' || item.warehouseType === 1,
                ) || [];
              fatherGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(filteredRows?.[0]?.id) ? '' : filteredRows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(3);
              }

              return { ...res, rows: undefined, records: filteredRows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'orgId', 'regionId'],
          trigger(values: any) {
            nextTick(() => {
              const cond = !!(
                fatherGridApi.formApi?.getFieldComponentRef &&
                typeof fatherGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                fatherGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                fatherGridApi.formApi?.getFieldComponentRef('warehouseId')
                  .params
              );
              if (cond) {
                fatherGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  orgId: values?.orgId || -1,
                  departmentId: values?.departmentId || -1,
                  regionId: values?.departmentId || -1,
                };
                fatherGridApi.formApi?.setFieldValue('warehouseId', undefined);
                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  fatherGridApi.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                }, 100);
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'applyBPartnerId',
        label: '直配仓库',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/warehouseBPartner.do?level2=Y&accessAll=Y',
            placeholder: '请选择直配仓库',
            paginate: false,
            showChooseAll: '',
            autoChooseFirstOption: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'asnNo',
        label: '配送单号',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请输入配送单号',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'invoiceNo',
        label: '发票号',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请输入发票号',
          };
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
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'asnStatus',
        label: '收货状态',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000567',
            placeholder: '请选择收货状态',
            paginate: false,
            showChooseAll: '',
            autoChooseFirstOption: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'receiptType',
        label: '采购类型',
        defaultValue: ['0', '1', '2', '3', '4'],
        componentProps: () => {
          return {
            dictUrl: '/orderPlanAction/receiptTypeList.do?classify=PO',
            placeholder: '请选择采购类型',
            paginate: false,
            showChooseAll: '',
            autoChooseFirstOption: false,
            labelField: 'name',
            valueField: 'id',
            mode: 'multiple',
            maxTagCount: 2,
            onChange(value: any[]) {
              console.warn('receiptType onChange', value);
              if (value.includes('')) {
                fatherGridApi.formApi?.setFieldValue('receiptType', ['']);
              }
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        if (row && row.asnId) {
          fatherTableCheckedRow.value = row;
          await fatherGridApi.grid.clearCheckboxRow();
          fatherGridApi.grid.setCheckboxRow(row, true);
          const formValues = sonGridApi.formApi?.getValues();
          sonGridApi.reload({ ...formValues });
        } else {
          fatherTableCheckedRow.value = {};
          sonGridApi.grid.remove(sonGridApi.grid.getFullData());
          grandSonApi.grid.remove(grandSonApi.grid.getFullData());
        }
      },
      // checkboxChange: ({ records }: { records: any[] }) => {
      //   console.warn('父表格 checkboxChange', records);
      //   const rows: any[] = fatherGridApi.grid.getCheckboxRecords(true);
      //   console.warn('父表格 checkboxChange rows', rows);
      //   if (isEmpty(rows)) {
      //     sonGridApi.grid.remove();
      //     grandSonApi.grid.remove();
      //   } else {
      //     // const firstRow = rows[0];
      //     const firstRow = rows.pop();
      //     console.log('firstRow', firstRow.asnId);
      //     fatherTableCheckedRow.value = toRaw(firstRow);
      //     sonGridApi.query();
      //   }
      // },
      // checkboxChange: onCheckboxChange,
      // checkboxAll: onCheckboxChange,
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      console.warn('beforeFetchFn params', params);
      if (Array.isArray(params.receiptType)) {
        params.receiptType = params.receiptType.join(',');
      }
      return params;
    },
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      sonGridApi.grid.reloadData([]);
      const rows: any[] = params.rows || [];
      if (isEmpty(rows)) {
        fatherTableCheckedRow.value.asnId = 0;
      } else {
        const firstRow = rows[0];
        fatherTableCheckedRow.value = firstRow;
        setTimeout(() => {
          fatherGridApi.grid.setCheckboxRow(firstRow, true);
          onCheckboxChange({ row: firstRow, checked: true });
        }, 0);
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 冷链图片打印
const handlePrintColdChainImg = () => {
  console.warn('handlePrintColdChainImg');
  const records: any[] = fatherGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(records)) {
    return message.error('请选择一条记录');
  }
  if (records.length > 1) {
    return message.error('每次查看一个冷链照片');
  }
  // TODO:选中的行值未用到，实际功能貌似有问题
  Modal.confirm({
    title: '打印提示',
    content: '确认查看冷链照片吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/asnAction/viewAsnPicture.do?attachmentId=1000041&index=0`,
      });
    },
    onCancel() {},
  });
};
// SCP获取追溯码
const getTraceCode = () => {
  const records: any[] = fatherGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(records)) {
    return message.error('请选择一条记录');
  }
  Modal.confirm({
    title: '提示',
    content: '确认获取追溯吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        const res = await requestFormClient.post('/asnAction/getTracCode.do', {
          asnId: JSON.stringify((records as any[]).map((item) => item.asnId)),
        });
        if (res.msg) {
          message.success(res.msg);
        } else {
          message.success('获取成功');
        }
        // grandSonApi.query();
      } catch (error) {
        console.error('获取追溯码失败', error);
      }
    },
    onCancel() {},
  });
};
// SCP获取小码
const getPackLayer = () => {
  const records: any[] = fatherGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(records)) {
    return message.error('请选择一条记录');
  }
  Modal.confirm({
    title: '提示',
    content: '确认获取盒码吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        // TODO:接口报错
        await requestFormClient.post('/asnAction/getPackLayer.do', {
          asnId: JSON.stringify((records as any[]).map((item) => item.asnId)),
        });
        message.success('获取成功');
        // grandSonApi.query();
      } catch (error) {
        console.error('获取追溯码失败', error);
      }
    },
    onCancel() {},
  });
};
// 码上放心获取小码
const getTranceCodePackInfo = () => {
  const records: any[] = fatherGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(records)) {
    return message.error('请选择一条记录');
  }
  Modal.confirm({
    title: '提示',
    content: '确认获取小码吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await requestFormClient.post('/asnAction/getTrancCodePackInfo.do', {
          asnId: JSON.stringify((records as any[]).map((item) => item.asnId)),
        });
        message.success('获取成功');
        // grandSonApi.query();
      } catch (error) {
        console.error('码上放心获取小码失败', error);
      }
    },
    onCancel() {},
  });
};
// 子表
const sonTableCheckedRow = ref<Record<string, any>>({});
const [SonChcGrid, sonGridApi, { SonGridRowDetailModal }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      wrapperClass: 'grid-cols-3 ',
      handleSubmit: async () => {
        const formValues = await sonGridApi.formApi.getValues();
        sonGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        if (isEmpty(fatherTableCheckedRow.value)) {
          return;
        }
        sonGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.error || row.qtyCheckLeft > 0) {
          return {
            color: 'red',
          };
        }
        return {};
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        defaultValue: '',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            placeholder: '请输入药品',
          };
        },
      },
    ],
    gridColumns: [
      {
        title: '单选',
        type: 'radio',
        width: 50,
        align: 'center',
        visible: false,
      },
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
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '130',
        sortable: true,
      },
      // {
      //   field: 'modelNo',
      //   title: '型号',
      //   width: '130',
      //   sortable: true,
      // },
      {
        field: 'manufacturer',
        title: '生产厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '90',
        sortable: true,
      },
      // {
      //   field: 'replenishPackageQty',
      //   title: '定数',
      //   width: '80',

      //   sortable: true,
      //   formatter: ({ cellValue, row }) => {
      //     console.warn('replenishPackageQty cellValue', cellValue);
      //     console.warn('replenishPackageQty row', row);
      //     return row.isPackaged === 'Y' ? cellValue : '/';
      //   },
      // },
      // {
      //   field: 'packageCountArrived',
      //   title: '到货包数',
      //   width: '100',
      // },
      // {
      //   field: 'packageCountCheckLeft',
      //   title: '待验收包数',
      //   width: '120',
      // },
      // {
      //   field: 'packageCountChecked',
      //   title: '已验收包数',
      //   width: '120',
      // },
      // {
      //   field: 'packageCountPutawayLeft',
      //   title: '待上架包数',
      //   width: '120',
      // },
      // {
      //   field: 'packageCountPutawayed',
      //   title: '已上架包数',
      //   width: '120',
      // },
      // {
      //   field: 'packageCountRejected',
      //   title: '拒收包数',
      //   width: '120',
      // },
      // {
      //   field: 'qtyArrived',
      //   title: '到货数量',
      //   width: '100',
      //   align: 'right',
      //   sortable: true,
      //   slots: {
      //     default: (scope) => {
      //       return h(
      //         Button,
      //         {
      //           size: 'small',
      //           type: 'link',
      //           'data-testid': `button_qtyArrived_${scope.rowIndex}`,
      //           onClick: () => {
      //             console.warn('单元格点击', scope);
      //             sonGridRowDetailModalApi
      //               ?.setData({
      //                 modalTitle: '到货包装',
      //                 row: toRaw(scope.row),
      //               })
      //               ?.open();
      //           },
      //         },
      //         { default: () => scope.row.qtyArrived },
      //       );
      //     },
      //   },
      // },
      // {
      //   field: 'qtyCheckLeft',
      //   title: '待验收数量',
      //   width: '110',
      //   align: 'right',
      //   sortable: true,
      // },
      // {
      //   field: 'qtyChecked',
      //   title: '已验收数量',
      //   width: '110',
      //   align: 'right',
      //   sortable: true,
      //   slots: {
      //     default: (scope) => {
      //       return h(
      //         Button,
      //         {
      //           size: 'small',
      //           type: 'link',
      //           style: {
      //             color: 'red',
      //           },
      //           'data-testid': `button_qtyChecked_${scope.rowIndex}`,
      //           onClick: () => {
      //             console.warn('单元格点击', scope);
      //             sonGridRowDetailModalApi
      //               ?.setData({
      //                 modalTitle: '已验收包装',
      //                 checkStatus: 'Y',
      //                 row: toRaw(scope.row),
      //               })
      //               ?.open();
      //           },
      //         },
      //         { default: () => scope.row.qtyChecked },
      //       );
      //     },
      //   },
      // },
      // {
      //   field: 'qtyPutawayLeft',
      //   title: '待上架数量',
      //   width: '110',
      //   align: 'right',
      //   sortable: true,
      // },
      // {
      //   field: 'qtyPutawayed',
      //   title: '已上架数量',
      //   width: '110',
      //   align: 'right',
      //   sortable: true,
      // },
      // {
      //   field: 'qtyReceived',
      //   title: '入库数量',
      //   width: '100',
      //   sortable: true,
      // },
      // {
      //   field: 'qtyRejected',
      //   title: '拒收数量',
      //   width: '110',
      //   align: 'right',
      //   sortable: true,
      // },
      // {
      //   field: 'qtyInvoiced',
      //   title: '开票数量',
      //   width: '90',
      //   sortable: true,
      //   align: 'right',
      // },
      // {
      //   field: 'priceActual',
      //   title: '到货价格',
      //   width: '100',
      //   sortable: true,
      //   align: 'right',
      // },
      // {
      //   field: 'lineAmt',
      //   title: '行金额',
      //   width: '100',
      //   sortable: true,
      //   align: 'right',
      // },
      // {
      //   field: 'lot',
      //   title: '批号',
      //   width: '110',
      //   sortable: true,
      // },
      // {
      //   field: 'guaranteeDate',
      //   title: '效期',
      //   width: '110',
      //   sortable: true,
      // },
      // {
      //   field: 'locatorName',
      //   title: '货位',
      //   width: '120',
      //   sortable: true,
      // },
      // {
      //   field: 'checkerName',
      //   title: '验收人',
      //   width: '100',
      //   sortable: false,
      // },
      // {
      //   field: 'checkTime',
      //   title: '验收时间',
      //   width: '120',
      //   sortable: false,
      // },
      // {
      //   field: 'putawayName',
      //   title: '上架人',
      //   width: '100',
      //   sortable: false,
      // },
      // {
      //   field: 'putawayTime',
      //   title: '上架时间',
      //   width: '120',
      //   sortable: false,
      // },
      // {
      //   field: 'rejectReasonName',
      //   title: '拒收原因',
      //   width: '120',
      //   sortable: false,
      // },
      // {
      //   field: 'description',
      //   title: '备注',
      //   width: '120',
      //   sortable: false,
      // },
      // {
      //   field: 'result',
      //   title: '验收结论',
      //   width: '120',
      //   sortable: false,
      // },
    ],
    id: 'asnTraceCode_son',
    queryUrl: '/asnAction/queryDetail.do',
    showCustomBtn: true,
    showZoomBtn: true,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('子表 radioChange', row);
        if (isEmpty(row)) {
          sonTableCheckedRow.value = {};
          grandSonApi.grid.remove();
        } else {
          sonTableCheckedRow.value = toRaw(row);
          grandSonApi.reload();
        }
      },
    },
    beforeFetchFn: (params) => {
      // console.log(
      //   '子表查询 - 使用的 asnId:',
      //   fatherTableCheckedRow.value?.asnId,
      // );
      return { ...params, asnId: fatherTableCheckedRow.value.asnId };
    },
    afterFetchFn: (params) => {
      if (isEmpty(params.rows)) {
        grandSonApi.grid.reloadData([]);
      }
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'SonGridRowDetailModal-sonGridRowDetailModalApi': deepMerge(
        importModalDefaultOptions,
        {
          // 连接抽离的组件
          connectedComponent: sonGridRowDetailModalComp,
        },
      ),
    },
  },
);
// 打印配送单
const handlePrint = () => {
  console.warn('打印配送单');
  const record = sonGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择一条记录');
  }
  Modal.confirm({
    title: '打印提示',
    content: '确认打印到货单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/asnAction/printAsnLineDoc.do?id=${record.asnLineId}`,
      });
    },
    onCancel() {},
  });
};

//  孙表
const [
  GrandSon,
  grandSonApi,
  {
    EditAsnTraceCodeModal,
    editAsnTraceCodeModalApi,
    AddAsnTraceCodeModal,
    addAsnTraceCodeModalApi,
  },
] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      wrapperClass: 'grid-cols-2 ',
      handleSubmit: async () => {
        const formValues = await grandSonApi.formApi.getValues();
        grandSonApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        if (isEmpty(sonTableCheckedRow.value)) {
          return;
        }
        grandSonApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [
      {
        component: 'Input',
        fieldName: 'tracCode',
        label: '追溯码',
        defaultValue: '',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            placeholder: '请输入追溯码',
          };
        },
      },
    ],
    gridColumns: [
      {
        title: '单选',
        type: 'radio',
        width: 50,
        align: 'center',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'tracCode',
        title: '追溯码',
        width: '180',
        sortable: true,
      },
      {
        field: 'packLayerName',
        title: '层级',
        width: '180',
        sortable: true,
      },
      {
        field: 'parentTraccode',
        title: '上级追溯码',
        width: '180',
        sortable: true,
      },
      {
        field: 'right',
        title: '操作',
        width: 150,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    id: 'asnTraceCode_grandSon',
    queryUrl: '/asnAction/queryTracCode.do',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return { ...params, asnLineId: sonTableCheckedRow.value.asnLineId };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'EditAsnTraceCodeModal-editAsnTraceCodeModalApi': deepMerge(
        importModalDefaultOptions,
        {
          // 连接抽离的组件
          connectedComponent: editAsnTraceCodeModalComp,
        },
      ),
      'AddAsnTraceCodeModal-addAsnTraceCodeModalApi': deepMerge(
        importModalDefaultOptions,
        {
          // 连接抽离的组件
          connectedComponent: addAsnTraceCodeModalComp,
        },
      ),
    },
  },
);
// 删除
const handleGandSonRowDelete = (row: any) => {
  Modal.confirm({
    title: '提示',
    content: '确认删除追溯吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await requestFormClient.post('/asnAction/deleteAsnTracCode.do', {
          asnTracCodeId: row.asnTracCodeId,
        });
        message.success('删除成功');
        grandSonApi.reload();
      } catch (error) {
        console.error('删除失败', error);
      }
    },
    onCancel() {},
  });
};
// 编辑
const handleGrandSonEdit = (row: any) => {
  editAsnTraceCodeModalApi
    ?.setData({
      modalTitle: '修改追溯码',
      row: toRaw(row),
      callback() {
        grandSonApi.reload();
      },
    })
    .open();
};
// 新增
const handleGrandSonAdd = () => {
  const row = sonGridApi.grid.getRadioRecord(true);
  if (isEmpty(row)) {
    message.error('请选择一条明细行记录');
    return;
  }
  addAsnTraceCodeModalApi
    ?.setData({
      row: toRaw(row),
      callback() {
        sonGridApi.reload();
      },
    })
    .open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <EditAsnTraceCodeModal />
    <AddAsnTraceCodeModal />
    <SonGridRowDetailModal />
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <FatherGrid>
          <template #toolbar-actions>
            <Button
              v-if="false"
              type="primary"
              class="mr-[0.5rem]"
              @click="handlePrintColdChainImg"
              data-testid="button_print_fatherGrid"
            >
              冷链图片
              <template #icon>
                <SvgPrintFillIcon />
              </template>
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              data-testid="button_getTraceCode_fatherGrid"
              @click="getTraceCode"
            >
              SCP获取追溯码
            </Button>
            <Button
              v-if="false"
              type="primary"
              class="mr-[0.5rem]"
              data-testid="button_getPackLayer_fatherGrid"
              @click="getPackLayer"
            >
              SCP获取小码
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              data-testid="button_getTranceCodePackInfo_fatherGrid"
              @click="getTranceCodePackInfo"
            >
              码上放心获取小码
            </Button>
          </template>
        </FatherGrid>
      </template>
      <template #second>
        <PageSplitLazy
          :distribute="0.6"
          :line-thickness="6"
          :is-vertical="true"
          background-color="#f1f3f6"
          hover-color="#c0c4cc"
          :has-line-tip="true"
        >
          <template #first>
            <SonChcGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="handlePrint"
                  data-testid="button_print_songGrid"
                >
                  打印配送单
                  <template #icon>
                    <SvgPrintFillIcon />
                  </template>
                </Button>
              </template>
            </SonChcGrid>
          </template>
          <template #second>
            <GrandSon>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  data-testid="button_add_grandSon"
                  @click="handleGrandSonAdd"
                >
                  新增
                  <template #icon>
                    <AddActionIcon />
                  </template>
                </Button>
              </template>
              <template #action="scope">
                <Button
                  ghost
                  type="primary"
                  class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                  :data-testid="`button_edit_${scope.rowIndex}_grandSon`"
                  @click="handleGrandSonEdit(scope.row)"
                >
                  修改
                  <template #icon>
                    <EditActionIcon />
                  </template>
                </Button>
                <Button
                  type="primary"
                  danger
                  class="mr-[0.5rem]"
                  :data-testid="`button_delete_${scope.rowIndex}_grandSon`"
                  @click="handleGandSonRowDelete(scope.row)"
                >
                  删除
                  <template #icon>
                    <SvgDeleteIcon />
                  </template>
                </Button>
              </template>
            </GrandSon>
          </template>
        </PageSplitLazy>
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}

::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-buttons--wrapper:not(:empty),

) {
  padding: 0 0 0.6em;
}

::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-tools--operate:not(:empty)
) {
  padding: 0 0 0.6em;
}

::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-tools--wrapper:not(:empty)
) {
  padding: 0 0 0.6em;
}

::v-deep(.vxe-cell .ant-btn > svg) {
  margin-right: -4px;
  margin-bottom: 4px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-buttons--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.ant-input-disabled) {
  color: #7c7c7c;
}

::v-deep(.ant-picker .ant-picker-input > input[disabled]) {
  color: #7c7c7c;
}

::v-deep(
  .ant-select-disabled.ant-select:not(.ant-select-customize-input)
    .ant-select-selector
) {
  color: #7c7c7c;
}
</style>
