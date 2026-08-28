<script lang="ts" setup>
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// message
import { InputNumber, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

const modalOuterData = ref<{
  handleRefreshTable: () => void;
  lineData: any;
  parentLineData: any;
  tableId: string;
}>();
const orderId = ref(0);
const [ChooseLotModal, chooseLotModalApi] = useVbenModal({
  draggable: true,
  // showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  // footer: false,
  onCancel() {
    chooseLotModalApi.close();
  },
  onConfirm() {
    handleSave();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = chooseLotModalApi.getData<{
        handleRefreshTable: () => void;
        lineData: any;
        parentLineData: any;
        tableId: string;
      }>();
      orderId.value = modalOuterData.value.lineData.orderId;
      setTimeout(() => {
        chcGridApi.query();
        chcGridApi.formApi.setValues({
          ...modalOuterData.value?.lineData,
          productName: `${modalOuterData.value?.lineData.productCode}/${
            modalOuterData.value?.lineData.productName
          }`,
          packageCountCanUser:
            modalOuterData.value?.lineData.qtyOnHand /
            modalOuterData.value?.lineData.replenishPackageQty,
        });
      }, 200);
    }
  },
});
const vbenGridOption = {
  formOptions: deepMerge(formDefaultOptions, {
    showDefaultActions: false,
    showCollapseButton: false,
    commonConfig: {
      labelClass: 'w-[70px]',
    },
  }),
  gridOptions: deepMerge(gridDefaultOptions, {
    stripe: false,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      autoLoad: false,
    },
    radioConfig: {
      trigger: 'row',
      highlight: true,
    },
    align: 'center',
  }),
};
const chcGridOption: SchemaColumnAndOptions = {
  gridColumns: [
    { title: '', type: 'radio', minWidth: 50, align: 'center', visible: false },
    {
      title: '序号',
      width: 50,
      align: 'center',
      formatter(scope: any) {
        return scope.rowIndex + 1;
      },
    },
    {
      field: 'productName',
      title: '药品名称',
      minWidth: '150',
      sortable: false,
    },
    {
      field: 'productSpec',
      title: '规格',
      minWidth: '80',
      sortable: false,
    },
    {
      field: 'modelNo',
      title: '型号',
      minWidth: '80',
      sortable: false,
      visible: false,
    },
    {
      field: 'manufacturer',
      title: '生产厂家',
      minWidth: '150',
      sortable: false,
    },
    {
      field: 'vendorName',
      title: '供应商',
      minWidth: '80',
      sortable: false,
    },
    {
      field: 'uomName',
      title: '单位',
      minWidth: '70',
      sortable: false,
    },
    {
      field: 'currentPricePo',
      title: '商品价',
      minWidth: '70',
      sortable: false,
    },
    {
      field: 'lot',
      title: '批号',
      minWidth: '100',
      sortable: false,
    },
    {
      field: 'guaranteeDate',
      title: '效期',
      minWidth: '90',
      sortable: false,
    },
    {
      field: 'qtyAvailable',
      title: '可用数量',
      minWidth: '90',
      sortable: false,
    },
    {
      field: 'qtyPicked',
      title: '拣货数量',
      minWidth: '120',
      slots: {
        default: 'qtyPickedDefault',
      },
    },
  ],
  autoSelectFirstRow: true,
  gridEvents: {
    radioChange() {},
  },
  queryUrl: () => `/storageAction/queryStorageLot.do`,
  getTableId: () => modalOuterData.value?.tableId,
  beforeFetchFn: (params) => {
    // console.log('modalOuterData.value:', modalOuterData.value);
    return {
      ...params,
      storageStatus: 'S',
      haveAvailableQty: 'Y',
      productId: modalOuterData.value?.lineData.productId,
      warehouseId: modalOuterData.value?.parentLineData.warehouseId,
      isScatter: 'Y',
    };
  },
  afterFetchFn: (params) => {
    originRows.value = params.rows.map((item: any) => {
      return deepClone(item);
    });
    return {
      ...params,
      records: params.rows,
    };
  },
};
let [ChcGrid, chcGridApi] = useSpdGrid(vbenGridOption, chcGridOption);
const originRows = ref<any[]>([]);
const handleSave = async () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  const jobRrecord = modalOuterData.value?.lineData;
  const pickListJobId = jobRrecord.pickListJobId;

  const params: { [key: string]: any } = {};
  if (!record.qtyPicked) {
    message.error('错误:选择行缺少数量！ ');
    return;
  }
  if (record.qtyPicked > record.qtyAvailable) {
    message.error('错误选择行的拣货数量大于可用数量！');
    return;
  }
  if (
    Number.parseFloat(record.qtyPicked) -
      Number.parseFloat(jobRrecord.qtyLeft) >
    0
  ) {
    message.error('拣货数量不等于待拣数量！');
    return;
  }

  params.pickListJobId = pickListJobId;
  params.lot = record.lot;
  params.qtyPicked = record.qtyPicked;
  params.guaranteeDate = record.guaranteeDate;
  Modal.confirm({
    title: '提示',
    content: '确认选择此批号吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('pickListAction/pickListJobChooseLot.do', params)
        .then(() => {
          modalOuterData.value?.handleRefreshTable();
          chooseLotModalApi.close();
        });
    },
    onCancel() {},
  });
};
</script>
<template>
  <ChooseLotModal
    class="formatBtnIconPosition h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="选择批号"
    title-tooltip="选择批号"
  >
    <div class="h-full">
      <ChcGrid>
        <template #qtyPickedDefault="scope">
          <InputNumber
            class="w-full"
            :min="0"
            v-model:value="scope.row.qtyPicked"
            :data-testid="`InputNumber_qtyPicked_${scope.rowIndex}_chooseLotModal`"
          />
        </template>
        <!-- <template #bottom>
          <div class="flex items-center justify-center pt-[10px]">
            <div class="flex gap-[10px]">
              <Button type="primary" @click="handleSave">
                确认
                <template #icon>
                  <SvgSquareTickIcon />
                </template>
              </Button>
              <Button type="primary" danger @click="handleCancel">
                取消
                <template #icon>
                  <SvgCloseIcon />
                </template>
              </Button>
            </div>
          </div>
        </template> -->
      </ChcGrid>
    </div>
  </ChooseLotModal>
</template>
