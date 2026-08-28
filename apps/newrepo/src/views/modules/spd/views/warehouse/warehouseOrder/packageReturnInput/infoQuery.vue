<script setup lang="ts">
import { h, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';

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
const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;

const urlParams: any = {
  productControlLevel: urlParamsObj?.productControlLevel || '',
  isProductControlLevel: urlParamsObj?.isProductControlLevel === 'Y',
};
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');

const extParams = ref<{
  isOutNeedPick?: string;
  isPackaged?: string;
  orderType?: string;
  page?: string;
}>({
  isOutNeedPick: 'N',
  orderType: 'WR',
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
const toWarehouseParams = ref<any>({
  level2: '',
  level3: '',
  level4: '',
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
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
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
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
        title: '申请仓库',
      },
      {
        field: 'toWarehouseName',
        minWidth: 150,
        sortable: true,
        title: '上级仓库',
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
        title: '管控类型',
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

            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
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
            dictUrl: '/baseHandleAction/warehouse.do?level1=N&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            allowClear: true,
            onChange(val: any, option: any) {
              const warehouseType = option.warehouseType;
              Object.entries(toWarehouseParams.value).forEach(
                ([key, value]) => {
                  toWarehouseParams.value[key] = '';
                  console.warn('key', key, 'value', value);
                },
              );
              if (warehouseType && warehouseType > 1) {
                for (let i = 1; i < warehouseType; i++) {
                  toWarehouseParams.value[`level${i}`] = 'Y';
                }
              }
              ChcGridApi.formApi?.setFieldValue(
                'toWarehouseId',
                option.parentId || undefined,
              );
              // extParams.value.bpartnerId_text = option.name;
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
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
        label: '申请仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',

            // showSearch: true,
            placeholder: '请选择上级仓库',
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
                warehouseId: values.warehouseId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
            }
          },
        },
        fieldName: 'toWarehouseId',
        label: '上级仓库',
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
      detailTitle: '新建库房定数请退',
      sourcePage: props.thisTab.value,
      type: 'edit',
    };
  });
};
const handleEdit = (scope: any, action: 'edit' | 'view') => {
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;

  detailInfo.value = {
    detailTitle: '编辑库房定数请退',
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
