<script lang="ts" setup>
import { nextTick, ref, toRaw } from 'vue';
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
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import applyModalUi from './modals/applyModal.vue';
import pkgModalUi from './modals/pkgModal.vue';

const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const route = useRoute();

const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
let docType = urlParams?.docType || '';
if (docType === 'I ') {
  docType = 'I+';
}

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
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

const [ApplyModal, AddModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: applyModalUi,
  draggable: true,
});
const [PkgModal, PkgModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 链接抽离的组件
  connectedComponent: pkgModalUi,
  draggable: true,
});
const checkedRow = ref<Record<string, any>>({});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
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
    }),
  },
  {
    id: 'outInput',
    // api地址
    queryUrl: 'inventoryAction/queryStorage.do',
    gridColumns: [
      {
        type: 'radio',
        width: '50',
        align: 'center',
        visible: false,
        title: '单选',
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
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
        width: '90',
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
        width: '60',
        sortable: true,
      },
      {
        field: 'qtyAvailable',
        title: '可用库存',
        width: '110',
        align: 'right',
        visible: docType === 'I+',
        sortable: true,
      },
      {
        field: 'pricePo',
        title: '采购价',
        width: '70',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '100',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '180',
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
        field: 'locatorName',
        title: '货位',
        width: '180',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '存货状态',
        width: '100',
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
            placeholder: `请选择院区`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign();
                nextTick(() => {
                  fetchSelectOptions('warehouseId', {
                    dictUrl: `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${-1}`,
                  });
                });
              }
              return { ...res, rows: undefined, records: res.rows };
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
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: `请选择仓库`,
            autoChooseFirstOption: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(value: any) {
              console.warn('warehouseId onChange', value);
              searchController.sign();
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
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
                  refInst.fetchApi();
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
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: ``,
            defaultValue: '',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: (p: any) => {
        console.warn('radioChange', p);
        checkedRow.value = {};
        checkedRow.value = toRaw(p.row);
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      params.haveAvailableQty = docType === 'I-' ? 'Y' : 'N';
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('getTableArrDataFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleApply = () => {
  if (isEmpty(checkedRow.value)) {
    message.error(`请选择${docType === 'I-' ? '报损' : '报溢'}药品！`);
    return;
  }
  if (checkedRow.value?.isStoragePackage === 'Y' && docType === 'I-') {
    PkgModalApi.setData({
      row: toRaw(checkedRow.value),
    }).open();
  } else {
    AddModalApi.setData({
      row: toRaw(checkedRow.value),
      modalTitle: `${docType === 'I-' ? '报损' : '报溢'}申请`,
    }).open();
  }
};

const refreshTable = () => {
  ChcGridApi.query();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ApplyModal :after-submit="refreshTable" />
    <PkgModal :after-submit="refreshTable" />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleApply"
          class="mr-[0.5rem]"
          data-testid="button_apply"
        >
          报损申请
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
</style>
