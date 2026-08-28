<script lang="ts" setup>
import { ref, toRaw } from 'vue';
// import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  SvgDeleteIcon,
  SvgPrintFillIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { commitDo, deleteDo, deleteLineDo } from './api';
import documentModalUI from './modals/documentModal.vue';

const globalPrintStore = useGlobalPrintStore();

const [documentModal, documentModalApi] = useVbenModal({
  connectedComponent: documentModalUI,
});

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      resetButtonOptions: {
        show: false,
      },
    }),
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
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000587',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择养护级别',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            showChooseAll: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'careLevel',
        label: '养护级别',
      },
    ],
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },

      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
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
        field: 'carelevelName',
        title: '养护级别',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '90',
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
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'storageQty',
        title: '库存数量',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        minWidth: '180',
        sortable: true,
      },
    ],
    id: 'child',
    queryUrl: `/productCareAction/queryProductCareDetail.do?page=input`,
    beforeFetchFn: (params) => {
      if (!selectRow.value.productCareId) {
        return false;
      }
      return {
        ...params,
        productCareId: selectRow.value.productCareId,
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
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['careDateFrom', 'careDateTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // stripe: true,

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
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    id: 'parentTable',
    queryUrl: `/productCareAction/queryProductCare.do?page=createInput`,
    gridColumns: [
      {
        type: 'radio',
        minWidth: 120,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productCareNo',
        title: '养护单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'careDate',
        title: '养护时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '养护仓库',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '160',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '养护时间',
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
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',

            // showSearch: true,
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            allowClear: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            showChooseAll: '',
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
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '仓库',
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        roleGridApi.formApi.resetForm();
        if (row && row.productCareId) {
          selectRow.value = row;
          roleGridQuery();
        } else {
          // 父表没数据，子表要清空
          roleGridApi.grid.remove();
          selectRow.value = {};
        }
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const selectRow: any = ref({});

const roleGridQuery = () => {
  roleGridApi.formApi.getValues().then((res: any) => {
    roleGridApi.reload({ ...res });
  });
};

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
};

const handleCreated = () => {
  console.warn('selectRow.value:', selectRow.value);
  documentModalApi.setData({}).open();
};

const handleAdd = () => {
  documentModalApi.setData(selectRow.value).open();
};

const handleDelete = () => {
  if (!selectRow.value.productCareId) {
    message.warn('请选一条记录');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      deleteDo({ productCareId: selectRow.value.productCareId }).then((res) => {
        if (res && res.success) {
          message.success({
            content: '删除成功',
          });
          handleQuery();
        }
      });
    },
  });
};

const handlePrint = () => {
  if (!selectRow.value.productCareId) {
    message.warn('请选一条记录');
    return;
  }
  const unProxyRow = toRaw(selectRow.value);
  Modal.confirm({
    title: '打印提示',
    content: '确认打印订单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      console.warn('unProxyRow:', unProxyRow);
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/ureport/pdf/show?_u=file:ProductCare.ureport.xml&productCareId=${unProxyRow.productCareId}`,
      });
    },
    onCancel() {},
  });
};

const handleCommit = () => {
  if (!selectRow.value.productCareId) {
    message.warn('请选择养护单');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: '确认开始养护？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      commitDo({ productCareId: selectRow.value.productCareId }).then((res) => {
        if (res && res.success) {
          message.success({
            content: '开始养护成功',
          });
          handlePrint();
          handleQuery();
        }
      });
    },
  });
};

const handleChildDelete = () => {
  const checkedRows = roleGridApi.grid.getCheckboxRecords();
  if (checkedRows.length === 0) {
    message.warn('请选择药品行');
    return;
  }
  const params = {
    lines: JSON.stringify(
      checkedRows.map((item: any) => ({
        productCareLineId: item.productCareLineId,
      })),
    ),
  };
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      deleteLineDo(params).then((res) => {
        if (res && res.success) {
          message.success({
            content: '删除成功',
          });
          roleGridQuery();
        }
      });
    },
  });
};

const handleModalConfirm = (isAdd: boolean) => {
  if (isAdd) {
    handleQuery();
  } else {
    roleGridQuery();
  }
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <documentModal @confirm="handleModalConfirm" />
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
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleCreated"
                class="mr-[0.5rem]"
                data-testid="button_created"
              >
                创建养护单
                <template #icon>
                  <AddActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                @click="handleAdd"
                class="mr-[0.5rem]"
                data-testid="button_add"
              >
                添加养护品种
                <template #icon>
                  <AddActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                @click="handleCommit"
                class="mr-[0.5rem]"
                data-testid="button_commit"
              >
                开始养护
              </Button>
              <Button
                type="primary"
                danger
                @click="handleDelete"
                class="mr-[0.5rem]"
                data-testid="button_delete_parent"
              >
                删除
                <template #icon>
                  <SvgDeleteIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrint"
                data-testid="button_print"
              >
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
                打印
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handleChildDelete"
                class="mr-[0.5rem]"
                danger
                data-testid="button_delete_child"
              >
                删除
                <template #icon>
                  <SvgDeleteIcon />
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
