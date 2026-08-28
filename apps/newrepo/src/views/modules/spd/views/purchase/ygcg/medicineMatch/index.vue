<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, UploadActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import GetMedcineModalComp from './modals/getMedcineModal.vue';
import ImportModalComp from './modals/importModal.vue';
import MedcineMatchModalComp from './modals/medcineMatchModal.vue';

const userStore = useUserStore();
const route = useRoute();

const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
// const page = urlParams?.page;
console.warn('urlParams', urlParams);
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // searchController.sign();
});
const [MedcineMatchModal, medcineMatchModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: MedcineMatchModalComp,
  draggable: true,
});
const [GetMedcineModal, getMedcineModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: GetMedcineModalComp,
  draggable: true,
});
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        commonConfig: {
          labelClass: 'w-[90px]',
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
          autoLoad: true,
        },
        cellStyle: ({ row }: { row: any }) => {
          if (row.pricePO !== row.ypPricePO) {
            return {
              color: 'red',
            };
          }
          return {};
        },
      }),
    },
    {
      id: 'vendormacth',
      // api地址
      queryUrl: '/ygcgProductAction/queryHospitalProductYP.do',
      gridColumns: [
        {
          type: 'checkbox',
          width: 50,
          align: 'center',
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
          width: '100',
          sortable: true,
        },
        {
          field: 'productName',
          title: '药品名称',
          width: '100',
          sortable: true,
        },
        {
          field: 'medicineName',
          title: '通用名',
          width: '100',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '单位',
          width: '60',
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
          width: '100',
          sortable: true,
        },
        {
          field: 'activeName',
          title: '活跃',
          width: '60',
        },
        {
          field: 'pricePO',
          title: '采购价',
          width: '90',
          align: 'right',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.pricePO);
          },
          sortable: true,
        },
        {
          field: 'ypProductName',
          title: '阳光药品名',
          width: '120',
          sortable: true,
        },
        {
          field: 'ypOutlookc',
          title: '阳光药品规格',
          width: '120',
          sortable: true,
        },
        {
          field: 'ypPricePO',
          title: '阳光药品价格',
          width: '120',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.ypPricePO);
          },
          align: 'right',
          sortable: true,
        },
        {
          field: 'ypUnit',
          title: '阳光单位',
          width: '100',
          sortable: true,
        },
        {
          field: 'ypCompanyNameSc',
          title: '阳光药品厂家',
          width: '120',
          sortable: true,
        },
        {
          field: 'ypGoodsId',
          title: '阳光药品编码',
          width: '120',
          sortable: true,
        },
        {
          field: 'ypProvinceId',
          title: '阳光药品省码',
          width: '120',
          sortable: true,
        },
        {
          field: 'ypMultiplyRate',
          title: '阳光药品乘率',
          width: '120',
          sortable: true,
        },
        {
          field: 'ypDivideRate',
          title: '阳光药品除率',
          width: '120',
          sortable: true,
        },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'ChcSelect',
          fieldName: 'orgId',
          label: '医院',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/orgList.do',
              placeholder: '请选择医院',
              paginate: false,
              showChooseAll: false,
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              defaultValue: '',
              autoChooseFirstOption: true,
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
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
              placeholder: `请选择仓库`,
              paginate: false,
              showChooseAll: '',
              immediate: true,
              mode: 'multiple',
              maxTagCount: 1,
              maxTagTextLength: 5,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          fieldName: 'warehouseId',
          label: '仓库',
        },
        {
          component: 'Input',
          fieldName: 'productName',
          label: '药品',
          componentProps: () => {
            return {
              placeholder: '请输入药品名称',
              allowClear: true,
            };
          },
        },
        {
          component: 'ChcSelect',
          fieldName: 'isMacth',
          label: '匹配状态',
          componentProps: () => {
            return {
              dictUrl: 'baseHandleAction/refList.do?id=319',
              placeholder: '请选择匹配状态',
              paginate: false,
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              defaultValue: '',
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
          fieldName: 'isDifPrice',
          label: '价格不一致',
          componentProps: () => {
            return {
              dictUrl: 'baseHandleAction/refList.do?id=319',
              placeholder: '请选择价格状态',
              paginate: false,
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              defaultValue: '',
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
          fieldName: 'isActive',
          label: '是否活跃',
          componentProps: () => {
            return {
              dictUrl: 'baseHandleAction/refList.do?id=319',
              placeholder: '请选择是否活跃',
              paginate: false,
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              defaultValue: '',
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
          fieldName: 'productCategoryId',
          label: '商品类别',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/productCategoryList.do',
              placeholder: '请选择商品类别',
              paginate: false,
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              defaultValue: '',
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
      ],
      gridEvents: {},
      showCustomBtn: true,
      showZoomBtn: true,
      beforeFetchFn: (params) => {
        if (Array.isArray(params.warehouseId)) {
          params.warehouseId = params.warehouseId.join(',');
        }
        console.warn('params1111:', params);
        return params;
      },
      afterFetchFn: (params) => {
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
    },
  );

// TODO:导入 1.模板是空模板，2.导入报错
const handleImport = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  importModalApi
    ?.setData({
      orgId: formValues.orgId, // 医院ID
    })
    .open();
};
const handleMedcineMatch = async () => {
  // const row = ChcGridApi.grid.getRadioRecord(true);
  // const rawRow = toRaw(row);
  // console.warn('handleMacth row:', row);
  // console.warn('handleMacthrawRow:', rawRow);
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows = toRaw(rows);
  console.warn('handleMedcineMatch rows:', rows);
  console.warn('handleMedcineMatchrawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请选择需要匹配的数据');
    return;
  }
  if (rawRows.length > 1) {
    message.warning('只能选择一个药品进行匹配');
    return;
  }
  medcineMatchModalApi
    .setData({
      row: rawRows[0],
      orgId: formValues.orgId, // 医院ID
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
const handleGetMedcine = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  getMedcineModalApi
    .setData({
      orgId: formValues.orgId, // 医院ID
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
// TODO:同步失败
const handleMedcineSync = async () => {
  // const row = ChcGridApi.grid.getRadioRecord(true);
  // const rawRow = toRaw(row);
  // console.warn('handleMedcineSync row:', row);
  // console.warn('handleMedcineSyncrawRow:', rawRow);
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }

  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleMedcineMatch rows:', rows);
  console.warn('handleMedcineMatchrawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请选择药品');
    return;
  }
  const sends: any[] = [];
  rawRows.forEach((row) => {
    sends.push({
      productId: row.productId,
    });
  });

  const params = {
    data: JSON.stringify(sends),
    orgId: formValues.orgId, // 医院ID
  };
  Modal.confirm({
    title: '提示',
    content: `确认操作?`,
    onOk: async () => {
      try {
        await requestFormClient.post('/ygcgProductAction/syncyp.do', params);
        ChcGridApi.query();
      } catch (error) {
        console.error('同步失败', error);
      }
    },
  });
};
const cancelMatch = async () => {
  // const row = ChcGridApi.grid.getRadioRecord(true);
  // const rawRow = toRaw(row);
  // console.warn('handleMedcineSync row:', row);
  // console.warn('handleMedcineSyncrawRow:', rawRow);
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }

  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  if (isEmpty(rawRows)) {
    message.warning('请选择药品');
    return;
  }

  const sends: any[] = [];
  rawRows.forEach((row) => {
    sends.push({
      productId: row.productId,
    });
  });

  const params = {
    data: JSON.stringify(sends),
    orgId: formValues.orgId, // 医院ID
  };
  Modal.confirm({
    title: '提示',
    content: `确认操作?`,
    onOk: async () => {
      try {
        await requestFormClient.post(
          '/ygcgProductAction/macthcancel.do',
          params,
        );
        ChcGridApi.query();
      } catch (error) {
        console.error('取消匹配失败', error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <MedcineMatchModal />
    <ImportModal />
    <GetMedcineModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import"
        >
          导 入
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          @click="cancelMatch"
          class="mr-[0.5rem]"
          data-testid="button_cancelMatch"
        >
          取消匹配
        </Button>
        <Button
          type="primary"
          @click="handleMedcineMatch"
          class="mr-[0.5rem]"
          data-testid="button_medcineMatch"
        >
          药品匹配
        </Button>
        <Button
          type="primary"
          @click="handleGetMedcine"
          class="mr-[0.5rem]"
          data-testid="button_getMedcine"
        >
          药品拉取
        </Button>
        <Button
          type="primary"
          @click="handleMedcineSync"
          class="mr-[0.5rem]"
          data-testid="button_medcineSync"
        >
          药品同步
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
