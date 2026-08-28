<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

import {
  AddActionIcon,
  EditActionIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

// AI-GENERATED-BEGIN
// @date 2026-07-02
// @prompt 实现三级联动默认值设置后自动查询
// @description 添加自动查询控制器，在所有表单默认值都设置完毕后自动发起首次查询
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
});
const isFirstLoaded = ref(true);
// AI-GENERATED-END

import { dataCommit, invalidateCancel } from './api';
import AutoCreatOrderComp from './autoCreatOrder.vue';
// import { addFormOptions } from './addFormOptions';
import ImportModalComp from './modals/importModal.vue';

// import FormModal from './modals/FormModal.vue';
// import { commonFormOptions, viewFormOptions } from './options';
// const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const props = withDefaults(
  defineProps<{
    // getDetailPageConfig: () => {
    //   detailPageType: 'edit' | 'view' | undefined;
    //   detailPageValue: number;
    // };
    goToDetailPage: (row: any, detailPageConfig: DetailInfo) => void;
    thisTab: PageTab;
  }>(),
  {},
);

const [AutoCreatOrder, AutoCreatOrderApi] = useVbenModal({
  connectedComponent: AutoCreatOrderComp,
});

const extParams = ref<{
  // docStatus?: string;
  // page?: string;
  // returnDoc?: string;
}>({
  // docStatus: "'DR','NA'",
  // returnDoc: 'N',
  // page: 'input',
});
const selectedAmount = ref(0);
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });

// const isFirstLoaded = ref(false);
// class LazySelect {
//   callBack;
//   count;
//   nowNum = 0;
//   constructor(count: number, callBack: () => void) {
//     this.count = count;
//     this.callBack = callBack;
//   }
//   sign() {
//     this.nowNum++;
//     if (this.nowNum === this.count) {
//       this.callBack();
//     }
//   }
// }
// const selectController = new LazySelect(2, async () => {
//   await nextTick();
//   ChcGridApi.formApi.getValues().then((res: any) => {
//     ChcGridApi.query({ ...res });
//     isFirstLoaded.value = true;
//   });
// });

const selectToWarehouseId = ref(0);
// 二级仓库下拉请求的额外入参
const secondaryWarehouseExtraParams = ref<{
  level2: number | string;
  level3: number | string;
  level4: number | string;
}>({
  level2: '',
  level3: '',
  level4: '',
});

const [ChcGrid, ChcGridApi, { ImportModal, importModalApi }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellStyle(scope: any) {
        if (
          scope.column.field === 'priorityRuleName' &&
          scope.row.priorityRule === '3'
        ) {
          return {
            color: '#FF7518',
          };
        }
        if (
          scope.column.field === 'price' &&
          scope.row.price !== scope.row.priceList
        ) {
          return {
            color: 'red',
          };
        }
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'priorityRuleName',
        minWidth: 100,
        sortable: true,
        title: '优先级',
        // slots: { default: 'orderPlanId' },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'orderNo',
        minWidth: 90,
        sortable: true,
        title: '申请单号',
        slots: { default: 'orderNo' },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'priorityTypeName',
        minWidth: 100,
        sortable: true,
        title: '来源类别',
      },
      {
        field: 'dateOrdered',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
      },
      {
        field: 'deliveryPlanDate',
        minWidth: 160,
        sortable: true,
        title: '要求送达时间',
      },
      {
        field: 'departmentName',
        minWidth: 150,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 150,
        sortable: true,
        title: '上级仓库',
      },
      {
        field: 'toWarehouseName',
        minWidth: 150,
        sortable: true,
        title: '申请仓库',
      },
      {
        field: 'currentTotalPoAmt',
        minWidth: 90,
        sortable: true,
        title: '金额',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.currentTotalPoAmt);
        },
        // hidden : showPrice=='N',
      },
      // {
      //   field: 'pleaseCollect',
      //   minWidth: 130,
      //   sortable: true,
      //   title: '本次请领金额',
      //   align: 'right',
      //   formatter({ cellValue }: any) {
      //     return handlePriceToFixedTwo(cellValue);
      //   },
      // },
      // {
      //   field: 'departmentBudgetPrice',
      //   minWidth: 150,
      //   sortable: true,
      //   title: '科室剩余预算金额',
      //   align: 'right',
      //   formatter({ cellValue }: any) {
      //     return handlePriceToFixedTwo(cellValue);
      //   },
      // },
      {
        field: 'sourceType',
        minWidth: 90,
        sortable: true,
        title: '自动计划',
        formatter({ row }: any) {
          return row.priorityTypeName === '自动计划' ? '是' : '否';
        },
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        title: '商品组',
        // align: 'right',
      },
      {
        field: 'docStatusName',
        minWidth: 90,
        sortable: true,
        title: '单据状态',
        // align: 'right',
      },
      {
        field: 'createdByName',
        minWidth: 90,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        minWidth: 160,
        title: '创建时间',
      },
      {
        field: 'rejectReason',
        minWidth: 150,
        title: '退回原因',
      },
      {
        field: 'description',
        minWidth: 150,
        title: '备注',
      },

      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 160,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            // AI-GENERATED-BEGIN
            // @date 2026-07-02
            // @prompt 设置院区默认值
            // @description 院区加载完成后自动选择第一项
            autoChooseFirstOption: true,
            // AI-GENERATED-END
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择院区',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows?.length && isFirstLoaded.value) {
                ChcGridApi.formApi?.setFieldValue(
                  'departmentId',
                  res.rows[0].id,
                );

                if (ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId')) {
                  ChcGridApi.formApi.getFieldComponentRef(
                    'toWarehouseId',
                  ).params.dependencies = {
                    departmentId: res.rows[0].id,
                    regionId: res.rows[0].id,
                  };
                  ChcGridApi.formApi
                    ?.getFieldComponentRef('toWarehouseId')
                    ?.fetchApi();
                }
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'toWarehouseId',
        label: '申请仓库',
        componentProps: () => {
          return {
            // AI-GENERATED-BEGIN
            // @date 2026-07-02
            // @prompt 设置申请仓库默认值
            // @description 申请仓库加载完成后自动选择第一项
            autoChooseFirstOption: true,
            // AI-GENERATED-END
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            allowClear: true,
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              selectToWarehouseId.value = option.id;
              const warehouseType = option.warehouseType;
              // toWarehouseParams.value = {};
              Object.entries(secondaryWarehouseExtraParams.value).forEach(
                ([key, value]) => {
                  secondaryWarehouseExtraParams.value[
                    key as keyof typeof secondaryWarehouseExtraParams.value
                  ] = '';
                  console.warn('key', key, 'value', value);
                },
              );
              if (warehouseType && warehouseType > 1) {
                for (let i = 1; i < warehouseType; i++) {
                  secondaryWarehouseExtraParams.value[
                    `level${i}` as keyof typeof secondaryWarehouseExtraParams.value
                  ] = 'Y';
                }
              }
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                option.parentId || undefined,
              );
            },
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            afterFetch(res: any) {
              // AI-GENERATED-BEGIN
              // @date 2026-07-02
              // @prompt 设置申请仓库默认值并触发联动
              // @description 申请仓库加载完成后，设置默认值并联动设置上级仓库
              if (res.rows?.length && isFirstLoaded.value) {
                const firstOption = res.rows[0];
                ChcGridApi.formApi?.setFieldValue(
                  'toWarehouseId',
                  firstOption.id,
                );
                selectToWarehouseId.value = firstOption.id;
                const warehouseType = Number(firstOption.warehouseType);

                // 重置二级仓库参数
                Object.entries(secondaryWarehouseExtraParams.value).forEach(
                  ([key]) => {
                    secondaryWarehouseExtraParams.value[
                      key as keyof typeof secondaryWarehouseExtraParams.value
                    ] = '';
                  },
                );

                // 根据仓库类型设置额外参数
                if (warehouseType > 1) {
                  for (let i = 1; i < warehouseType; i++) {
                    secondaryWarehouseExtraParams.value[
                      `level${i}` as keyof typeof secondaryWarehouseExtraParams.value
                    ] = 'Y';
                  }
                }

                // 联动设置上级仓库
                if (firstOption.parentId) {
                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    firstOption.parentId,
                  );
                }

                if (ChcGridApi.formApi?.getFieldComponentRef('warehouseId')) {
                  ChcGridApi.formApi.getFieldComponentRef(
                    'warehouseId',
                  ).params.dependencies = {
                    toWarehouseId: firstOption.id,
                  };
                  ChcGridApi.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                }
              }
              // AI-GENERATED-END
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'toWarehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
            }
          },
        },
      },

      {
        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '上级仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择上级仓库',
            triggerFields: ['toWarehouseId'],
            paginate: false,
            allowClear: true,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            extraParams: secondaryWarehouseExtraParams.value,
            afterFetch(res: any) {
              // AI-GENERATED-BEGIN
              // @date 2026-07-02
              // @prompt 在所有默认值都设置完毕后触发查询
              // @description 上级仓库加载完成且申请仓库已设置默认值后，所有表单初始值都已就绪，此时触发首次查询
              if (isFirstLoaded.value) {
                isFirstLoaded.value = false;
                searchController.sign(1);
              }
              // AI-GENERATED-END
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['toWarehouseId'],
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
                toWarehouseId: values.toWarehouseId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              // ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       autoChooseFirstOption: true,
      //       dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
      // apiType: 'post',
      // requestContentType: 'application/x-www-form-urlencoded',
      //       placeholder: '请选择上级仓库',
      //       paginate: false,
      //       triggerFields: ['departmentId'],
      //       filterByFrontEnd: true,
      //       showChooseAll: '',
      //       // defaultValue: '',
      //       immediate: true,
      //       labelField: 'name',
      //       valueField: 'id',
      //       afterFetch(res: any) {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   dependencies: {
      //     triggerFields: ['departmentId'],
      //     trigger(values) {
      //       console.warn(values);
      //       if (
      //         ChcGridApi.formApi?.getFieldComponentRef &&
      //         typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
      //         ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
      //         ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
      //       ) {

      //         ChcGridApi.formApi.getFieldComponentRef(
      //           'warehouseId',
      //         ).params.regionId =
      //           values.departmentId
      //         console.log( ChcGridApi.formApi
      //           ?.getFieldComponentRef('warehouseId'), 222);

      //          ChcGridApi.formApi
      //           ?.getFieldComponentRef('warehouseId')
      //           ?.fetchApi();

      //         ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
      //       }
      //     },
      //   },
      //   fieldName: 'warehouseId',
      //   label: '上级仓库',
      // },

      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        componentProps: {
          placeholder: '请输入申请单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择优先级',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'priorityRule',
        label: '优先级',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000566',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择来源类别',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'priorityType',
        label: '来源类别',
      },
    ],

    id: 'listTable',
    dataTableId:
      '/orderAction/queryNew.do?isSameLevelMv=N&orderType=WO&page=input&isPackaged=N',
    // commonFormOptions,
    // viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      totalAmount.value = params.totalPrice || 0;
      console.warn('afterFetchFn:', params.totalPrice);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
        // 连接抽离的组件
        connectedComponent: ImportModalComp,
      }),
    },
  },
);

const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = total;
};

const handleImport = () => {
  importModalApi?.open();
};
// 作废处理函数
const handleCancel = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `是否将此库房请领单删除？`,
    onOk: async () => {
      // try {
      await invalidateCancel({ orderId: scope.row?.orderId })
        .then((res) => {
          if (res && res.success) {
            console.warn('rejectWorkrejectWorkrejectWork', res);
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
      // } catch {
      //   message.error('删除失败');
      // }
    },
  });
};
// 批量删除函数
const handleBatchDel = (scope: any) => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择需要批量删除的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `是否将选中的数据批量删除？`,
    onOk: async () => {
      const orderIds = selectedRows.map((row) => row.orderId);
      const params = {
        orderId: JSON.stringify(orderIds),
      };
      await invalidateCancel(params)
        .then((res) => {
          if (res && res.success) {
            console.warn('rejectWorkrejectWorkrejectWork', res);
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
      // } catch {
      //   message.error('删除失败');
      // }
    },
  });
};
const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要仓库请领单的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '仓库请领单',
    content: `是否将选中的仓库请领单提交？`,
    onOk: async () => {
      try {
        const orderIds = selectedRows.map((row) => row.orderId);
        // const params = new URLSearchParams();
        // params.append('orderId', JSON.stringify(orderIds));
        const params = {
          orderId: JSON.stringify(orderIds),
        };
        await dataCommit(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('urgeOrderDourgeOrderDourgeOrderDo', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
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
  });
};

// 新建采购计划
const handleAddNew = () => {
  props.goToDetailPage(
    {},
    {
      detailTitle: '新建库房请领',
      sourcePage: props.thisTab.value,
      type: 'add',
    },
  );
  currentTab.value = 1;
};

const handleAutoCreateOrder = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    if (!resData.departmentId) {
      message.error('请选择院区');
      return;
    }
    if (!resData.toWarehouseId) {
      message.error('请选择申请仓库');
      return;
    }
    if (!resData.warehouseId) {
      message.error('请选择上级仓库');
      return;
    }
    AutoCreatOrderApi.setData({
      ...resData,
      secondaryWarehouseExtraParams: secondaryWarehouseExtraParams.value,
    });
    AutoCreatOrderApi.open();
  });
};
// 编辑采购计划
const handleEdit = (scope: any, action: 'edit' | 'view') => {
  props.goToDetailPage(scope.row, {
    detailTitle: '编辑库房请领',
    sourcePage: props.thisTab.value,
    type: action,
  });
  currentTab.value = 1;
};

const refreshTable = () => {
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
};

watch(
  () => currentTab.value,
  (val: number | string) => {
    if (val === props.thisTab.value) {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
);

onMounted(() => {});
</script>
<template>
  <div
    :style="{
      overflowY: 'hidden',
    }"
    class="h-full"
  >
    <ImportModal
      :current-tab="currentTab"
      :select-to-warehouse-id="selectToWarehouseId"
      @close="refreshTable"
    />
    <AutoCreatOrder
      :current-tab="currentTab"
      :select-to-warehouse-id="selectToWarehouseId"
    />

    <ChcGrid>
      <template #orderNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleEdit(scope, 'view')"
          data-testid="link_view_order_infoQuery"
        >
          {{ scope.row.orderNo }}
        </a>
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAutoCreateOrder"
          class="mr-[0.5rem]"
          data-testid="button_auto_create_plan_infoQuery"
        >
          生成自动计划
        </Button>
        <Button
          type="primary"
          @click="handleAddNew"
          class="mr-[0.5rem]"
          data-testid="button_new_order_infoQuery"
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
          data-testid="button_submit_order_infoQuery"
        >
          提 交
        </Button>
        <Button
          type="primary"
          @click="handleBatchDel"
          class="mr-[0.5rem]"
          data-testid="button_batch_del_order_infoQuery"
        >
          批量删除
        </Button>
        <Button
          type="primary"
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import_order_infoQuery"
        >
          导 入
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
      </template>

      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope, 'edit')"
          :data-testid="`button_edit_order_${scope.rowIndex}_infoQuery`"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>

        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleCancel(scope)"
          :data-testid="`button_delete_order_${scope.rowIndex}_infoQuery`"
        >
          删除
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
