<script setup lang="ts">
import { h, nextTick, ref, toRaw, watch } from 'vue';
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
import LazySearch from '#/utils/LazySearch';
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
  isPackaged: 'N',
  page: 'input',
});
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const toWarehouseParams = ref<any>({
  level2: '',
  level3: '',
  level4: '',
});
const searchController = new LazySearch(1, async () => {
  await nextTick();
  // ChcGridApi.formApi.getValues().then((res: any) => {
  //   ChcGridApi.query({ ...res });
  // });
});
const isFirstLoaded = ref(true);
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
      checkboxConfig: {
        highlight: true,
        trigger: 'row',
      },
    }),
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
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
        fieldName: 'departmentId',
        label: '院区',
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
              if (res.rows?.length && isFirstLoaded.value) {
                ChcGridApi.formApi?.setFieldValue(
                  'departmentId',
                  res.rows[0].id,
                );

                if (ChcGridApi.formApi?.getFieldComponentRef('warehouseId')) {
                  ChcGridApi.formApi.getFieldComponentRef(
                    'warehouseId',
                  ).params.dependencies = {
                    departmentId: res.rows[0].id,
                    regionId: res.rows[0].id,
                  };
                  ChcGridApi.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                }
              }
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
      },

      {
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '申请仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/warehouse.do?level1=N&readWrite=Y&isHis=N',
            placeholder: '请选择申请仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            allowClear: true,
            onChange(val: any, option: any) {
              console.warn('val', val, 'option', option);
              const warehouseType = option.warehouseType;
              // toWarehouseParams.value = {};
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
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows?.length && isFirstLoaded.value) {
                const firstOption = res.rows[0];
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  firstOption.id,
                );
                const warehouseType = firstOption.warehouseType;
                // toWarehouseParams.value = {};
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
                  firstOption.parentId || undefined,
                );
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
      },
      {
        fieldName: 'toWarehouseId',
        label: '上级仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择上级仓库',
            allowClear: true,
            triggerFields: ['warehouseId'],
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
            },
            extraParams: toWarehouseParams.value,
            paginate: false,
            // showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (isFirstLoaded.value) {
                isFirstLoaded.value = false;
                searchController.sign(1);
              }
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
      },
    ],
    dataTableId: 'orderAction/queryNew.do',
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
    gridEvents: {},
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
      detailTitle: '新建库房请退录入单',
      sourcePage: props.thisTab.value,
      type: 'edit',
    };
  });
};
const handleEdit = (scope: any, action: 'edit' | 'view') => {
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;

  detailInfo.value = {
    detailTitle: '编辑库房请退录入单',
    sourcePage: props.thisTab.value,
    type: action,
  };
  // currentTab.value = 1;
};

const handleApprove = () => {
  // AI-GENERATED-BEGIN
  // @date 2026-06-22
  // @prompt 改为多选，提交该支持批量提交
  // @description 修改提交函数，支持批量提交选中的多条数据
  // 直接从表格获取当前选中的数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();

  if (selectedRows.length === 0) {
    message.warning('请先选择要提交的数据');
    return;
  }

  // 构建选中的数据列表展示
  const orderNoList = selectedRows.map((row: any) => row.orderNo).join('、');
  const warehouseNameList = selectedRows
    .map((row: any) => row.warehouseName)
    .join('、');
  const toWarehouseNameList = selectedRows
    .map((row: any) => row.toWarehouseName)
    .join('、');

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交仓库请退单',
    content: h('div', {}, [
      h('p', `申请单号：${orderNoList}`),
      h('p', `申请仓库：${warehouseNameList}`),
      h('p', `上级仓库：${toWarehouseNameList}`),
      h('p', `共选择 ${selectedRows.length} 条数据，是否确认提交？`),
    ]),
    onOk: async () => {
      try {
        const params = {
          orderId: selectedRows.map((row: any) => row.orderId).join(','),
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
  // AI-GENERATED-END
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
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
