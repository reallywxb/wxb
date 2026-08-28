<script setup lang="ts">
import { h, nextTick, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { dataCommit, invalidateCancel } from './api';
import AutoCreatOrderComp from './modals/autoCreatOrderModal.vue';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
const urlParams: any = {
  specShowType: urlParamsObj?.specShowType || '',
  productControlLevel: urlParamsObj?.productControlLevel || '',
  hiddenField: urlParamsObj?.hiddenField || '',
  isPackaged: ['Y', 'y'].includes(urlParamsObj?.isPackaged),
  showStorage: urlParamsObj?.showStorage || 'N',
  showPrice: urlParamsObj?.showPrice || 'Y',
  isUseMonthlyWO: urlParamsObj?.isUseMonthlyWO || 'N',
  productCategoryIds: urlParamsObj?.productCategoryIds,
  isMaxMinLevelReplenish: urlParamsObj?.isMaxMinLevelReplenish || '',
  isStoragePackage: urlParamsObj?.isStoragePackage,
};
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const selectToWarehouseId = ref<number | string>(0);
class LazySelect {
  callBack;
  count;
  nowNum = 0;
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign() {
    this.nowNum++;
    if (this.nowNum === this.count) {
      this.callBack();
    }
  }
}
const selectController = new LazySelect(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query(res);
    isFirstLoaded.value = true;
  });
});

const extParams = ref<{
  // isGift_text?: string;
  // isPrecious_text?: string;
  page?: string;
  returnDoc?: string;
}>({
  // docStatus: "'DR','NA'",
  // returnDoc: 'N',
  // page: 'input',
});
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const isFirstLoaded = ref(false);
const commitRow = ref<any>({});
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
      fieldMappingTime: [
        ['dateOrdered', ['createdFrom', 'createdTo'], 'YYYY-MM-DD'],
      ],
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
        field: 'priorityRuleName',
        minWidth: 100,
        sortable: true,
        title: '优先级',
      },
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
      // {
      //   field: 'deliveryPlanDate',
      //   minWidth: 160,
      //   sortable: true,
      //   title: '要求送达时间',
      // },
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
        minWidth: 150,
        sortable: true,
        title: '金额',
        align: 'right',
        visible: urlParams.showPrice !== 'N',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.currentTotalPoAmt);
        },
      },
      {
        field: 'sourceType',
        minWidth: 100,
        sortable: true,
        title: '自动计划',
        formatter({ row }: any) {
          return row.sourceType === 'A' ? '是' : '否';
        },
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        title: '管控类型',
        visible: urlParams.isProductControlLevel,
        // align: 'right',
      },
      {
        field: 'docStatusName',
        minWidth: 100,
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
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              selectController.sign();
            },
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        fieldName: 'toWarehouseId',
        label: '申请仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
            onChange(val: any, option: any) {
              console.warn('warehouseId', val, option);
              selectToWarehouseId.value = option.id;
              selectController.sign();
              const warehouseType = option.warehouseType;
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
        fieldName: 'warehouseId',
        label: '上级仓库',
        component: 'ChcSelect',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',

        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择上级仓库',
            paginate: false,
            allowClear: true,
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['toWarehouseId'],
            extraParams: secondaryWarehouseExtraParams.value,
            afterFetch(res: any) {
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
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        // defaultValue: 1_000_007,
      },

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
    ],
    dataTableId:
      '/orderAction/query.do?isSameLevelMv=N&orderType=WO&page=input&isPackaged=Y',
    id: 'listTable',
    commonFormOptions,
    viewFormOptions,
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
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        commitRow.value = row && row.orderId ? row : {};
      },
    },
  },
);

const [AutoCreatOrder, AutoCreatOrderApi] = useVbenModal({
  connectedComponent: AutoCreatOrderComp,
});

// 作废处理函数
const handleCancel = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `是否将此定数请领录入单删除？`,
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
  parentData.value = {};
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '新建定数请领录入单',
    sourcePage: props.thisTab.value,
    type: 'edit',
    typeAction: 'add',
  };
};
const handleEdit = (scope: any, action: 'edit' | 'view') => {
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '编辑定数请领录入单',
    sourcePage: props.thisTab.value,
    type: action,
    typeAction: action,
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
      h('p', `上级仓库：${commitRow.value.warehouseName}`),
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

const handleImport = () => {
  importModalApi?.open();
};

const handleAutoCreateOrder = () => {
  AutoCreatOrderApi.open();
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
</script>
<template>
  <div class="h-full">
    <ImportModal
      :select-to-warehouse-id="selectToWarehouseId"
      @close="refreshTable"
    />
    <AutoCreatOrder />
    <ChcGrid>
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
          :data-testid="`button_delete_order_action_${scope.rowIndex}_infoQuery`"
        >
          删除
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped></style>
