<script lang="ts" setup>
import { ref } from 'vue';
// import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo, hospitalChange } from '#/utils/util';

import rejectModalUI from './addModal/rejectModal.vue';
import { approveWorkflow } from './api';
import { isEmpty } from '@vben/utils';
import { ChcSelect } from '@vben/chc-ui';
const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});

const hospitalId = ref(null);

// const route = useRoute();
// const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');
// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

// const urlParams: any = {
//   specShowType: urlParamsObj?.specShowType || '',
//   productControlLevel: urlParamsObj?.productControlLevel || '',
//   hiddenField: urlParamsObj?.hiddenField || '',
//   isSelf: urlParamsObj?.isSelf || '',
//   showStorage: urlParamsObj?.showStorage || 'N',
//   showPrice: urlParamsObj?.showPrice || 'Y',
//   isUseMonthlyWO: urlParamsObj?.isUseMonthlyWO || 'N',
//   // isProductControlLevel: urlParamsObj?.isProductControlLevel,
// };

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
});
// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'insurance', title: '医保编码', width: '120', sortable: true },
      {
        field: 'standardCode',
        title: '贯标编码',
        width: '120',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
      },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },
      { field: 'productSpec', title: '规格', width: '200', sortable: true },
      { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
      { field: 'uomName', title: '单位', width: '72', sortable: true },
      {
        field: 'packageCountOrdered',
        title: '申请包数',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '申请数量',
        width: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'pricePO',
        title: '采购价',
        width: '100',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceList',
        title: '零售价',
        width: '100',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceList);
        },
        align: 'right',
      },
      {
        field: 'lot',
        title: '批号',
        width: '150',
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '150',
      },
      {
        field: 'defaultVendorName',
        title: '默认供应商',
        width: '150',
      },
      { field: 'description', title: '备注', width: '150' },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/orderAction/queryLine.do?specShowType=to',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.orderId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
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

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
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
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/orderAction/query.do?page=workflowApprove&orderType=WR',
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'dateOrdered',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
      },
      {
        field: 'orderTypeName',
        title: '申请类型',
        width: '100',
        sortable: true,
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
        minWidth: 160,
        sortable: true,
        title: '申请仓库',
      },
      {
        field: 'toWarehouseName',
        minWidth: 150,
        sortable: true,
        title: '收货仓库',
      },
      // {
      //   field: 'productControlLevelName',
      //   minWidth: 120,
      //   sortable: true,
      //   title: '商品组',
      //   visible: userStore.userInfo.isProductControlLevel,
      // },

      {
        field: 'createdByName',
        minWidth: 90,
        sortable: true,
        title: '申请人',
      },
      {
        field: 'wfNodeName',
        title: '审批节点',
        width: '150',
        sortable: true,
      },
      {
        field: 'description',
        minWidth: 150,
        title: '备注',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(1, 'week')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        fieldName: 'hospitalId',
        label: '医院',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/hospitalAction/queryHospList?dataType=all',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'hospitalName',
            valueField: 'orgId',
            onChange(val: any, option: any) {
              console.warn('hospitalId', val, option);
              hospitalId.value = val;
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res?.data || [] };
            },
          };
        },
      },
      {
        fieldName: 'departmentId',
        label: '院区',
        component: 'ChcSelect',
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
            triggerFields: ['hospitalId'],
            onChange(val: any) {
              console.warn('departmentId', val);
              warehouseIdExtraParams.value.hospitalId = hospitalId.value || '';
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['hospitalId'],
          async trigger(values) {
            console.warn('trigger values:', values);
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );
            warehouseIdExtraParams.value.hospitalId = values?.hospitalId;
            if (cond) {
              const departmentIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('departmentId');
              if (departmentIdRef) {
                if (values?.hospitalId) {
                  departmentIdRef.params.dependencies = {
                    hospitalId: values.hospitalId,
                  };
                  const selectOptions = await departmentIdRef.fetchApi();
                  // 选第一个不是全部的id
                  const item = selectOptions.filter(
                    (o: Record<string, any>) => !isEmpty(o?.id),
                  )?.[0];
                  ChcGridApi.formApi?.setFieldValue(
                    'departmentId',
                    item?.id || undefined,
                  );
                } else {
                  departmentIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('departmentId', undefined);
                }
              }
            }
          },
        },
      },
      {
        fieldName: 'warehouseId',
        label: '申请仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/warehouse.do?level1=N&readWrite=Y&isHis=N',
            placeholder: '请选择申请仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            extraParams: warehouseIdExtraParams.value,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
            onChange(val: any, option: any) {
              console.warn('warehouseId', val, option);
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
              ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          async trigger(values: any) {
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
                  console.log('申请仓库', selectOptions);
                  // 选第一个不是全部的id
                  const item = selectOptions.filter(
                    (o: Record<string, any>) => !isEmpty(o?.id),
                  )?.[0];
                  const warehouseType = item?.warehouseType;
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
                  ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                  ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
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
        fieldName: 'toWarehouseId',
        label: '收货仓库',
        component: 'ChcSelect',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择收货仓库',
            paginate: false,
            allowClear: true,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['warehouseId'],
            extraParams: secondaryWarehouseExtraParams.value,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          async trigger(values) {
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );
            if (cond) {
              const toWarehouseIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('toWarehouseId');
              if (toWarehouseIdRef) {
                if (values?.warehouseId) {
                  toWarehouseIdRef.params.dependencies = {
                    warehouseId: values.warehouseId,
                  };
                  await toWarehouseIdRef.fetchApi();
                  ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
                } else {
                  toWarehouseIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
                }
              }
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        componentProps: {
          placeholder: '请输入申请单号',
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          selectRow.value = row;
          roleGridApi.reload({ orderId: row.orderId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = undefined;
          roleGridApi.grid.remove();
          selectRow.value = {};
        }
      },
    },
    beforeFetchFn: (params: any) => {
      if (!params.hospitalId) {
        message.warning('医院必选，请选择医院');
        return false;
      }
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [rejectModal, rejectModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rejectModalUI,
  draggable: true,
});

const handleSearch = () => {
  roleGridApi.reload({
    orderId: parentTableParams.value.orderId,
    productName: parentTableParams.value.productName,
  });
};

const selectRow = ref<any>({});

const handleRejectClose = () => {
  console.warn('handleRejectClose');
  ChcGridApi.query();
};

const rejectOrders = ref<Array<number | string>>([]);

const handleApproval = () => {
  if (!selectRow.value.wfActivityId) {
    message.warning('请先选择批准的数据');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认批准吗？`,
    onOk: () => {
      try {
        const params = {
          wfActivityId: JSON.stringify([selectRow.value.wfActivityId]),
        };
        approveWorkflow(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('批准成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
        ChcGridApi.query();
      } catch {
        message.error('批准失败');
      }
    },
  });
};

const handleReject = () => {
  if (!selectRow.value.wfActivityId) {
    message.warning('请先选择拒绝的数据');
    return;
  }
  rejectOrders.value = [selectRow.value.wfActivityId];
  rejectModalApi.open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
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
          <rejectModal
            :reject-orders="rejectOrders"
            @close="handleRejectClose"
          />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleApproval"
                class="mr-[0.5rem]"
                data-testid="button_approve"
              >
                批准
              </Button>
              <Button
                type="primary"
                @click="handleReject"
                data-testid="button_reject"
              >
                拒绝
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_product_name"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
    </div>
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
</style>
