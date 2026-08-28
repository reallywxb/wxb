<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userStore.userInfo');

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
// console.log(urlParamsObj, 'urlParamsObj');

const urlParams: any = {
  specShowType: urlParamsObj?.specShowType || '',
};

const parentTableParams = ref<{ [key: string]: any }>({
  applyPlanId: undefined,
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

      { field: 'productSpec', title: '规格', width: '90', sortable: true },
      {
        field: 'modelNo',
        title: '型号',
        width: '150',
        sortable: true,
        visible: false,
      },
      { field: 'manufacturer', title: '厂家', minWidth: '150', sortable: true },
      { field: 'uomName', title: '单位', width: '72', sortable: true },
      {
        field: 'replenishPackageQty',
        title: '定数',
        width: '80',
        align: 'right',
        sortable: true,
        visible: false,
      },
      {
        field: 'qtyApplied',
        title: '计划数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyOrdered1',
        title: '已请领数量',
        align: 'right',
        width: '100',
        formatter: ({ row }: any) => {
          return row.qtyOrdered;
        },
      },
      {
        field: 'qtyOrdered',
        title: '剩余数量',
        align: 'right',
        width: '100',
      },
    ],
    id: 'applyplanChildGrid',
    // tableSearchExtraParams: parentTableParams.value,
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
const departmentId = ref('');
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
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
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'applyplanQueryParentGrid',
    queryUrl: '/applyPlanAction/query.do',
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'applyPlanNo',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'dateApplied',
        minWidth: 160,
        sortable: true,
        title: '申请时间',
      },
      {
        field: 'applyPlanMonth',
        minWidth: 100,
        sortable: true,
        title: '计划月份',
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
        minWidth: 160,
        sortable: true,
        title: '申请仓库',
      },
      {
        field: 'productControlLevelName',
        minWidth: 120,
        sortable: true,
        title: '商品组',
        visible: userStore.userInfo.isProductControlLevel,
      },
      {
        field: 'docStatusName',
        title: '计划状态',
        sortable: true,
        width: '100',
      },
      {
        field: 'rejectReason',
        title: '退回原因',
        width: '150',
        sortable: true,
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
        sortable: true,
      },
      {
        field: 'approveUserName',
        title: '审核人',
        width: '110',
        sortable: true,
      },
      {
        field: 'approveTime',
        title: '审核时间',
        width: '160',
        sortable: true,
      },

      // {
      //   field: 'isWorkflowEnd',
      //   minWidth: 140,
      //   sortable: true,
      //   title: '审批是否结束',
      //   formatter({ row }: any) {
      //     return row.sourceType === 'Y' ? '是' : '否';
      //   },
      // },
      {
        field: 'description',
        minWidth: 150,
        sortable: true,
        title: '备注',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
        visible: false,
      },
    ],
    formSchema: [
      // {
      //   component: 'DateGroup',
      //   fieldName: 'dateOrdered',
      //   label: '申请时间',
      //   defaultValue: [
      //     dayjs(dayjs().format('YYYY-MM-DD'))
      //       .subtract(1, 'week')
      //       .format('YYYY-MM-DD'),
      //   ],
      //   formItemClass: 'col-span-1',
      // },
      {
        component: 'DatePicker',
        fieldName: 'applyPlanDate',
        label: '计划月份',
        componentProps: () => {
          return {
            picker: 'month',
            format: 'YYYY-MM',
            valueFormat: 'YYYY-MM-DD',
          };
        },
        defaultValue: dayjs(dayjs().format('YYYY-MM-DD')).format('YYYY-MM-DD'),
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            paginate: false,
            allowClear: true,
            showChooseAll: '',
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },

        // defaultValue: 1_000_007,
        fieldName: 'toWarehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '申请仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            allowClear: true,
            onChange(val: any, option: any) {
              console.warn('departmentId', val, option);
              departmentId.value = val;
            },
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!departmentId.value) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            triggerFields: ['departmentId', 'regionId'],
            // onChange(val: any, option: any) {
            // ChcGridApi.formApi?.setFieldValue(
            //   'toWarehouseId',
            //   option?.parentId || undefined,
            // );
            // },

            placeholder: '请选择上级仓库',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // ChcGridApi.formApi?.setFieldValue(
              //   'warehouseId',
              //   res.rows?.[0]?.id || undefined,
              // );
              // ChcGridApi.formApi?.setFieldValue(
              //   'toWarehouseId',
              //   res.rows?.[0]?.parentId || undefined,
              // );
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
        fieldName: 'warehouseId',
        label: '上级仓库',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入编码/拼音码/名称',
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.applyPlanId) {
          parentTableParams.value.applyPlanId = row.applyPlanId;
          selectRow.value = row;
          roleGridApi.query({ applyPlanId: row.applyPlanId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.applyPlanId = undefined;
          roleGridApi.grid.remove();
          selectRow.value = {};
        }
      },
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleSearch = () => {
  roleGridApi.query({
    applyPlanId: parentTableParams.value.applyPlanId,
    productName: parentTableParams.value.productName,
  });
};

const selectRow = ref<any>({});
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
          <ChcGrid class="flex-1 overflow-hidden">
            <!-- <template #action="scope">
              <Button
                type="primary"
                style="background-color: #b17a33d4"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleView(scope.row)"
              >
                查看审批流程
                <template #icon>
                  <IconfontBasicView />
                </template>
              </Button>
            </template> -->
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
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
