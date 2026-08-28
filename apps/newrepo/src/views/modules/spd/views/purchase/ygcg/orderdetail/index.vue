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

const [GetMedcineModal, getMedcineModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: GetMedcineModalComp,
  draggable: true,
});
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
    queryUrl: '/ygcgProductAction/queryOrderLineView.do',
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
        field: 'dateOrdered',
        title: '采购订单时间',
        width: '160',
      },
      {
        field: 'documentNo',
        title: 'SPD采购订单单号',
        width: '150',
      },
      {
        field: 'submitDate',
        title: '平台采购时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'ygcgOrderId',
        title: '平台订单号',
        width: '150',
      },
      {
        field: 'ygcgOrderLineId',
        title: '平台订单行号',
        width: '150',
      },
      {
        field: 'asnNo',
        title: 'SPD配送单号',
        width: '150',
      },
      {
        field: 'distributedNo',
        title: '平台配送单号',
        width: '150',
      },
      {
        field: 'warehouseName',
        title: '采购仓库',
        width: '130',
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '150',
      },
      {
        field: 'provinceId',
        title: '省标代码',
        width: '150',
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '150',
      },
      {
        field: 'uomName',
        title: '单位',
        width: '75',
      },
      {
        field: 'ysStatus',
        title: '验收状态',
        width: '80',
      },
      {
        field: 'qtyOrdered',
        title: '采购数量',
        width: '120',
      },
      {
        field: 'qtyReceived',
        title: '验收数量',
        width: '120',
      },
      {
        field: 'pickProgress',
        title: '匹配进度', // 验收数量/省网配送数量
        width: '100',
      },
      {
        field: 'lot',
        title: 'SPD批号',
        width: '120',
      },
      {
        field: 'platformLot',
        title: '平台批号',
        width: '120',
      },
      {
        field: 'pricePo',
        title: '价格',
        width: '90',
      },
      {
        field: 'lineAmt',
        title: '采购价格',
        width: '90',
      },
      {
        field: 'productGroup',
        title: '药品组',
        width: '100',
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        width: '150',
      },
      {
        field: 'platformTaxInvoiceNo',
        title: '平台发票号',
        width: '150',
      },
      {
        field: 'distributeTime',
        title: '平台配送时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'receiverTime',
        title: 'SPD验收时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '100',
      },
      {
        field: 'platformReceiveStatus',
        title: '平台验收状态',
        width: '100',
        formatter: ({ row }: any) => {
          return row.platformReceiveStatus === 'Y'
            ? '已完成'
            : row.platformReceiveStatus === 'E'
              ? '错误'
              : '未完成';
        },
      },
      {
        field: 'platformReceiverTime',
        title: '平台验收时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'receiverMsg',
        title: '描述',
        width: '150',
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
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { label: '已完成', value: 'Y' },
            { label: '未完成', value: 'N' },
            { label: '错误', value: 'E' },
          ],
          placeholder: '请选择',
        },
        fieldName: 'platformReceiveStatus',
        label: '平台验收状态',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { label: '全部验收', value: 'A' },
            { label: '部分验收', value: 'B' },
            { label: '未验收', value: 'C' },
          ],
          placeholder: '请选择',
        },
        fieldName: 'receiveStatus',
        label: '院内验收状态',
      },
      {
        component: 'ChcSelect',
        fieldName: 'productGroup',
        label: '商品组',
        componentProps: {
          dictUrl: '/baseHandleAction/refList.do?id=1000244',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: `请选择商品组`,
          mode: 'multiple',
          maxTagCount: 1,
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        },
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            { label: '匹配完成', value: 'Y' },
            { label: '未匹配完成', value: 'N' },
          ],
          placeholder: '请选择',
        },
        fieldName: 'pickProgress',
        label: '匹配进度',
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {
      page,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      const productGroup = Array.isArray(params.productGroup)
        ? params.productGroup.join(',')
        : params.productGroup;

      return {
        ...params,
        productGroup: productGroup || undefined,
      };
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
const handleRecive = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn(' rows:', rows);
  console.warn(' rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ygcgOrderlineIds = rawRows
    .map((row: any) => row.ygcgOrderLineId)
    .join(',');
  const params = {
    ygcgOrderlineId: ygcgOrderlineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认收货回传吗?`,
    onOk: async () => {
      try {
        console.warn('params:', params);
        await requestFormClient
          .post('/ygcgProductAction/returnDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '收货回传成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
          });
      } catch (error) {
        console.error('收货回传失败', error);
      }
    },
  });
};
const handleMatch = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleChildMatch rows:', rows);
  console.warn('handleChildMatch rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ygcgOrderlineIds = rawRows
    .map((row: any) => row.ygcgOrderLineId)
    .join(',');
  const params = {
    ygcgOrderlineId: ygcgOrderlineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认匹配吗?`,
    onOk: async () => {
      try {
        console.warn('handleChildMatch params:', params);
        await requestFormClient
          .post('/ygcgProductAction/pickDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '匹配成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
          });
      } catch (error) {
        console.error('匹配失败', error);
      }
    },
  });
};
const handleOnlineRate = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleChildOnlineRate rows:', rows);
  console.warn('handleChildOnlineRate rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ygcgOrderLineIds = rawRows
    .map((row: any) => row.ygcgOrderLineId)
    .join(',');
  const params = {
    ygcgOrderlineId: ygcgOrderLineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认生成网采率吗?`,
    onOk: async () => {
      try {
        console.warn('handleChildOnlineRate params:', params);
        await requestFormClient
          .post('/ygcgProductAction/createRate.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
          });
      } catch (error) {
        console.error('生成网采率失败', error);
      }
    },
  });
};
const handleCHS = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleChildCHS rows:', rows);
  console.warn('handleChildCHS rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ygcgOrderLineIds = rawRows
    .map((row: any) => row.ygcgOrderLineId)
    .join(',');
  const params = {
    ygcgOrderlineId: ygcgOrderLineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认生成医保局3502吗?`,
    onOk: async () => {
      try {
        console.warn('handleChildCHS params:', params);
        await requestFormClient
          .post('/ygcgProductAction/create.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
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
          data-testid="button_child_match"
        >
          阳光收货匹配
        </Button>
        <Button
          type="primary"
          @click="handleRecive"
          class="mr-[0.5rem]"
          data-testid="button_child_recive"
        >
          阳光收货回传
        </Button>
        <Button
          type="primary"
          @click="handleOnlineRate"
          class="mr-[0.5rem]"
          data-testid="button_child_online_rate"
        >
          生成网采率7002
        </Button>
        <Button
          type="primary"
          @click="handleCHS"
          class="mr-[0.5rem]"
          data-testid="button_child_chs"
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
