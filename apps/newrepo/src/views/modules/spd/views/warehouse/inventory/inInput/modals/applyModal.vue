<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { InputNumber, message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const props = defineProps<{
  afterSubmit: () => void;
}>();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
let docType = urlParams?.docType || '';
console.warn('urlParams docType', docType === 'I ');
if (docType === 'I ') {
  docType = 'I+';
}
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
const FormOptions: VbenFormProps = {
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productName', // 药品名称
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品名称',

      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productCode',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品编码',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productSpec',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '规格',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'manufacturer',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '厂家',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'qtyAvailable',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '可用库存',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'uomName',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '单位',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'lot',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '批号',
      disabled: true,
    },
    {
      component: 'DatePicker',
      componentProps: () => {
        return {
          placeholder: '',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
      fieldName: 'guaranteeDate',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '效期',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'vendorName',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '供应商',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'pricePo',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '采购价',
      disabled: true,
    },
    {
      component: 'DatePicker',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
      fieldName: 'productionDate',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '生产日期',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productArea',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '产地',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'locatorName',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '货位',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'storageStatusName',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '存货状态',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'qty',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '报溢数量',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      fieldName: 'inventoryReason',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '报溢原因',
      // defaultValue: '',
      componentProps: () => {
        return {
          dictUrl: '/inventoryAction/inventoryReason.do',
          placeholder: '请选择',
          paginate: false,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          // defaultValue: '',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'description',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '备注',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-12',
};
const selectParams = ref({});

const [EditForm, FormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...FormOptions,
});

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await FormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await FormApi.getValues();
    console.warn('onConfirmformValues', formValues);
    let hasError = false;
    if (!formValues.qty || formValues.qty === '' || formValues.qty <= 0) {
      message.error('报溢申请数量不能小于0！');
      return;
    }
    if (!formValues.inventoryReason || formValues.inventoryReason === '') {
      message.error('请选择报溢原因！');
      hasError = true;
      return;
    }
    if (hasError) return;

    const params = {
      inventoryReason: formValues.inventoryReason,
      warehouseId: modalData.value.row.warehouseId,
      productId: modalData.value.row.productId,
      locatorId: modalData.value.row.locatorId,
      storageStatus: modalData.value.row.storageStatus,
      lot: modalData.value.row.lot,
      guaranteeDate: modalData.value.row.guaranteeDate,
      productionDate: modalData.value.row.productionDate,
      productArea: modalData.value.row.productArea,
      docType,
      price: modalData.value.row.pricePo,
      vendorId: modalData.value.row.vendorId,
      qty: formValues.qty,
      description: formValues.description,
    };
    Modal.confirm({
      title: '提示',
      content: '确认报溢申请吗？',
      onOk: async () => {
        try {
          requestFormClient
            .post(`/inventoryAction/createInventoryByLot.do`, params)
            .then((res) => {
              if (res && res.success) {
                message.success('报溢申请成功！');
                modalApi.close();
                props.afterSubmit();
              }
            })
            .catch((error) => {
              console.error('失败', error);
            });
        } catch (error) {
          console.warn('err', error);
        }
      },
    });
  },
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      selectParams.value = {};
      modalTitle.value = modalData.value.modalTitle;
      setTimeout(() => {
        FormApi.setValues({
          productCode: modalData.value.row.productCode,
          productName: modalData.value.row.productName,
          productSpec: modalData.value.row.productSpec,
          manufacturer: modalData.value.row.manufacturer,
          uomName: modalData.value.row.uomName,
          qtyAvailable: modalData.value.row.qtyAvailable,
          lot: modalData.value.row.lot,
          guaranteeDate: modalData.value.row.guaranteeDate,
          productionDate: modalData.value.row.productionDate,
          productArea: modalData.value.row.productArea,
          locatorName: modalData.value.row.locatorName,
          storageStatusName: modalData.value.row.storageStatusName,
          vendorName: modalData.value.row.vendorName,
          pricePo: modalData.value.row.pricePo,
          qty: 0,
        });
      }, 100);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst confirm-text="确定" :title="modalTitle">
    <EditForm>
      <template #xianshishunxu="slotProps">
        <InputNumber
          v-bind="slotProps"
          :keyboard="true"
          :min="1"
          :default-value="1"
          :step="1"
          :precision="0"
          data-testid="InputNumber_xianshishunxu_applyModal"
        />
      </template>
    </EditForm>
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>
