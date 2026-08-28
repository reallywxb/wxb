<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Modal as AntModal, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const props = defineProps<{
  afterSubmit: () => void;
}>();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
const docType = urlParams?.docType || '';

const modalTitle = ref('登记包装');
const modalData = ref<Record<string, any>>({});

const [ChcGridUI, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // radioChange: ({ row }: { row: any }) => {
      //   console.warn('父表格 radioChange', row);
      //   // 请求子表  多个子表请求
      //   checkedRow.value = {};
      //   checkedRow.value = row;
      // },
    },
  },
  {
    gridColumns: [
      {
        type: 'checkbox',
        align: 'center',
        width: 50,
        title: '多选',
      },
      {
        field: 'packageNo',
        title: '包装号',
        width: '180',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        width: '130',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '110',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        width: '70',
        align: 'right',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            disabled: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productCode',
        label: '药品编码',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            disabled: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productSpec',
        label: '规格',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            disabled: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'manufacturer',
        label: '厂家',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            disabled: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'qtyOnHand',
        label: '可用库存',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            disabled: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'uomName',
        label: '单位',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            disabled: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'inventoryReason',
        label: '报损原因',
        // defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/inventoryAction/inventoryReason.do',
            placeholder: '请选择',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            // defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
    ],
    queryUrl: '/packageAction/query.do',
    id: 'outInput_pkg',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      params.warehouseId = modalData.value.row.warehouseId;
      params.productId = modalData.value.row.productId;
      params.lot = modalData.value.row.lot;
      params.packageStatus = 'S';
      params.locatorUseType = 'S';
      params.isPicking = 'N';
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
    const checkedRows = ChcGridApi.grid.getCheckboxRecords();
    const unProxyRows: any[] = toRaw(checkedRows);
    console.warn('onConfirm checkedRows', checkedRows);
    console.warn('onConfirm unProxyRows', unProxyRows);
    if (isEmpty(unProxyRows)) {
      message.warning('请选择包装！');
      return;
    }
    const formValues = await ChcGridApi.formApi.getValues();
    const inventoryReason = formValues.inventoryReason;
    if (!inventoryReason || inventoryReason === '') {
      message.warning('请选择报损原因！');
      return;
    }
    const paramLine: any[] = [];
    let totalQtyProcess = 0;
    unProxyRows.forEach((item: any) => {
      paramLine.push(item.packageNo);
      totalQtyProcess = totalQtyProcess + Number(item.qty);
    });

    if (paramLine.length === 0) {
      message.warning('请输入报损申请数量！');
      return;
    }
    if (totalQtyProcess > modalData.value.row.qtyAvailable) {
      message.warning(
        `总报损申请数量大于商品可用库存，总报损申请数量=${
          totalQtyProcess
        }，商品可用库存=${modalData.value.row.qtyAvailable}`,
      );
      return;
    }
    AntModal.confirm({
      title: '提示',
      content: `确认报损申请${paramLine.length}包共${totalQtyProcess}${
        modalData.value.row.uomName
      }${modalData.value.row.productName}吗？`,
      onOk: async () => {
        try {
          const params: Record<string, any> = {
            warehouseId: modalData.value.row.warehouseId,
            productId: modalData.value.row.productId,
            inventoryReason,
            locatorId: modalData.value.row.locatorId,
            storageStatus: modalData.value.row.storageStatus,
            packageNo: JSON.stringify(paramLine),
            docType,
          };

          await requestFormClient.post(
            `/inventoryAction/createInventoryByPackage.do`,
            params,
          );
          message.success('报损申请成功！');
          modalApi.close();
          props.afterSubmit();
        } catch (error) {
          console.error(error);
        }
      },
    });
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const mData = modalApi.getData<Record<string, any>>();
      modalData.value = {};
      modalData.value = mData;
      console.warn('modalData', modalData);
      modalTitle.value = mData.modalTitle || modalTitle.value;
      console.warn('onOpenChange modalData', modalData.value);

      setTimeout(() => {
        ChcGridApi.formApi.setValues({
          productName: modalData.value.row.productName,
          productCode: modalData.value.row.productCode,
          productSpec: modalData.value.row.productSpec,
          manufacturer: modalData.value.row.manufacturer,
          qtyOnHand: modalData.value.row.qtyOnHand,
          uomName: modalData.value.row.uomName,
          // inventoryReason: modalData.value.row.inventoryReason,
        });
        ChcGridApi.query();
      }, 200);
    }
  },
});
onMounted(() => {});
</script>
<template>
  <Modal class="h-[800px] w-[80%]" confirm-text="确定" :title="modalTitle">
    <div class="h-full">
      <ChcGridUI />
    </div>
  </Modal>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>
