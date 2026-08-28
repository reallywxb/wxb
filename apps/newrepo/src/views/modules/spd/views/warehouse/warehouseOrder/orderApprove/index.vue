<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import LazySearch from '#/utils/LazySearch';
import { handleCommonGridColumns } from '#/utils/param';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import rejectModalUI from './addModal/rejectModal.vue';
import { approveWorkflow } from './api';
import { columns } from './gridOptions';

import { ChcSelect } from '@vben/chc-ui';
import { isEmpty } from '@vben/utils';

const warehouseIdExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});

const [cols, gridColumns] = handleCommonGridColumns(columns);
const orderId = ref<number | string>('');

const parentTableParams = ref<{ [key: string]: any }>({});
const isFirstLoaded = ref(false); // 是否已初次加载完
const selectedAmount = ref(0);
const totalAmount = ref(0);

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(2, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
  isFirstLoaded.value = true;
});
onMounted(() => {
  // 触发自动查询
  searchController.sign(2);
});
const hospitalId = ref(null);

const [RoleGrid, roleGridApi, { FormModal: RoleFormModal }] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'productCode',
          title: '药品编码',
          width: '120',
          sortable: true,
        },
        { field: 'insurance', title: '医保编码', width: '120', sortable: true },
        {
          field: 'standardCode',
          title: '贯标编码',
          width: '120',
          sortable: true,
          visible: false, // TODO:medicine cancel 贯标码
        },
        {
          field: 'productName',
          title: '药品名称',
          width: '200',
          sortable: true,
        },
        { field: 'productSpec', title: '规格', width: '200', sortable: true },
        {
          field: 'modelNo',
          title: '型号',
          width: '150',
          sortable: true,
          visible: false,
        },
        { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
        { field: 'uomName', title: '单位', width: '72', sortable: true },
        {
          field: 'qtyAutoPlaned',
          title: '自动计划数量',
          align: 'right',
          width: '120',
          sortable: true,
        },
        {
          field: 'qtyOrdered',
          title: '申请数量',
          width: '120',
          align: 'right',
          sortable: true,
        },
        {
          field: 'priceList',
          title: '零售价',
          width: '120',
          align: 'right',
          sortable: true,
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.priceList);
          },
        },
        {
          title: '金额',
          width: '120',
          align: 'right',
          field: 'totalAmt',
          sortable: true,
          formatter({ row }: any) {
            const qty = Number(row.qtyOrdered) || 0;
            const price = Number(row.priceList) || 0;
            return handlePriceToFixedTwo(parseFloat((qty * price).toFixed(2)));
          },
        },
        {
          field: 'qtyOnHand',
          title: '库存数量',
          width: '120',
          align: 'right',
          sortable: true,
        },
        { field: 'description', title: '备注', width: '150', sortable: true },
      ],
      proxyConfig: {
        autoLoad: false,
      },
    },
  },
  {
    parentTableParams,
    id: 'childTable',
    dataTableId: '/orderAction/queryLine.do?page=woInput&specShowType=',
    // tableSearchExtraParams: searchForm,
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
const [ChcGrid, ChcGridApi, { FormModal, LogModal }] = useSpdGrid(
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
      radioConfig: {
        highlight: true,
        trigger: 'row',
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    dataTableId: '/orderAction/query.do?orderType=WO&page=workflowApprove',
    id: 'parentTable',
    showRadioRowTag: true,
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
        label: '单选',
      },
      ...gridColumns,
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
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择院区',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              warehouseIdExtraParams.value.hospitalId = hospitalId.value || '';
            },
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['hospitalId'],
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['hospitalId'],
          async trigger(values) {
            console.log('院区 trigger values:', values);
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
                  if (!isFirstLoaded.value) {
                    searchController.sign(1);
                  }
                  departmentIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('departmentId', undefined);
                }
              }
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'toWarehouseId',
        label: '申请仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
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
              console.warn('toWarehouseId', val, option);

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
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          async trigger(values: any) {
            console.log('申请仓库 trigger values:', values);
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );
            if (cond) {
              const toWarehouseIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('toWarehouseId');
              if (toWarehouseIdRef) {
                if (values?.departmentId) {
                  toWarehouseIdRef.params.dependencies = {
                    departmentId: values.departmentId,
                    regionId: values.departmentId,
                  };
                  const selectOptions = await toWarehouseIdRef.fetchApi();
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
                  ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
                  ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                } else {
                  if (!isFirstLoaded.value) {
                    searchController.sign(1);
                  }
                  toWarehouseIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('toWarehouseId', undefined);
                }
              }
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
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            placeholder: '请选择上级仓库',
            paginate: false,
            allowClear: true,

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
          async trigger(values) {
            console.log('上级仓库 trigger values:', values);
            const cond = !!(
              ChcGridApi.formApi && ChcGridApi.formApi.getFieldComponentRef
            );
            if (cond) {
              const warehouseIdRef =
                ChcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('warehouseId');
              if (warehouseIdRef) {
                if (values?.toWarehouseId) {
                  warehouseIdRef.params.dependencies = {
                    toWarehouseId: values.toWarehouseId,
                  };
                  await warehouseIdRef.fetchApi();

                  ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                  if (!isFirstLoaded.value) {
                    searchController.sign(1);
                  }
                } else {
                  if (!isFirstLoaded.value) {
                    searchController.sign(1);
                  }
                  warehouseIdRef.clearOptions();
                  ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                }
              }
            }
          },
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
    cols,
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.orderId) {
          parentTableParams.value = { orderId: row.orderId };
          orderId.value = row.orderId;
          // console.log('父表选中行，触发子表查询', parentTableParams.value);
          roleGridApi.reload({ orderId: row.orderId });
          await ChcGridApi.grid.clearCheckboxRow();
          ChcGridApi.grid.setCheckboxRow(row, true);
          calculateSelectedAmount([row]);
        } else {
          parentTableParams.value = {};
          orderId.value = '';
          roleGridApi.grid.remove();
          calculateSelectedAmount([]);
        }
      },
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
    },
    tableSearchExtraParams: {
      // orgId: userStore.userInfo?.orgId,
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
      let amount = 0;
      params.rows?.forEach((item: any) => {
        if (item.totalAmt) {
          amount += Number.parseFloat(item.totalAmt);
        }
      });
      totalAmount.value = Number(amount.toFixed(2));
      setTimeout(() => {
        calculateSummarize();
      }, 200);
      return {
        ...params,
        records: params.rows,
      };
    },
    // childGridLinkKeys: ['userId-id'],
    // childGridApi: roleGridApi,
  },
);

const productName = ref('');
const handleSearch = (e) => {
  console.warn('handleSearch', e.target.value, productName.value);
  roleGridApi.reload({
    orderId: parentTableParams.value.orderId,
    productName: productName.value,
  });
};

const [rejectModal, rejectModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rejectModalUI,
  draggable: true,
});

const rejectOrders = ref([]);

const summarizeRef = ref();

const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = Number.parseFloat(total.toFixed(2));
  console.warn('selectedAmount.value', selectedAmount.value);
  calculateSummarize();
};

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '勾选金额',
      value: selectedAmount.value,
    },
    {
      label: '请领总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value?.refreshNumber(totalArr);
};

const handleApproval = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择批准的数据');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认批准吗？`,
    onOk: () => {
      try {
        const params = {
          wfActivityId: JSON.stringify(
            selectedRows.map((row: any) => row.wfActivityId),
          ),
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
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择拒绝的数据');
    return;
  }
  rejectOrders.value = selectedRows.map((row) => row.wfActivityId);
  rejectModalApi.open();
};

const handleRejectClose = () => {
  console.warn('handleRejectClose');
  ChcGridApi.query();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <rejectModal :reject-orders="rejectOrders" @close="handleRejectClose" />
        <LogModal />
        <FormModal />
        <ChcGrid>
          <template #toolbar-actions>
            <div class="flex w-full items-center justify-between">
              <div class="flex items-center">
                <Button
                  type="primary"
                  @click="handleApproval"
                  class="mr-[0.5rem]"
                  data-testid="button-approval"
                >
                  批准
                </Button>
                <Button
                  type="primary"
                  @click="handleReject"
                  data-testid="button-reject"
                >
                  拒绝
                </Button>
              </div>
              <div class="flex items-center justify-end">
                <Summarize ref="summarizeRef" />
              </div>
            </div>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <RoleFormModal />
        <RoleGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入药品名称"
              @keyup.enter="handleSearch"
              allow-clear
              data-testid="input-productName"
            />
            <Button
              type="primary"
              @click="handleSearch"
              data-testid="button-search-RoleGrid"
            >
              搜索
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
          </template>
        </RoleGrid>
      </template>
    </PageSplit>
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
