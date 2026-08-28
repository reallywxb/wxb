<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Input as AntInput,
  Button,
  message,
  Modal,
  RadioButton,
  RadioGroup,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import fatherCuModalUi from './modals/fatherCuModal.vue';
import locationSettingsModalUi from './modals/locationSettingsModal.vue';
import medicineGroupModalUi from './modals/medicineGroupModal.vue';
import productListModalUi from './modals/productListModal.vue';

const route = useRoute();

const userStore = useUserStore();
console.warn('userStore', userStore);
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};

console.warn('urlParams', urlParams);
// const isFirstLoaded = ref(false); // 是否已初次加载完
const fatherCheckedRow = ref<Record<string, any>>({});
const [FatherCuModal, fatherCuModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: fatherCuModalUi,
  draggable: true,
});

const [FatherGrid, fatherGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
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
    id: 'inventoryCategory',
    // api地址
    queryUrl: '/inventoryStrategyAction/queryInventoryStrategy.do',
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '日期',
        defaultValue: [dayjs().subtract(3, 'day').format('YYYY-MM-DD')],
        formItemClass: 'col-span-1',
      },
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
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
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
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            autoChooseFirstOption: true,
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            if (
              fatherGridApi.formApi?.getFieldComponentRef &&
              typeof fatherGridApi.formApi?.getFieldComponentRef ===
                'function' &&
              fatherGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              fatherGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              fatherGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              fatherGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              fatherGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        componentProps: () => {
          return {
            placeholder: '编码/搜索码/名称',
            maxlength: 50,
          };
        },
      },
    ],
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        visible: false,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'departmentName',
        title: '院区',
        width: 250,
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        width: 250,
        sortable: true,
      },
      {
        field: 'name',
        title: '策略名称',
        // width: '160',
        sortable: true,
      },
      {
        field: 'categoryName',
        title: '盘点类型',
        width: '110',
        sortable: true,
      },
      {
        field: 'inventoryParticleName',
        title: '盘点粒度',
        width: '110',
        sortable: true,
      },
      {
        field: 'preciousTypeName',
        title: '是否高值',
        width: '110',
        sortable: true,
      },
      {
        field: 'valuationTypeName',
        title: '是否计价',
        width: '110',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建日期',
        width: 150,
        sortable: true,
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表 radioChange', row);
        fatherCheckedRow.value = toRaw(row);
        if (isEmpty(fatherCheckedRow.value)) {
          clearAllSonTableData();
        } else {
          getSonTableData();
        }
      },
    },
    tableSearchExtraParams: {
      docStatus: 'CO',
    },
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      if (isEmpty(params.rows)) {
        console.warn('无数据');
        // 清楚所有子表数据
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const handleDel = () => {
  const row = fatherGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择盘点策略');
    return;
  }
  const params = {
    ids: JSON.stringify([unProxyRow.inventoryStrategyId]),
  };
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/inventoryStrategyAction/deleteInventoryStrategy.do',
          params,
        );
        fatherGridApi.query();
      } catch (error) {
        console.warn('err', error);
      }
    },
  });
};
const handleEdit = () => {
  const row = fatherGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录');
  }
  fatherCuModalApi
    .setData({
      modalType: 'EDIT',
      modalTitle: '修改策略',
      row: unProxyRow,
      callback() {
        fatherGridApi.query();
      },
    })
    .open();
};
const handleAdd = () => {
  fatherCuModalApi
    .setData({
      modalType: 'ADD',
      modalTitle: '添加策略',
      callback() {
        fatherGridApi.query();
      },
    })
    .open();
};
// 子表
const TabVals = {
  MedicineGroup: 0,
  ProductList: 1,
  LocationList: 2,
};
type TabValsType = (typeof TabVals)[keyof typeof TabVals];
const tabs = [
  {
    label: '药品组',
    value: TabVals.MedicineGroup,
  },
  {
    label: '商品列表',
    value: TabVals.ProductList,
  },
  {
    label: '货位列表',
    value: TabVals.LocationList,
  },
];
const currentTab = ref<TabValsType>(TabVals.MedicineGroup);
const getSonTableData = () => {
  medicineGroupGridApi.query();
  productListGridApi.query();
  locationListGridApi.query();
};
const clearAllSonTableData = () => {
  medicineGroupGridApi.grid.reloadData([]);
  productListGridApi.grid.reloadData([]);
  locationListGridApi.grid.reloadData([]);
};
// 药品组
const [MedicineGroupModal, medicineGroupModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: medicineGroupModalUi,
  draggable: true,
});

const [MedicineGroupGrid, medicineGroupGridApi] = useSpdGrid(
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
    id: 'inventoryCategory_MedicineGroup',
    // api地址
    queryUrl: '/inventoryStrategyAction/queryInveStraProdCatagory.do',
    // 表单配置
    formSchema: [],
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        visible: false,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'productCategoryName',
        title: '药品组',
        // width: '120',
        sortable: true,
      },
    ],

    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('药品组 radioChange', row);
      },
    },
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      console.warn('beforeFetchFn params', params);
      if (isEmpty(fatherCheckedRow.value)) {
        return false;
      }
      if (!isEmpty(fatherCheckedRow.value)) {
        params.inventoryStrategyId = fatherCheckedRow.value.inventoryStrategyId;
      }
      return params;
    },
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const handleMedicineGroupAdd = () => {
  const row = fatherGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录');
    return;
  }
  medicineGroupModalApi
    .setData({
      row: unProxyRow,
      callback() {
        medicineGroupGridApi.query();
      },
    })
    .open();
};
const handleMedicineGroupDel = () => {
  const row = medicineGroupGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择盘点策略');
    return;
  }
  const params = {
    ids: JSON.stringify([unProxyRow.inveStraProdCategoryId]),
  };
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/inventoryStrategyAction/deleteInveStraProdCatagory.do',
          params,
        );
        medicineGroupGridApi.query();
      } catch (error) {
        console.warn('err', error);
      }
    },
  });
};
const handleMedicineGroupSearch = () => {
  if (isEmpty(fatherCheckedRow.value)) {
    medicineGroupGridApi.grid.reloadData([]);
    return;
  }
  medicineGroupGridApi.query();
};
// 商品列表
const productListForm = ref<{
  productName: string;
}>({
  productName: '',
});
const [ProductListModal, productListModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: productListModalUi,
  draggable: true,
});
const [ProductListGrid, productListGridApi] = useSpdGrid(
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
    id: 'inventoryCategory_ProductList',
    // api地址
    queryUrl: '/inventoryStrategyAction/queryInveStraProdList.do',
    // 表单配置
    // formSchema: [
    //   {
    //     component: 'Input',
    //     fieldName: 'productName',
    //     label: '名称',
    //     componentProps: () => {
    //       return {
    //         placeholder: '请输入名称',
    //       };
    //     },
    //   },
    // ],
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        visible: false,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
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
        // width: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '130',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '130',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: true,
      },
    ],

    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('商品列表 radioChange', row);
      },
    },
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      console.warn('beforeFetchFn params', params);
      if (isEmpty(fatherCheckedRow.value)) {
        return false;
      }
      if (!isEmpty(fatherCheckedRow.value)) {
        params.inventoryStrategyId = fatherCheckedRow.value.inventoryStrategyId;
      }
      console.warn('beforeFetchFn productListForm', productListForm.value);
      params.productName = productListForm.value.productName;
      return params;
    },
    afterFetchFn: (params: any) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const handleProductListAdd = () => {
  const row = fatherGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录');
    return;
  }
  productListModalApi
    .setData({
      row: unProxyRow,
      callback() {
        productListGridApi.query();
      },
    })
    .open();
};
const handleProductListDel = () => {
  const row = productListGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择盘点策略');
    return;
  }
  const params = {
    ids: JSON.stringify([unProxyRow.inveStraProdListId]),
  };
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/inventoryStrategyAction/deleteInveStraProdList.do',
          params,
        );
        productListGridApi.query();
      } catch (error) {
        console.warn('err', error);
      }
    },
  });
};
const handleProductListSearch = () => {
  if (isEmpty(fatherCheckedRow.value)) {
    productListGridApi.grid.reloadData([]);
    return;
  }
  productListGridApi.query();
};
// 货位列表
const [LocationSettingsModal, locationSettingsModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: locationSettingsModalUi,
  draggable: true,
});

const [LocationListGrid, locationListGridApi] = useSpdGrid(
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
    id: 'inventoryCategory_LocationList',
    // api地址
    queryUrl: '/inventoryStrategyAction/queryInveStraAllocation.do',
    // 表单配置
    formSchema: [],
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        visible: false,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'sectionName',
        title: '库区',
        // width: '100',
        sortable: true,
      },
      {
        field: 'fromlocatorName',
        title: '开始货位',
        // width: '120',
        sortable: true,
      },
      {
        field: 'tolocatorName',
        title: '截止货位',
        // width: '200',
        sortable: true,
      },
    ],

    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('货位列表 radioChange', row);
      },
    },
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      console.warn('beforeFetchFn params', params);
      if (isEmpty(fatherCheckedRow.value)) {
        return false;
      }
      if (!isEmpty(fatherCheckedRow.value)) {
        params.inventoryStrategyId = fatherCheckedRow.value.inventoryStrategyId;
      }
      return params;
    },
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const handleLocationListAdd = () => {
  const row = fatherGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录');
    return;
  }
  locationSettingsModalApi
    .setData({
      row: unProxyRow,
      callback() {
        locationListGridApi.query();
      },
    })
    .open();
};
const handleLocationListDel = () => {
  const row = locationListGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择盘点策略');
    return;
  }
  const params = {
    ids: JSON.stringify([unProxyRow.inveStraAllocationId]),
  };
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/inventoryStrategyAction/deleteInveStraAllocation.do',
          params,
        );
        locationListGridApi.query();
      } catch (error) {
        console.warn('err', error);
      }
    },
  });
};
const handleLocationListSearch = () => {
  if (isEmpty(fatherCheckedRow.value)) {
    locationListGridApi.grid.reloadData([]);
    return;
  }
  locationListGridApi.query();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <FatherCuModal />
    <MedicineGroupModal />
    <ProductListModal />
    <LocationSettingsModal />
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <FatherGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleAdd"
              class="mr-[0.5rem]"
              data-testid="button_add"
            >
              新增
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleEdit"
              class="mr-[0.5rem]"
              data-testid="button_edit"
            >
              修改
              <template #icon>
                <EditActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              danger
              @click="handleDel"
              class="mr-[0.5rem]"
              data-testid="button_delete"
            >
              删除
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
          </template>
        </FatherGrid>
      </template>
      <template #second>
        <div
          class="relative box-border flex h-full w-full flex-col items-start justify-start"
        >
          <div class="mb-3 box-border w-full bg-white p-[8.4px_8px]">
            <RadioGroup
              v-model:value="currentTab"
              button-style="solid"
              data-testid="RadioGroup_currentTab_vendorCertPreCheck"
            >
              <template v-for="item in tabs" :key="item.value">
                <RadioButton
                  :value="item.value"
                  :data-testid="`RadioButton_${item.value}_vendorCertPreCheck`"
                >
                  {{ item.label }}
                </RadioButton>
              </template>
            </RadioGroup>
          </div>
          <div class="bg-pink relative box-border w-full flex-1">
            <div class="absolute box-border h-full w-full">
              <MedicineGroupGrid v-show="currentTab === TabVals.MedicineGroup">
                <template #toolbar-actions>
                  <Button
                    type="primary"
                    @click="handleMedicineGroupAdd"
                    class="mr-[0.5rem]"
                    data-testid="button_add_medicineGroup"
                  >
                    新增
                    <template #icon>
                      <AddActionIcon />
                    </template>
                  </Button>

                  <Button
                    type="primary"
                    danger
                    @click="handleMedicineGroupDel"
                    class="mr-[0.5rem]"
                    data-testid="button_delete_medicineGroup"
                  >
                    删除
                    <template #icon>
                      <SvgDeleteIcon />
                    </template>
                  </Button>
                  <Button
                    v-if="false"
                    type="primary"
                    @click="handleMedicineGroupSearch"
                    class="mr-[0.5rem]"
                    data-testid="button_search_medicineGroup"
                  >
                    查询
                    <template #icon>
                      <SearchActionIcon />
                    </template>
                  </Button>
                </template>
              </MedicineGroupGrid>
              <ProductListGrid v-show="currentTab === TabVals.ProductList">
                <template #toolbar-actions>
                  <Button
                    type="primary"
                    @click="handleProductListAdd"
                    class="mr-[0.5rem]"
                    data-testid="button_add_productList"
                  >
                    新增
                    <template #icon>
                      <AddActionIcon />
                    </template>
                  </Button>

                  <Button
                    type="primary"
                    danger
                    @click="handleProductListDel"
                    class="mr-[0.5rem]"
                    data-testid="button_delete_productList"
                  >
                    删除
                    <template #icon>
                      <SvgDeleteIcon />
                    </template>
                  </Button>
                  <div class="col-span-1 flex items-center justify-start">
                    <label class="w-[70px] text-sm font-medium text-inherit">
                      药品
                    </label>
                    <AntInput
                      v-model:value="productListForm.productName"
                      placeholder="请输入药品名称"
                      class="mr-[0.5rem]"
                      data-testid="input_productName"
                    />
                  </div>

                  <Button
                    type="primary"
                    @click="handleProductListSearch"
                    class="mr-[0.5rem]"
                    data-testid="button_search_productList"
                  >
                    查询
                    <template #icon>
                      <SearchActionIcon />
                    </template>
                  </Button>
                </template>
              </ProductListGrid>
              <LocationListGrid v-show="currentTab === TabVals.LocationList">
                <template #toolbar-actions>
                  <Button
                    type="primary"
                    @click="handleLocationListAdd"
                    class="mr-[0.5rem]"
                    data-testid="button_add_locationList"
                  >
                    新增
                    <template #icon>
                      <AddActionIcon />
                    </template>
                  </Button>

                  <Button
                    type="primary"
                    danger
                    @click="handleLocationListDel"
                    class="mr-[0.5rem]"
                    data-testid="button_delete_locationList"
                  >
                    删除
                    <template #icon>
                      <SvgDeleteIcon />
                    </template>
                  </Button>
                  <Button
                    v-if="false"
                    type="primary"
                    @click="handleLocationListSearch"
                    class="mr-[0.5rem]"
                    data-testid="button_search_locationList"
                  >
                    查询
                    <template #icon>
                      <SearchActionIcon />
                    </template>
                  </Button>
                </template>
              </LocationListGrid>
            </div>
          </div>
        </div>
      </template>
    </PageSplitLazy>
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
