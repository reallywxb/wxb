<script setup lang="ts">
import { h, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  SearchActionIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { importModalDefaultOptions, useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { copyApplyPlan, dataCommit, deleteApplyPlan } from './api';
import ImportModalComp from './modals/importModal.vue';
import { ChcSelect } from '@vben/chc-ui';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
  }>(),
  {},
);
const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
const urlParams = {
  specShowType: urlParamsObj?.specShowType || '',
};
// const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
console.warn(userStore.userInfo);
// const orgId = userStore.userInfo?.orgId || null;
const isProductControlLevel = userStore.userInfo?.isProductControlLevel || null; // chcAppConfig.isProductControlLevel
// const detailConfig = defineModel<DetailInfo | undefined>('detailConfig');
const parentTableParams = ref<{ [key: string]: any }>({
  applyPlanId: undefined,
  productName: undefined,
});

const currentTab = defineModel<number>('currentTab', { required: true });
const selectToWarehouseId = ref<number>(0);
// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
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
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '75',
        sortable: true,
      },
      {
        field: 'replenishPackageQty',
        title: '定数',
        minWidth: '80',
        sortable: true,
        visible: false,
      },
      {
        field: 'qtyApplied',
        title: '计划数量',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        title: '库存数量',
        minWidth: '120',
        sortable: true,
      },
      // {
      //   field: 'qtyConfirmed',
      //   title: '已移动数量',
      //   minWidth: '120',
      //   slots: {
      //     default: 'qtyConfirmed_default',
      //   },
      //   // hover: true,
      //   sortable: true,
      // },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
      },
    ],
    showExportBtn: false,
    id: 'child',
    queryUrl: `/applyPlanAction/queryLine.do?specShowType=${urlParams.specShowType}`,
    beforeFetchFn: (params) => {
      if (isEmpty(parentTableParams.value?.applyPlanId)) {
        return false;
      }
      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const commitRow = ref<any>({});
const departmentId = ref<number | string>('');
// 父表
const [ChcGrid, chcGridApi, { ImportModal, importModalApi }] = useSpdGrid(
  {
    formOptions: {
      // fieldMappingTime: [
      //   ['applyPlanDate', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
      // ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      showCollapseButton: false,
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    queryUrl: 'applyPlanAction/query.do?&page=input',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
      },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'applyPlanNo',
        title: '申请单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'dateApplied',
        title: '申请时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'applyPlanMonth',
        title: '计划月份',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '上级仓库',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'toWarehouseName',
        title: '申请仓库',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '商品组',
        minWidth: '100',
        sortable: true,
        visible: isProductControlLevel,
      },
      {
        field: 'rejectReason',
        title: '退回原因',
        width: '150',
      },
      {
        field: 'createdByName',
        title: '创建人',
        width: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        width: '160',
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
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
        width: 150,
      },
    ],
    formSchema: [
      {
        component: 'DatePicker',
        componentProps: () => {
          return {
            picker: 'month',
            format: 'YYYY-MM',
            valueFormat: 'YYYY-MM-DD',
          };
        },
        // defaultValue: dayjs().format('YYYY-MM-01'),
        defaultValue: dayjs(dayjs().format('YYYY-MM-DD')).format('YYYY-MM-DD'),
        fieldName: 'applyPlanDate',
        label: '计划月份',
        // defaultValue: [
        //   // dayjs(dayjs().format('YYYY-MM-DD'))
        //   // .subtract(2, 'year')
        //   // .subtract(1, 'week')
        //   // .subtract(1, 'day')
        //   // .format('YYYY-MM-DD'),
        // ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: false,
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(val: any) {
              departmentId.value = val;
            },
            afterFetch(res: any) {
              const warehouseIdRef = chcGridApi.formApi?.getFieldComponentRef<
                InstanceType<typeof ChcSelect>
              >?.('warehouseId');
              if (!departmentId.value) {
                if (warehouseIdRef) {
                  warehouseIdRef.params.dependencies = {
                    regionId: -1,
                    departmentId: -1,
                  };
                  warehouseIdRef.fetchApi();
                }
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        fieldName: 'toWarehouseId',
        label: '申请仓库',
        component: 'ChcSelect',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            autoChooseFirstOption: true,
            placeholder: '请选择申请仓库',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            onChange(val: any, option: any) {
              if (val) {
                selectToWarehouseId.value = option.id;
              } else {
                selectToWarehouseId.value = 0;
              }
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            console.warn('申请仓库 trigger values', values);
            nextTick(() => {
              const c =
                chcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('toWarehouseId');
              if (c) {
                c.params.dependencies = {
                  regionId: values.departmentId || -1,
                  departmentId: values.departmentId || -1,
                };
                c.fetchApi();
                chcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
              }
            });
          },
        },
      },

      {
        fieldName: 'warehouseId',
        label: '上级仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            placeholder: '请选择上级仓库',
            triggerFields: ['toWarehouseId'],
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
          triggerFields: ['toWarehouseId'],
          trigger(values: any) {
            const c = chcGridApi.formApi?.getFieldComponentRef<
              InstanceType<typeof ChcSelect>
            >?.('warehouseId');
            nextTick(() => {
              if (c) {
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                c.params.dependencies = {
                  toWarehouseId: values.toWarehouseId,
                };
                c.fetchApi();
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // 如果选择了全部，其他项都不应该被选择
            mode: 'multiple',
            placeholder: '请选择',
            showChooseAll: '',
            // maxTagCount: 2,
            allowClear: true,
            paginate: false,
            options: [
              { value: '', label: '全部' },
              { value: 'NA', label: '未批准' },
              { value: 'DR', label: '新建' },
              { value: 'WU', label: '待审核' },
              { value: 'CO', label: '已确认' },
            ],
            onChange(val: any) {
              // 如果选择了全部
              if (val.includes('')) {
                chcGridApi.formApi?.setFieldValue('docStatus', ['']);
              }
            },
          };
        },
        defaultValue: ['NA', 'DR'],
        fieldName: 'docStatus',
        label: '状态',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
          maxLength: 50,
        },
      },
    ],
    showCustomBtn: true,
    showZoomBtn: true,
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.applyPlanId) {
          commitRow.value = row;
          parentTableParams.value.applyPlanId = row.applyPlanId;
          childGridApi.query({ applyPlanId: row.applyPlanId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.applyPlanId = undefined;
          childGridApi.grid.remove();
        }
      },
    },
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn', params.docStatus);
      const newParams = { ...params };
      if (
        newParams.docStatus &&
        Array.isArray(newParams.docStatus) &&
        newParams.docStatus?.length > 0
      ) {
        newParams.docStatus = newParams.docStatus.includes('')
          ? undefined
          : newParams.docStatus.map((val: string) => `'${val}'`).join(',');
      }
      // 需要对docStatus 的全部单独做出处理，如果只选择了一个全部
      // const midStr = params.docStatus?.join(',');
      // let midStrArr = midStr.split(',');
      // midStrArr = midStrArr.map((val: string) => `'${val}'`);
      // const newParams = {
      //   ...params,
      //   docStatus: midStrArr.join(','),
      // };
      return newParams;
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'PackageDetailModal-packageDetailModalApi': {
      //   closable: true,
      //   draggable: true,
      //   // 连接抽离的组件
      //   connectedComponent: ,
      // },
      'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: ImportModalComp,
      }),
    },
  },
);

// 删除处理函数
const handleCancel = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await deleteApplyPlan({ applyPlanId: scope.row?.applyPlanId })
          .then((res) => {
            if (res && res.success) {
              console.warn('rejectWorkrejectWorkrejectWork', res);
              chcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                chcGridApi.query({ ...resData });
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

// 新增处理函数
const handleAddNew = async () => {
  // 校验
  const formData = await chcGridApi.formApi.getValues();
  console.warn('formData', formData);
  // 院区
  // if (!formData.departmentId) {
  //   message.error('请选择院区');
  //   return;
  // }
  // if (!formData.toWarehouseId) {
  //   message.error('请选择申请仓库');
  //   return;
  // }
  // if (!formData.warehouseId) {
  //   message.error('请选择上级仓库');
  //   return;
  // }
  // currentHandleRow.value = {
  //   isProductControlLevel,
  //   toWarehouseId: formData.toWarehouseId,
  //   departmentId: formData.departmentId,
  //   warehouseId: formData.warehouseId,
  //   specShowType: urlParams.specShowType,
  //   applyPlanDate: formData.applyPlanDate,
  // };
  // currentTab.value = headerTabs.value.length - 1;
  // detailConfig.value = {
  //   detailTitle: '新建请领计划录入',
  //   sourcePage: props.thisTab.value,
  //   type: 'add',
  //   typeAction: 'add',
  // };
  props.goToDetailPage(
    {
      isProductControlLevel,
      toWarehouseId: formData.toWarehouseId,
      departmentId: formData.departmentId,
      warehouseId: formData.warehouseId,
      specShowType: urlParams.specShowType,
      applyPlanDate: formData.applyPlanDate,
    },
    {
      detailTitle: '新建请领计划录入',
      sourcePage: props.thisTab.value,
      type: 'add',
    },
  );
};
// 编辑处理函数
const handleEdit = (scope: any, action: 'edit' | 'view') => {
  // currentHandleRow.value = scope.row;
  // currentTab.value = headerTabs.value.length - 1;
  // detailConfig.value = {
  //   detailTitle: '编辑请领计划录入',
  //   sourcePage: props.thisTab.value,
  //   type: action,
  //   typeAction: action,
  // };
  // currentTab.value = 1;
  props.goToDetailPage(scope.row, {
    detailTitle: `${action === 'edit' ? '编辑' : '查看'}请领计划录入`,
    sourcePage: props.thisTab.value,
    type: action,
  });
};

// 确认处理函数
const handleApprove = () => {
  // 先检查是否有选中的行数据
  if (!commitRow.value.applyPlanId) {
    message.warning('请选择一条记录');
    return;
  }
  // if (['CO', 'WU'].includes(commitRow.value.applyPlanId)) {
  //   message.warning('请领计划已确认，不能重复确认!');
  //   return;
  // }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提醒',
    content: h('div', [
      h('p', {}, `申请单号: ${commitRow.value.applyPlanNo}`),
      h('p', {}, `上级仓库: ${commitRow.value.warehouseName}`),
      h('p', {}, '是否确认提交？'),
    ]),
    onOk: async () => {
      try {
        const params = {
          applyPlanId: commitRow.value.applyPlanId,
        };
        // params.append('priceListAdjId', commitRow.value.priceListAdjId);
        await dataCommit(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('urgeOrderDourgeOrderDourgeOrderDo', res);
              chcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                chcGridApi.query({ ...resData });
              });
              message.success('提交成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('提交失败');
      }
    },
    centered: true,
  });
};

// 导入
const handleImport = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  console.warn('formValues', formValues);
  // const params = {
  //   departmentId: formValues?.departmentId,
  //   applyPlanDate: formValues?.applyPlanDate,
  //   toWarehouseId: formValues?.departmentId
  //     ? formValues?.toWarehouseId
  //     : undefined,
  //   warehouseId: formValues?.departmentId ? formValues?.warehouseId : undefined,
  // };
  importModalApi
    ?.setData({
      departmentId: formValues?.departmentId,
      applyPlanDate: formValues?.applyPlanDate,
      toWarehouseId: formValues?.toWarehouseId,
      warehouseId: formValues?.warehouseId,
    })
    ?.open();
};

// 导入刷新表格
const refreshTable = () => {
  chcGridApi.formApi.getValues().then((res: any) => {
    chcGridApi.query({ ...res });
  });
};

// 打印
// const handlePrint = () => {
//   if (!commitRow.value.priceListAdjId) {
//     message.warn('请选择一条记录');
//     return;
//   }
//   Modal.confirm({
//     title: '打印提示',
//     content: '确认打印调价单吗？',
//     okText: '确认',
//     cancelText: '取消',
//     onOk() {
//       globalPrintStore.print({
//         pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/productAction/printPriceListAdj.do?priceListAdjId=${commitRow.value.priceListAdjId}`,
//       });
//     },
//     onCancel() {},
//   });
// };

// 查询

// 子表查询
const handleSearch = () => {
  childGridApi.query({
    applyPlanId: parentTableParams.value.applyPlanId,
    productName: parentTableParams.value.productName.trim(),
  });
};

// 复制
const handleCopy = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  console.warn('record', record);
  if (!record) {
    return message.error('请选择一条记录');
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提醒',
    content: h('div', [
      h('p', {}, `申请单号: ${record.applyPlanNo}`),
      h('p', {}, `上级仓库: ${record.warehouseName}`),
      h('p', {}, '是否确认复制？'),
    ]),
    onOk: async () => {
      try {
        await copyApplyPlan({ applyPlanId: record.applyPlanId })
          .then((res) => {
            if (res && res.success) {
              console.warn('复制', res);
              chcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                chcGridApi.query({ ...resData });
              });
              message.success('复制成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('复制失败');
      }
    },
    centered: true,
  });
};

watch(
  () => currentTab.value,
  (val: number, oldVal: number) => {
    const detailPageConfig = props.getDetailPageConfig();
    if (
      val === props.thisTab.value &&
      (oldVal !== detailPageConfig.detailPageValue ||
        (oldVal === detailPageConfig.detailPageValue &&
          detailPageConfig.detailPageType !== 'view'))
    ) {
      chcGridApi.formApi.getValues().then((res: any) => {
        chcGridApi.query({ ...res });
      });
    }
  },
);

onMounted(() => {
  nextTick(async () => {
    const formData = await chcGridApi.formApi?.getValues();
    console.warn(formData);
  });
});
</script>
<template>
  <!-- <Page content-class="p-[0.25rem]" class="h-full"> -->
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
        <ImportModal
          :select-to-warehouse-id="selectToWarehouseId"
          @refresh="refreshTable"
        />
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleImport"
              class="mr-[0.5rem]"
              data-testid="button_import"
            >
              导 入
              <template #icon>
                <UploadActionIcon />
              </template>
            </Button>
            <!-- <Button type="primary" class="mr-[0.5rem]" @click="handlePrint">
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
                打印
              </Button> -->
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleCopy"
              data-testid="button_copy"
            >
              复制
            </Button>
            <Button
              type="primary"
              @click="handleAddNew"
              class="mr-[0.5rem]"
              data-testid="button_addNew"
            >
              新 建
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleApprove"
              class="mr-[0.5rem]"
              data-testid="button_approve"
            >
              提交
            </Button>
          </template>
          <!-- <template #toolbar-tools>
              <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span>
            </template> -->
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleEdit(scope, 'edit')"
              :data-testid="`button_edit_${scope.rowIndex}`"
            >
              编辑
              <template #icon>
                <EditActionIcon />
              </template>
            </Button>
            <Button
              danger
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              :disabled="['CO', 'WU'].includes(scope.row.docStatus)"
              @click="handleCancel(scope)"
              :data-testid="`button_delete_${scope.rowIndex}`"
            >
              删除
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <ChildGrid>
          <template #toolbar-actions>
            <div class="pt-[10px]">
              <label for="productName">药品：</label>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleSearch"
                data-testid="button_search"
              >
                查询
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </div>
          </template>
        </ChildGrid>
      </template>
    </PageSplitLazy>
  </div>
  <!-- </Page> -->
</template>
<style scoped></style>
