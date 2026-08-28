<script setup lang="ts">
import { h, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { dataCommit, invalidateCancel } from './api';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const userStore: any = useUserStore();
const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
const urlParams: any = {
  productControlLevel: urlParamsObj?.productControlLevel || '',
  isProductControlLevel: urlParamsObj?.isProductControlLevel
    ? urlParamsObj?.isProductControlLevel === 'Y'
    : userStore.userInfo.isProductControlLevel,
  module: urlParamsObj?.m === null ? '' : urlParamsObj?.m,
};

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

const extParams = ref<{
  isOutNeedPick?: string;
  isPackaged?: string;
  orderType?: string;
  page?: string;
}>({
  isOutNeedPick: 'N',
  orderType: 'MO',
  isPackaged: 'Y',
  page: 'input',
});
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const commitRow = ref<any>({});
const toWarehouseParams = ref<any>({});
const departmentId = ref<number | string>('');
const toWarehouseTriggerField = ref<any>(['warehouseId']);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      handleSubmit: async (values: any) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        highlight: true,
        trigger: 'row',
      },
    }),
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'orderId',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
        slots: { default: 'orderId' },
      },
      {
        field: 'dateOrdered',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
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
        title: '调出仓库',
      },
      {
        field: 'toWarehouseName',
        minWidth: 150,
        sortable: true,
        title: '调入仓库',
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        width: '100',
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        title: '商品组',
        visible: urlParams.isProductControlLevel,
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
        sortable: true,
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
        width: 180,
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
            allowClear: true,
            onChange(val: any, option: any) {
              let warehouseType = Number(option.warehouseType);

              // toWarehouseParams.value = {};
              Object.entries(toWarehouseParams.value).forEach(
                ([key, value]) => {
                  toWarehouseParams.value[key] = undefined;
                  console.warn('key', key, 'value', value);
                },
              );
              toWarehouseTriggerField.value = ['warehouseId'];
              while (warehouseType < 4) {
                toWarehouseParams.value[`level${warehouseType}`] = 'Y';
                toWarehouseTriggerField.value.push(`level${warehouseType}`);
                warehouseType = warehouseType + 1;
              }
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            // beforeFetch(params: any) {
            //   console.log(params, 111);

            //   return { ...params };
            // },
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
        // defaultValue: 1_000_007,
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
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
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
              return { ...res, rows: undefined, records: res.rows || [] };
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
                // ...toWarehouseParams.value,
                warehouseId: values.warehouseId,
              };

              ChcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
            }
          },
        },
        fieldName: 'toWarehouseId',
        label: '调入仓库',
      },
    ],
    dataTableId: 'orderAction/query.do',
    id: 'listTable',
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
    beforeFetchFn: (params) => {
      return {
        ...params,
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
        start: undefined,
        limit: 0,
      };
    },
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        commitRow.value = row && row.orderId ? row : {};
      },
    },
  },
);

// 作废处理函数
const handleCancel = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `确定要删除吗？`,
    onOk: async () => {
      try {
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
      } catch {
        message.error('删除失败');
      }
    },
  });
};

const handleAddNew = () => {
  ChcGridApi.formApi.getValues().then(() => {
    // parentData.value = res;
    parentData.value = {};

    currentTab.value = headerTabs.value.length - 1;
    detailInfo.value = {
      detailTitle: '新建库间调拨',
      sourcePage: props.thisTab.value,
      type: 'edit',
    };
  });
};
const handleEdit = (scope: any, action: 'edit' | 'view') => {
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;

  detailInfo.value = {
    detailTitle: '编辑库间调拨',
    sourcePage: props.thisTab.value,
    type: action,
  };
  // currentTab.value = 1;
};

const handleApprove = () => {
  // 先检查是否有选中的行数据
  if (!commitRow.value.orderId) {
    message.warning('请先选择要提交的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交仓库请领单',
    content: h('div', {}, [
      h('p', `申请单号：${commitRow.value.orderNo}`),
      h('p', `申请仓库：${commitRow.value.warehouseName}`),
      h('p', `上级仓库：${commitRow.value.toWarehouseName}`),
      h('p', '是否确认提交？'),
    ]),
    onOk: async () => {
      try {
        const params = {
          orderId: commitRow.value.orderId,
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

// const queryData = ref<any>({});

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
</script>
<template>
  <div class="h-full">
    <ChcGrid>
      <template #toolbar-actions>
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
      </template>
      <template #toolbar-tools>
        <!-- <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span> -->
      </template>
      <template #orderId="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleEdit(scope, 'view')"
          :data-testid="`link_view_order_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.orderNo }}
        </a>
      </template>
      <!-- <template #orderId="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
        >
          {{ scope.row.asnId }}
        </a>
      </template> -->

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
<style scoped></style>
