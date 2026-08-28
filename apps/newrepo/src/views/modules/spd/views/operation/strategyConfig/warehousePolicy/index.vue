<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  SvgCopyIcon,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import cuModalUi from './modals/cuModal.vue';

const userStore = useUserStore();
const route = useRoute();
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.query();
  isFirstLoaded.value = true;
});
const isFirstLoaded = ref(false); // 是否已初次加载完

const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数

const isSaas = computed(() => {
  return userStore?.userInfo?.isSaas;
});
console.warn('urlParams', urlParams);
console.warn('userStore', userStore);

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  if (urlParams?.autoLoad === 'Y' || route.query?.autoLoad === 'Y') {
    searchController.sign();
  }
});
const [CuModal, cuModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: cuModalUi,
  draggable: true,
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      // handleSubmit: (values) => {
      //   console.warn('查询 values', values);
      //   ChcGridApi.query(values);
      // },
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
      cellStyle: ({ row }: { row: any }) => {
        if (row.isActive === 'N') {
          return { color: 'gray' };
        }
        return {};
      },
    }),
  },
  {
    id: 'warehousePolicy',
    // api地址
    queryUrl: '/warehouseAction/queryWarehousePolicy.do',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        align: 'center',
        width: 50,
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        align: 'center',
        width: 50,
      },
      {
        field: 'name',
        title: '名称',
        width: '100',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        width: '200',
      },
      {
        field: 'invoiceMethodName',
        title: '开票方式',
        width: '100',
      },
      {
        field: 'settlementModeName',
        title: '发票结算模式',
        width: '120',
      },
      {
        field: 'paymentPlanModeName',
        title: '付款结算模式',
        width: '120',
      },
      {
        field: 'poPlanApproveWayName',
        title: '采购计划审核方式',
        width: 200,
        sortable: true,
      },
      {
        field: 'isNoProtocolPO',
        title: '允许无协议采购',
        width: '130',

        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isProductCertPOControl',
        title: '品种证书采购管控',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isProductCertAsnControl',
        title: '品种证书验收管控',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'maxPricePODiff',
        title: '允许最大采购价差',
        width: '130',
        align: 'right',
      },
      {
        field: 'allowUpdateWOOrderPlan',
        title: '允许修改越库采购计划',
        width: 150,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isBPartnerProductControl',
        title: '启用供应商管控类型控制',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'allowPRUpdateVendor',
        title: '允许采退更换供应商',
        width: '140',

        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isUnitPackPO',
        title: '启用定数采购',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isLPackageQtyPO',
        title: '按大包装采购',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isSplitByProductControlLevel',
        title: '结算按管控类型分单',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isSplitByProductCategory',
        title: '自动计划按商品类别分单',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isSplitNarcoticDrug',
        title: '自动计划按是否麻精分单',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isInvoiceByProductCategory',
        title: '按商品类别分票',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isInvoiceByApplyBPartner',
        title: '按直配单位分票',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isInvoiceByOnLine',
        title: '按是否线上分票',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isSplitByOnLine',
        title: '按是否线上分单',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isInvoiceByInnovate',
        title: '按是否创新分票',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isSplitByInnovate',
        title: '按是否创新分单',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isOrderGenOneDelivery',
        title: '订单单次配送',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'basePackageTypeName',
        title: '单件包装方式',
        width: '120',
      },
      {
        field: 'isPOASNApprove',
        title: '采购到货是否审核',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isNoPickOrderNeedWorkflow',
        title: '直接出库订单需工作流',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'poReceiveWayName',
        title: '采购收货方式',
        width: '180',
      },
      {
        field: 'isAutoPutaway',
        title: '采购验收后自动上架',
        width: '150',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isReceiveAfterInvoice',
        title: '票货同行发票审核后入库',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isNeedInspecte',
        title: '是否提示开箱验视',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isNeedSample',
        title: '需抽样验收',
        width: '110',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isClosePOOrderRejectASN',
        title: '已关闭订单自动拒收',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isPORejectInvoice',
        title: '拒收时自动作废发票',
        width: 200,
        visible: false,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'allowReceiptWithoutInvoice',
        title: '允许未到票收货',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isUseMonthlyWO',
        title: '是否启用月度请领计划',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isAutoCommitAutoMVOrder',
        title: '自动提交自动请领申请',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isAutoCommitCrossDocking',
        title: '请领转采购自动提交',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isSOInOut',
        title: '科领自动出库',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isSOShipment',
        title: '启用科领送货流程',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isBorrowMultiTimes',
        title: '允许多次借出',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'srReceiveWayName',
        title: '科退收货方式',
        width: '180',
      },
      {
        field: 'mvReceiveWayName',
        title: '调拨收货方式',
        width: '180',
      },
      {
        field: 'isMVAutoPutaway',
        title: '调拨验收后自动上架',
        width: '150',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'allowRepeatPick',
        title: '允许出库申请多次发货',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isMergePickList',
        title: '是否合并拣货单',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'allowPickChangeLot',
        title: '允许拣货更换批号',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'allowPickRemnant',
        title: '允许拣货数量为小数',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'allocationRuleName',
        title: '出库分配规则',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'packagePickingMehtodName',
        title: '包装出库指示方式',
        width: '130',
      },
      {
        field: 'allowSplitPick',
        title: '允许整件拆零拣货',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isKeepAsnNoWithPickNo',
        title: '保持拣货号与配送单号一致',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isCreateLack',
        title: '是否生成欠品单',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isReturnInOutApprove',
        title: '退库单是否审核',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'soMaxReturnDays',
        title: '销退允许天数',
        width: '120',
      },
      {
        field: 'isMVPassbyParent',
        title: '平调从上级库走账',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isMOTrans',
        title: '启用送货交接流程',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isWarehouseProductControl',
        title: '启用仓库管控类型控制',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isAutoAddNewProduct',
        title: '新品自动增加到仓库目录',
        width: 200,
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isUniqueProduct',
        title: '一级库品种唯一',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isMergeCreateInOut',
        title: '合并生成入库单',
        width: '120',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isBatchPackageReceive',
        title: '允许包装批量收货',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'emptyInventoryDays',
        title: '零库存动盘天数',
        width: '120',
        align: 'right',
      },
      {
        field: 'latestReceivedDays',
        title: '报溢最近入库天数',
        width: '130',
        align: 'right',
      },
      {
        field: 'packageTypeName',
        title: '包装类型',
        width: '100',
        align: 'right',
      },
      {
        field: 'poValidDays',
        title: '采购订单有效天数',
        width: '130',
        align: 'right',
      },
      {
        field: 'isInventoryByPlan',
        title: '盘点生成损溢单',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isAutoCommitInventory',
        title: '自动提交盈亏申请',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isAutoConfirmInventoryPlan',
        title: '自动确认盘点结果',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isOutStoreAfterInvoice',
        title: '采退发票审核后出库',
        width: '140',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isAutoSplitMixed',
        title: '拼箱自动拆包',
        width: '130',
        formatter: ({ cellValue }: { cellValue: any }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'created',
        title: '创建时间',
        width: '130',
      },
    ],
    // 表单配置

    formSchema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        componentProps: () => {
          return {
            placeholder: '',
            maxlength: 50,
          };
        },
      },
    ],
    gridEvents: {
      radioChange: (d: any) => {
        console.warn('radioChange', d);
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      params.isSaas = isSaas.value;
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

const handleAdd = () => {
  cuModalApi
    .setData({
      modalTitle: '添加',
      modalType: 'ADD',
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
const handleEdit = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录！');
  }
  cuModalApi
    .setData({
      modalTitle: '修改',
      modalType: 'EDIT',
      row: unProxyRow,
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
const handleCopy = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('row', row);
  const unProxyRow: any = cloneDeep(toRaw(row));
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录！');
  }
  cuModalApi
    .setData({
      modalTitle: '复制',
      modalType: 'COPY',
      row: unProxyRow,
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
const handleDel = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    onOk: async () => {
      try {
        await requestFormClient.post('/warehouseAction/delWarehousePolicy.do', {
          warehousePolicyId: unProxyRow.warehousePolicyId,
        });
        message.success('删除成功');
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <CuModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add"
        >
          新建
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
          @click="handleCopy"
          class="mr-[0.5rem]"
          data-testid="button_copy"
        >
          复制
          <template #icon>
            <SvgCopyIcon />
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
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导出
          <template #icon>
            <ExportActionIcon />
          </template>
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
</style>
