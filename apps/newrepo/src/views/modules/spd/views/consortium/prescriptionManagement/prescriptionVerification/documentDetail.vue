<script lang="ts" setup>
import type { QueryLineRow } from './api';

import { onMounted, ref } from 'vue';

import { SvgCloseIcon, UploadCloudIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { VxeUI } from '@vben/plugins/vxe-table';
import { cloneDeep } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Button,
  Descriptions,
  DescriptionsItem,
  message,
  Modal,
} from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { savePrescriptionToPurchase } from './api';
import closeModalUI from './modals/closeModal.vue';

const [closeModal, closeModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: closeModalUI,
  draggable: true,
});

const currentTab = defineModel<number>('currentTab', { required: true });
const currentHandleRow = defineModel<any>('currentHandleRow', {
  required: true,
});
const VxeSelect = VxeUI.getComponent('VxeSelect');
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');

// 处方总金额
const totalAmount = ref('0.00');

// 子表
const CHILD_EDITABLE_FIELDS = new Set(['description', 'qtyOrdered']);
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: true,
      },
      pagerConfig: {
        // enabled: false,
      },
      // editConfig: {
      //   // enabled: detailInfo.value?.type === 'edit',
      //   enabled: true,
      //   mode: 'row',
      //   trigger: 'click',
      //   showStatus: false,
      //   showIcon: true,
      //   autoClear: true,
      // },
      cellStyle: ({ column }: { column: any }) => {
        if (
          CHILD_EDITABLE_FIELDS.has(column.field) &&
          detailInfo.value?.type === 'edit'
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
      keepSource: true,
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 200,
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'insurance',
        title: '医保编码',
        minWidth: 120,
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'price',
        title: '价格',
        minWidth: 80,
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: 90,
        align: 'right',
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: 80,
        sortable: true,
      },

      {
        field: 'vendorId',
        title: '供应商',
        sortable: true,
        minWidth: 200,
        editRender: {},
        slots: { default: 'edit_vendorId' },
      },
      {
        field: 'lineAmt',
        title: '小计',
        minWidth: 80,
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
      },
      {
        field: 'usageDescCodeName',
        title: '用法',
        minWidth: 150,
      },
      {
        field: 'medDays',
        title: '用药天数',
        align: 'right',
        minWidth: 150,
      },
    ],
    id: 'child',
    queryUrl: '/prescriptionAction/queryLine.do',
    afterFetchFn: (params) => {
      const rows = params.rows;
      // 计算处方总金额
      const total = rows.reduce(
        (sum: number, cur: QueryLineRow) => sum + (Number(cur.lineAmt) || 0),
        0,
      );
      totalAmount.value = handlePriceToFixedTwo(total);
      // 供应商 如果为空 则默认取vendorList中的第一个值
      rows.forEach((item: QueryLineRow) => {
        if (
          !item.vendorId &&
          Array.isArray(item.vendorList) &&
          item.vendorList.length > 0
        ) {
          item.vendorId = item.vendorList[0]?.vendorId as string;
        }
      });
      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        prescriptionId: currentHandleRow.value.prescriptionId,
        start: undefined,
        limit: 0,
      };
    },
  },
);

onMounted(() => {
  if (currentHandleRow.value.orderId) {
    roleGridApi.query();
  }
});

const totalHandleLoading = ref(false);

// 基础信息
const basicList = [
  { label: '处方号', field: 'presNo' },
  { label: '开方医院', field: 'orgName' },
  { label: '费别', field: 'InsuranceType' },
  { label: '就诊人', field: 'patientName' },
  { label: '就诊卡号', field: 'patientCode' },
  { label: '手机号', field: 'patientPhoneNo' },
  { label: '性别', field: 'sex' },
  { label: '年龄', field: 'age' },
  { label: '处方时间', field: 'presDate' },
  { label: '诊断', field: 'diagnosis' },
];

// 提交
const handleTransfer = async () => {
  Modal.confirm({
    title: '请确定是否发送订单至处方流转平台？',
    okText: '确认',
    okType: 'primary',
    onOk: async () => {
      // 获取当前表格数据
      const rowData: QueryLineRow[] =
        roleGridApi.grid.getTableData().tableData || [];
      // 进行一份深拷贝
      const copyRowData = cloneDeep(rowData);
      console.warn('执行了handleTransfer', rowData);
      // 收集所有未选择供应商的行索引
      const invalidRows: number[] = [];
      const lineList: { prescriptionLineId: string; vendorId: string }[] = [];
      // 遍历每一行数据，检查是否有供应商未选择
      // for (const [i, row] of copyRowData.entries()) {
      // }
      copyRowData.forEach((row: QueryLineRow, i: number) => {
        if (row.vendorId) {
          lineList.push({
            prescriptionLineId: row.prescriptionLineId.toString(),
            vendorId: row.vendorId.toString(),
          });
        } else {
          invalidRows.push(i + 1);
        }
      });
      if (invalidRows.length > 0) {
        message.error(`请选择第${invalidRows.join('、')}行供应商`);
        return;
      }
      const params = {
        prescriptionId: currentHandleRow.value.prescriptionId,
        preStatus: '1',
        lineList,
      };
      console.warn('入参 params', params);
      const res = await savePrescriptionToPurchase(params);
      if (res && res.success) {
        message.success('提交成功');
        currentTab.value = 0;
      } else {
        message.error(res.msg || '提交失败');
      }
    },
  });
};

// 关闭处理函数
const handleCancel = () => {
  // 列表供应商必须全部选择
  const rowData: QueryLineRow[] =
    roleGridApi.grid.getTableData().tableData || [];
  // 进行一份深拷贝
  const copyRowData = cloneDeep(rowData);
  // 收集所有未选择供应商的行索引
  const invalidRows: number[] = [];
  copyRowData.forEach((row: QueryLineRow, i: number) => {
    if (!row.vendorId) {
      invalidRows.push(i + 1);
    }
  });
  if (invalidRows.length > 0) {
    message.error(`请选择第${invalidRows.join('、')}行供应商`);
    return;
  }
  const lineList = copyRowData.map((item: QueryLineRow) => {
    return {
      prescriptionLineId: item.prescriptionLineId.toString(),
      vendorId: item.vendorId.toString(),
    };
  });
  closeModalApi
    .setData({
      prescriptionId: currentHandleRow.value.prescriptionId,
      lineList,
    })
    .open();
};
// 供应商下拉数据源
// const vendorOptions = ref<any[]>([]);
// 格式化供应商选项
const renderVendorOptions = (vendorList: any[]) => {
  // console.log('执行了renderVendorOptions', vendorList);
  return vendorList.map((item) => ({
    ...item,
    label: item.name,
    value: item.vendorId,
  }));
};

// 供应商下拉值改变
const handleVendorChange = (e: any, scope: any) => {
  console.warn('执行了handleVendorChange', e, scope);
};
</script>

<template>
  <Page content-class="p-[0.2rem]" class="h-full">
    <div class="h-full">
      <closeModal />
      <PageSplitLazy
        :distribute="0.25"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <div class="h-full bg-white p-[15px]">
            <Descriptions title="处方明细">
              <DescriptionsItem
                v-for="item in basicList"
                :key="item.field"
                :label="item.label"
                class="ml-[10px] font-bold"
                :content-style="{ marginLeft: '10px' }"
              >
                {{ currentHandleRow[item.field] }}
              </DescriptionsItem>
            </Descriptions>
          </div>
        </template>
        <template #second>
          <div class="h-full bg-white p-[10px]">
            <div
              class="mt-[10px] flex items-center justify-between pl-[10px] pr-[10px] font-bold"
            >
              <div class="flex items-center">
                <div class="text-[16px]">药品明细</div>
                <div class="ml-[40px]">处方总金额： {{ totalAmount }}</div>
              </div>
            </div>

            <RoleGrid class="mt-[10px]">
              <template #edit_vendorId="scope">
                <VxeSelect
                  class="driver_vendorId"
                  v-model="scope.row.vendorId"
                  :disabled="!['0', 0].includes(currentHandleRow.preStatus)"
                  :options="renderVendorOptions(scope.row.vendorList || [])"
                  @change="handleVendorChange($event, scope)"
                  :data-testid="`Select_vendorId_${scope.rowIndex}_documentDetail`"
                />
              </template>
              <template #bottom>
                <div
                  v-if="['0', 0].includes(currentHandleRow.preStatus)"
                  class="flex items-center justify-center gap-[10px] pt-[10px]"
                >
                  <Button
                    type="primary"
                    @click="handleTransfer"
                    :loading="totalHandleLoading"
                    data-testid="button_submit_documentDetail"
                  >
                    <template #icon>
                      <UploadCloudIcon />
                    </template>
                    提交
                  </Button>
                  <Button
                    danger
                    type="primary"
                    @click="handleCancel"
                    :loading="totalHandleLoading"
                    data-testid="button_close_documentDetail"
                  >
                    <template #icon>
                      <SvgCloseIcon />
                    </template>
                    关闭
                  </Button>
                </div>
              </template>
            </RoleGrid>
          </div>
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
