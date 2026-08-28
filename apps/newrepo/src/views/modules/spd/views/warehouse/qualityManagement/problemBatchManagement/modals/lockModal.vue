<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { Button, message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { dataMove } from '../api';

// application/vnd.ms-excel;base64,

const emit = defineEmits(['close']);

const orderData = ref<any>({});

const [VBenModal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  // destroyOnClose: true,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    orderData.value = modalApi.getData<any>() || {};
    baseFormApi.setValues({
      productName: orderData.value.productName,
      productCode: orderData.value.productCode,
      productSpec: orderData.value.productSpec,
      manufacturer: orderData.value.manufacturer,
      lot: orderData.value.lot,
      guaranteeDate: orderData.value.guaranteeDate,
      vendorName: orderData.value.vendorName,
      qtyOnHand: orderData.value.qtyOnHand,
      pricePo: orderData.value.pricePo,
      qtyAvailable: orderData.value.qtyAvailable,
      qty: orderData.value.qty,
      lockReason: orderData.value.lockReason,
      locatorName: orderData.value.locatorName,
      description: orderData.value.description,
    });
  },
});

const getSchema = () => {
  const schame = [
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品名称',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productCode',
      label: '药品编码',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productSpec',
      label: '规格',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'manufacturer',
      label: '厂家',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'lot',
      label: '批号',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'guaranteeDate',
      label: '效期',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'vendorName',
      label: '供应商',
      formItemClass: 'col-span-2 input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'qtyOnHand',
      label: '库存数量',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'pricePo',
      label: '价格',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'qtyAvailable',
      label: '可移动数量',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'qty',
      label: '移库数量',
      formItemClass: 'pb-1',
      componentProps: () => {
        return {
          placeholder: '请输入移库数量',
        };
      },
    },
    {
      component: 'ChcSelect',
      formItemClass: 'pb-1',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,

          dictUrl: '/baseHandleAction/refList.do?id=1000606',
          // showSearch: true,
          placeholder: '请选择锁定原因',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      dependencies: {
        triggerFields: ['departmentId', 'regionId'],
        show: () => {
          return orderData.value.storageStatus !== 'D';
        },
      },
      fieldName: 'lockReason',
      label: '锁定原因',
    },

    {
      component: 'Input',
      fieldName: 'locatorName',
      label: '当前货位',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
      componentProps: () => {
        return {
          placeholder: '请输入描述',
        };
      },
      formItemClass: 'col-span-2 pb-1',
    },
  ];

  return schame;
};

const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: getSchema(),
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    if (!res.qty) {
      message.warn('移库数量不可为空！');
      return;
    }
    if (!orderData.value.qtyAvailable) {
      message.warn('可移动数量异常');
      return;
    }
    if (Number(res.qty) > Number(orderData.value.qtyAvailable)) {
      message.warn('移库数量大于可移动数量');
      return;
    }
    const param: any = {};
    param.warehouseId = orderData.value.warehouseId;
    param.productId = orderData.value.productId;
    param.attributeSetInstanceId = orderData.value.attributeSetInstanceId;
    param.locatorId = orderData.value.locatorId;
    param.storageStatus = orderData.value.storageStatus;
    param.locatorIdTo = orderData.value.locatorId;
    param.storageStatusTo = orderData.value.storageStatus === 'D' ? 'S' : 'D';
    param.qty = res.qty;
    if (orderData.value.storageStatus === 'D') {
      // 只有锁定才记录原因
      param.lockReason = res.lockReason;
    }
    param.description = res.description;
    Modal.confirm({
      title: '提醒',
      content: '确认提交？',
      onOk: () => {
        dataMove(param).then((res) => {
          if (res && res.success) {
            message.success('提交成功');
            emit('close');
            modalApi.close();
          } else {
            message.error(res.msg || '失败');
          }
        });
      },
    });
  });
}
</script>
<template>
  <VBenModal
    class="w-[800px]"
    :title="orderData.storageStatus === 'D' ? '解锁' : '锁定'"
  >
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_lockModal"
      >
        提交
      </Button>
    </template>
  </VBenModal>
</template>

<style lang="less" scoped>
::v-deep(.input-nostyle .ant-input) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
}

::v-deep(.input-nostyle .ant-input:focus) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  outline: none !important;
  box-shadow: none !important;
}
</style>
