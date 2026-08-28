<script lang="ts" setup>
import { nextTick, onMounted, provide } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

import processModal from './modals/processModal.vue';

const userStore = useUserStore();
const route = useRoute();

// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
});
const [ProcessModal, ProcessModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: processModal,
  draggable: true,
});
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi?.formApi?.getFieldComponentRef &&
    typeof ChcGridApi?.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi?.formApi?.getFieldComponentRef(fieldName) &&
    ChcGridApi?.formApi?.getFieldComponentRef(fieldName).params
  );
};
const fetchSelectOptions = (fieldName: string, params: Record<string, any>) => {
  const c = isFieldComponentRefExist(fieldName);
  if (c) {
    const refInst = ChcGridApi.formApi.getFieldComponentRef(
      fieldName,
    ) as unknown as SelectComponentRef;
    if (refInst && refInst.params) {
      Object.assign(refInst.params, params);
      if (typeof refInst?.fetchApi === 'function') {
        refInst.fetchApi();
      }
    }
  }
};
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'scatteredCreate',
    // api地址
    queryUrl: '/movementAction/queryStorage.do?isScatter=Y',
    gridColumns: [
      {
        type: 'radio',
        width: 50,
        align: 'center',
        title: '单选',
        visible: false,
      },
      {
        type: 'seq',
        width: 50,
        align: 'center',
        title: '序号',
      },

      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '130',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '140',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '110',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '130',
        sortable: true,
      },
      {
        field: 'price',
        title: '采购价',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'isSerNo',
        title: '厂家码管理',
        width: '100',

        sortable: true,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'qtyAvailable',
        title: '可加工数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '200',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: '150',
        sortable: true,
      },
      {
        field: 'productionDate',
        title: '生产日期',
        width: '110',
        sortable: true,
      },
      {
        field: 'productArea',
        title: '产地',
        width: '110',
        sortable: true,
      },
      {
        field: 'certificateNo',
        title: '批准文号',
        width: '110',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '130',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            defaultValue: '',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              nextTick(() => {
                fetchSelectOptions('warehouseId', {
                  dictUrl: `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${-1}`,
                });
              });
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            // dictUrl: 'baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择仓库',
            paginate: false,
            showChooseAll: '',
            autoChooseFirstOption: true,
            // immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (!isEmpty(res.rows)) {
                const firstOption = res.rows[0];
                ChcGridApi?.formApi?.setFieldValue(
                  'warehouseId',
                  firstOption.id,
                );
              }
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            const c = isFieldComponentRefExist('warehouseId');
            console.warn('isFieldComponentRefExist warehouseId', c);
            if (c) {
              const refInst = ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${values?.departmentId || -1}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst?.fetchApi();
                  ChcGridApi?.formApi?.setFieldValue('warehouseId', undefined);
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
        componentProps: () => {
          return {
            placeholder: '编码/拼音码/名称',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'storageStatus',
        label: '存货状态',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: 'baseHandleAction/refList.do?id=1000346',
            placeholder: '请选择存货状态',
            paginate: false,
            showChooseAll: '',
            // defaultValue: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: false,
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '请选择供应商',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        componentProps: () => {
          return {
            placeholder: '请输入批号',
          };
        },
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const refreshScatteredCreateTable = () => {
  ChcGridApi.query();
};
provide('refreshScatteredCreateTable', refreshScatteredCreateTable);

const handleSubmit = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handleSubmit row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条数据');
    return;
  }
  ProcessModalApi.setData({
    row: deepClone(row),
  }).open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ProcessModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleSubmit"
          class="mr-[0.5rem]"
          data-testid="button_submit"
        >
          散货加工
        </Button>
      </template>
    </ChcGrid>
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

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>
