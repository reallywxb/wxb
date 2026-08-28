<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const route = useRoute();
const userStore = useUserStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('urlParams', urlParams);
// const isFirstLoaded = ref(false); // 是否已初次加载完

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
});

const fatherTableCheckedRow = ref<Record<string, any>>({});

const [ChcGrid, ChcGridApi] = useSpdGrid(
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
    id: 'splitOddPackage',
    // api地址
    queryUrl: '/packageAction/query.do?packageType=M',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: '50',
        align: 'center',
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        width: '50',
        align: 'center',
      },

      {
        field: 'packageNo',
        title: '包装号',
        // width: '200',
        sortable: true,
      },
      {
        field: 'created',
        title: '操作时间',
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
        width: '110',
        sortable: true,
      },
      {
        field: 'moveInTime',
        title: '入库时间',
        width: '200',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: {
          placeholder: '请输入包装号',
          allowClear: true,
          onPressEnter: async (e: any) => {
            // 在这里处理回车事件
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            handlePackageNoEnter(e);
          },
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        fatherTableCheckedRow.value = {};
        fatherTableCheckedRow.value = row;
        if (!isEmpty(row)) {
          SonChcGridApi.query();
        }
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      if (isEmpty(params.rows)) {
        SonChcGridApi.grid.remove();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handlePackageNoEnter = async (e: any) => {
  console.warn('handlePackageNoEnter e', e);
  const packageNo = e.target.value;
  if (isEmpty(packageNo)) {
    return;
  }
  // const formValues = await ChcGridApi.formApigetFormValues();
  // formValues.packageNo = packageNo;
  try {
    const res = await requestFormClient.post('/packageAction/query.do', {
      packageNo,
      packageType: 'M',
      isAccurate: 'Y',
    });
    if (res.total === 0) {
      message.error('未找到包装信息');
      return;
    }
    const data = res.rows[0];
    // 获取仓库的编码
    const packageId = data?.packageId;
    if (!packageId) {
      message.error('未找到包装信息');
      return;
    }
    const res2 = await requestFormClient.post('/packageAction/queryLine.do', {
      packageId,
    });
    console.warn('res2', res2);
    ChcGridApi.grid.reloadData(res2?.rows || []);
  } catch (error) {
    console.error(error);
  }
};
// 子表
const [SonChcGrid, SonChcGridApi] = useSpdGrid(
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
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false, // 表格初始化时不自动查询数据
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    formSchema: [],
    gridColumns: [
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
        width: '150',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '150',
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
      {
        field: 'qtyText',
        title: '数量',
        width: '80',
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
        width: '110',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: true,
      },
    ],
    id: 'splitOddPackage_son',
    queryUrl: '/packageAction/queryLine.do',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      const row: any = ChcGridApi.grid.getRadioRecord(true);
      if (!isEmpty(row)) {
        params.packageId = row.packageId;
      }
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

const handleSubmit = () => {
  const row: any = ChcGridApi.grid.getRadioRecord(true);
  console.warn('startInventory row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const params: Record<string, any> = {};
  const packageId = row.packageId;
  params.packageId = packageId;
  Modal.confirm({
    title: '提醒',
    content: '确认拆箱吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await requestFormClient.post(
          '/packageAction/splitMixed.do',
          params,
        );
        message.success('成功');
        globalPrintStore.print({
          pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${res.data.join(',')}`,
        });
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
    onCancel() {},
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid>
          <template #toolbar-actions>
            <Button type="primary" @click="handleSubmit" class="mr-[0.5rem]">
              确 认
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <SonChcGrid />
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style scoped>
::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-buttons--wrapper:not(:empty),

) {
  padding: 0 0 0.6em;
}

::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-tools--operate:not(:empty)
) {
  padding: 0 0 0.6em;
}

::v-deep(
  .vxe-grid--toolbar-wrapper .vxe-toolbar .vxe-tools--wrapper:not(:empty)
) {
  padding: 0 0 0.6em;
}

::v-deep(.vxe-cell .ant-btn > svg) {
  margin-right: -4px;
  margin-bottom: 4px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-buttons--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.ant-input-disabled) {
  color: #7c7c7c;
}

::v-deep(.ant-picker .ant-picker-input > input[disabled]) {
  color: #7c7c7c;
}

::v-deep(
  .ant-select-disabled.ant-select:not(.ant-select-customize-input)
    .ant-select-selector
) {
  color: #7c7c7c;
}
</style>
