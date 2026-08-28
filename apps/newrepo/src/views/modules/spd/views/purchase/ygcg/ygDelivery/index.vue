<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import GetMedcineModalComp from './modals/getMedcineModal.vue';

const route = useRoute();

const userStore = useUserStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const page = urlParams?.page;
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 创建响应式变量用于院区接口的hospitalId参数传递
// @description 创建extraParams响应式对象，用于动态传递hospitalId参数到院区接口
const departmentExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});
// AI-GENERATED-END

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  setTimeout(() => {
    // 触发自动查询
    searchController.sign();
  }, 200);
  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});

// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 参考medicineMatch页面的药品拉取功能，在ygDelivery页面添加相同的药品拉取弹窗
// @description 创建药品拉取弹窗实例，配置弹窗样式和关联组件
const [GetMedcineModal, getMedcineModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: GetMedcineModalComp,
  draggable: true,
});
// AI-GENERATED-END

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
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
    }),
  },
  {
    id: 'orderdetail',
    // api地址
    queryUrl: '/ygcgProductAction/queryOrderLineDistribute.do',
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'orgName',
        title: '客户名称',
        width: '160',
        sortable: false,
      },
      {
        field: 'departmentName',
        title: '院区',
        width: '150',
        sortable: false,
      },
      {
        field: 'distributedNo',
        title: '平台配送单号',
        width: '150',
        sortable: true,
      },
      {
        field: 'asnNo',
        title: 'SPD配送单号',
        width: '150',
        sortable: true,
      },
      {
        field: 'inoutLineId',
        title: 'SPD配送行号',
        width: '150',
        sortable: true,
      },
      {
        field: 'ygcgOrderLineId',
        title: '平台订单行号',
        width: '150',
        sortable: true,
      },
      {
        field: 'ygcgOrderId',
        title: '平台订单号',
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库名称',
        width: '130',
        sortable: false,
      },
      {
        field: 'provinceId',
        title: '省标代码',
        width: '150',
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: false,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '75',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        width: '120',
        sortable: false,
      },
      {
        field: 'price',
        title: '价格',
        width: '90',
        align: 'right',
        sortable: true,
        // formatter({ cellValue }) {
        //   return handlePriceToFixedTwo(cellValue);
        // },
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        width: '150',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '120',
        sortable: true,
      },
      {
        field: 'distributeCount',
        title: '配送数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'distributeTime',
        title: '配送时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'movementqty',
        title: 'SPD配送数量',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'warehouseCount',
        title: '收货数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'warehouseTime',
        title: '收货时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'pickStatus',
        title: '匹配状态',
        width: '100',
        sortable: false,
      },
      {
        field: 'pickProgress',
        title: '匹配进度',
        width: '100',
        sortable: false,
      },
      {
        field: 'receiveStatus',
        title: '回传状态',
        width: '100',
        sortable: false,
        formatter: ({ row }: any) => {
          return row.receiveStatus === 'Y'
            ? '已上传'
            : row.receiveStatus === 'E'
              ? '错误'
              : '未上传';
        },
      },
      {
        field: 'receiveTime',
        title: '回传时间',
        width: '100',
        sortable: true,
      },
      {
        field: 'isRate',
        title: '7002',
        width: '70',
        sortable: false,
        formatter: ({ row }: any) => {
          return row.isRate === 'Y' ? '已生成' : '未生成';
        },
      },
      {
        field: 'isYb',
        title: '3502',
        width: '70',
        sortable: false,
        formatter: ({ row }: any) => {
          return row.isYb === 'Y' ? '已生成' : '未生成';
        },
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '订单日期',
        defaultValue: [
          // 2天前
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(2, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
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
            // AI-GENERATED-BEGIN
            // @date 2026-07-16
            // @prompt 使用extraParams传递hospitalId参数到院区接口
            // @description 配置extraParams为响应式对象，使接口能够接收到hospitalId参数
            extraParams: departmentExtraParams.value,
            // AI-GENERATED-END
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // AI-GENERATED-BEGIN
        // @date 2026-07-16
        // @prompt 参考orderCreate页面实现院区与医院的联动
        // @description 使用dependencies配置联动逻辑，当orgId变化时更新院区接口的hospitalId参数并重新获取数据
        dependencies: {
          triggerFields: ['orgId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                ChcGridApi.formApi?.getFieldComponentRef &&
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                ChcGridApi.formApi?.getFieldComponentRef('departmentId') &&
                ChcGridApi.formApi?.getFieldComponentRef('departmentId').params;
              if (cond) {
                // 更新extraParams中的hospitalId
                departmentExtraParams.value.hospitalId = values?.orgId || '';
                // 设置依赖参数
                ChcGridApi.formApi.getFieldComponentRef(
                  'departmentId',
                ).params.dependencies = {
                  hospitalId: values?.orgId || '',
                };
                // 重新调用接口获取数据
                ChcGridApi.formApi
                  ?.getFieldComponentRef('departmentId')
                  ?.fetchApi();
                // 清空院区字段已选择的值
                ChcGridApi.formApi?.setFieldValue('departmentId', '');
              }
            });
          },
        },
        // AI-GENERATED-END
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '采购仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择采购仓库',
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              const rows =
                res.rows?.filter((item: any) => item.warehouseType === '1') ||
                [];
              return { ...res, rows: undefined, records: rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'ygcgOrderLineId',
        label: '平台订单行号',
        componentProps: () => {
          return {};
        },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {
      page,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 参考medicineMatch页面的handleGetMedcine函数，添加药品拉取处理函数
// @description 处理药品拉取操作，验证医院选择并打开拉取弹窗
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
// AI-GENERATED-END

const handleOnlineRate = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleOnlineRate rows:', rows);
  console.warn('handleOnlineRate rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const distributedIds = rawRows.map((row: any) => row.distributedId).join(',');
  const params = {
    distributedId: distributedIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认操作吗?`,
    onOk: async () => {
      try {
        console.warn('handleOnlineRate params:', params);
        await requestFormClient
          .post('/ygcgProductAction/createRate.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChcGridApi.query();
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
const handleCHS = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleCHS rows:', rows);
  console.warn('handleCHS rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const distributedIds = rawRows.map((row: any) => row.distributedId).join(',');
  const params = {
    distributedId: distributedIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认操作吗?`,
    onOk: async () => {
      try {
        console.warn('handleCHS params:', params);
        await requestFormClient
          .post('/ygcgProductAction/create.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChcGridApi.query();
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
const handleRecive = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleRecive rows:', rows);
  console.warn('handleRecive rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const distributedIds = rawRows.map((row: any) => row.distributedId).join(',');
  const params = {
    distributedId: distributedIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认收货回传吗?`,
    onOk: async () => {
      try {
        console.warn('handleRecive params:', params);
        await requestFormClient
          .post('/ygcgProductAction/returnDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '收货回传成功');
            }
            ChcGridApi.query();
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
const handleMatch = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleMatch rows:', rows);
  console.warn('handleMatch rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const distributedIds = rawRows.map((row: any) => row.distributedId).join(',');
  const params = {
    distributedId: distributedIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认匹配吗?`,
    onOk: async () => {
      try {
        console.warn('handleMatch params:', params);
        await requestFormClient
          .post('/ygcgProductAction/pickDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '匹配成功');
            }
            ChcGridApi.query();
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
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
          @click="handleGetMedcine"
          class="mr-[0.5rem]"
          data-testid="button_getMedcine"
        >
          获取配送信息
        </Button>
        <Button
          type="primary"
          @click="handleMatch"
          class="mr-[0.5rem]"
          data-testid="button_match"
        >
          阳光收货匹配
        </Button>
        <Button
          type="primary"
          @click="handleRecive"
          class="mr-[0.5rem]"
          data-testid="button_recive"
        >
          阳光收货回传
        </Button>
        <Button
          type="primary"
          @click="handleOnlineRate"
          class="mr-[0.5rem]"
          data-testid="button_upload"
        >
          生成网采率7002
        </Button>
        <Button
          type="primary"
          @click="handleCHS"
          class="mr-[0.5rem]"
          data-testid="button_chs"
        >
          生成医保局3502
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style lang="less" scoped>
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
