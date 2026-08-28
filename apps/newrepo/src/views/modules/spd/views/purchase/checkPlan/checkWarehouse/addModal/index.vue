<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { h, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { InputNumber, message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { changeLot } from '../api';

const props = defineProps<{
  afterSubmit: () => void;
}>();

const data = ref();
const title = ref('');
// 是否展示表单
const showForm = ref(false);
const showFormLast = ref(false);

const actualQuantity = ref();
const storageQty = ref();

const editFormOptions: VbenFormProps = {
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  handleValuesChange: (e) => {
    actualQuantity.value = e.actualQuantity || 0;
    storageQty.value = e.storageQty || 0;
    editFormApi.setValues({
      varianceQuantity: actualQuantity.value - storageQty.value,
    });
  },
  schema: [
    {
      component: h(
        'div',
        {
          style: {
            fontWeight: 'bold',
          },
        },
        '基本信息',
      ),
      fieldName: '_divider',
      formItemClass: 'col-span-12',
      hideLabel: true,
    },
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
      rules: 'required',
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
    // TODO:medicine cancel 型号
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: ' ',
    //   },
    //   fieldName: 'modelNo',
    //   formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
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
      fieldName: 'qtyArrived',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '到货数量',
      disabled: true,
    },
    {
      component: 'Divider',
      fieldName: '_divider',
      formItemClass: 'col-span-12 -mt-5 -mb-5',
      hideLabel: true,
    },
    {
      component: h(
        'div',
        {
          style: {
            fontWeight: 'bold',
          },
        },
        '修改信息',
      ),
      fieldName: '_divider',
      formItemClass: 'col-span-12',
      hideLabel: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'lot', // 库区
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '原批号',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'newLot',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '新批号',
      disabled: showFormLast,
    },
    {
      component: 'DatePicker',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
      fieldName: 'guaranteeDate',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '原效期',
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
      fieldName: 'newGuaranteeDate',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '新效期',
      disabled: showFormLast,
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
      label: '原生产日期',
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
      fieldName: 'newProductionDate',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '新生产日期',
      disabled: showFormLast,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'serNo',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '原序列号',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'newSerNo',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '新序列号',
      disabled: showFormLast,
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
      label: '原产地',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'newProductArea',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '新产地',
      disabled: showFormLast,
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

const [EditForm, editFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...editFormOptions,
});

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await editFormApi.validate();
    const myValues = await editFormApi.getValues();
    console.warn('values', myValues);
    console.warn('onConfirm1111', valid);
    if (!valid) {
      message.error('请填写完整');
      return;
    }
    Modal.confirm({
      content: '确定要提交吗？',
      onOk: async () => {
        try {
          const values = await editFormApi.getValues();
          const params = {
            asnLineId: data.value.formData.asnLineId,
            ...values,
          };
          console.warn('params', params);
          changeLot(params)
            .then((res) => {
              if (res && res.success) {
                message.success('修改成功');
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
  showConfirmButton: showForm,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      console.warn('data.value', data.value);
      selectParams.value = {};
      if (data.value.openType === 'add') {
        setTimeout(() => {
          editFormApi.setValues({
            ...data.value.formData,
            actualQuantity: data.value.formData.actualQuantity,
            storageQty: data.value.formData.storageQty,
          });
          showForm.value = data.value.formData?.showForm;
          showFormLast.value = data.value.formData?.showFormLast;
        }, 100);
        title.value = '修改批号';
      }
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst confirm-text="确定" :title="title">
    <!-- <addThreeModal /> -->
    <EditForm>
      <template #xianshishunxu="slotProps">
        <InputNumber
          v-bind="slotProps"
          :keyboard="true"
          :min="1"
          :default-value="1"
          :step="1"
          :precision="0"
          data-testid="InputNumber_xianshishunxu_addModal"
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
