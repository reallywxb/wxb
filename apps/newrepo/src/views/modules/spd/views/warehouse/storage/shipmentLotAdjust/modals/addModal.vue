<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { h, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const props = defineProps<{
  afterSubmit: () => void;
}>();

const modalData = ref<Record<string, any>>({});

const FormOptions: VbenFormProps = {
  compact: true,
  commonConfig: {
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
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
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productName', // 药品名称
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
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
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
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
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '规格',
      disabled: true,
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: ' ',
    //   },
    //   fieldName: 'modelNo',
    //   formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   label: '型号',
    //   disabled: true,
    // },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'manufacturer',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px] input-nostyle',
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
      fieldName: 'locatorName',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '货位',
      disabled: true,
    },
    {
      // component: 'DatePicker',
      // componentProps: () => {
      //   return {
      //     placeholder: '',
      //     format: 'YYYY-MM-DD',
      //     valueFormat: 'YYYY-MM-DD',
      //   };
      // },
      fieldName: 'guaranteeDate',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '效期',
      disabled: true,
      component: h('div'),
      renderComponentContent: (values, formApi) => {
        console.warn('renderComponentContent values', values);
        console.warn('renderComponentContent formApi', formApi);
        return {
          default: h(
            'div',
            {
              class: 'text-[#32363940] p-[3px_7px] cursor-pointer',
            },
            {
              default: () => values.guaranteeDate,
            },
          ),
        };
      },
    },
    {
      // component: 'DatePicker',
      // componentProps: () => {
      //   return {
      //     placeholder: '',
      //     format: 'YYYY-MM-DD',
      //     valueFormat: 'YYYY-MM-DD',
      //   };
      // },
      fieldName: 'productionDate',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '生产日期',
      disabled: true,
      component: h('div'),
      renderComponentContent: (values, formApi) => {
        console.warn('renderComponentContent values', values);
        console.warn('renderComponentContent formApi', formApi);
        return {
          default: h(
            'div',
            {
              class: 'text-[#32363940] p-[3px_7px] cursor-pointer',
            },
            {
              default: () => values.productionDate,
            },
          ),
        };
      },
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productArea',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
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
      fieldName: 'vendorName',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
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
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '价格',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'qtyAvailable',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '可调整数量',
      disabled: true,
      // !data.field.qtyAvailable || data.field.qtyAvailable == '' || data.field.qtyAvailable == 0
      // rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'qty',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '调整数量',
      // !data.field.qty || data.field.qty == '' || data.field.qty == 0
      // rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'lot',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '批号',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'toLot',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '新批号',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'storageStatusName',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '存货状态',
      disabled: true,
    },
    {
      component: 'ChcSelect',

      fieldName: 'toStorageStatus',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '新存货状态',
      // defaultValue: '',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000346',
          placeholder: '请选择',
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          // defaultValue: '',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      // rules: 'required',
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'description',
      formItemClass: 'col-span-2 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '备注',
    },
  ],
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
    if (!formValues.qty || formValues.qty === '' || formValues.qty === 0) {
      message.error('调整数量不可为空！');
      return;
    }
    if (
      !formValues.qtyAvailable ||
      formValues.qtyAvailable === '' ||
      formValues.qtyAvailable === 0
    ) {
      message.error('可调整数量异常');
      return;
    }
    if (Number(formValues.qty) > Number(formValues.qtyAvailable)) {
      message.error('调整数量大于可调整数量');
      return;
    }
    if (!formValues.toStorageStatus || formValues.toStorageStatus === '') {
      message.error('请选择新存货状态');
      return;
    }
    const params = {
      warehouseId: modalData.value.row.warehouseId,
      productId: modalData.value.row.productId,
      locatorId: modalData.value.row.locatorId,
      qty: formValues.qty,
      fromStorageStatus: modalData.value.row.storageStatus,
      toStorageStatus: formValues.toStorageStatus,
      lot: modalData.value.row.lot,
      toLot: formValues.toLot,
      description: formValues.description,
    };
    Modal.confirm({
      content: '确定要提交吗？',
      onOk: async () => {
        try {
          requestFormClient
            .post(`/inoutAction/lotAdjust.do`, params)
            .then((res) => {
              if (res && res.success) {
                message.success('调整成功!');
                modalApi.close();
                props.afterSubmit();
              }
            })
            .catch((error) => {
              console.error('失败', error);
              message.error('失败');
            });
        } catch (error) {
          console.warn('err', error);
        }
      },
      title: '确定',
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
      setTimeout(() => {
        FormApi.setValues({
          productCode: modalData.value.row.productCode,
          productName: modalData.value.row.productName,
          productSpec: modalData.value.row.productSpec,
          modelNo: modalData.value.row.modelNo,
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
  <ModalFirst confirm-text="确定" title="批号调整" class="w-[800px]">
    <EditForm />
  </ModalFirst>
</template>

<style scoped lang="less">
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
//
::v-deep(.input-nostyle .ant-input-affix-wrapper) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
}

::v-deep(.input-nostyle .ant-input-affix-wrapper:focus) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  outline: none !important;
  box-shadow: none !important;
}
</style>
