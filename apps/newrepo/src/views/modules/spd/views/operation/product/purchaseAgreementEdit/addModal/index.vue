<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { handlePriceToFixedTwo } from '#/utils/util';

import { saveProductOrg } from '../api';

interface ModalProps {
  afterSubmit: () => void;
}
const props = defineProps<ModalProps>();

const data = ref();
const title = ref('');
// 是否展示表单
const showForm = ref(false);
const showFormLast = ref(false);
const actualQuantity = ref();
const storageQty = ref();
const productId = ref<null | number | string>(null);
const editFormOptions: VbenFormProps = {
  fieldMappingTime: [
    ['dateOrdered', ['contractDateFrom', 'contractDateTo'], 'YYYY-MM-DD'],
  ],
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'w-[160px]',
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
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品编码',
      },
      fieldName: 'productCode',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品编码',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品名称',
      },
      fieldName: 'productName',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品名称',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入规格',
      },
      fieldName: 'productSpec',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
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
      fieldName: 'manufacturerName',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '厂家',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入单位',
      },
      fieldName: 'uomName',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '单位',
      disabled: true,
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'isPurchasePriceUnify',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '统一定价',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入零售价',
      },
      fieldName: 'priceList',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '零售价',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采购价',
      },
      fieldName: 'pricePO',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '采购价',
      disabled: true,
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/vendor.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择供应商',
          onChange(val: any, option: any) {
            console.warn('vendorId', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'vendorId',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '供应商',
      rules: 'required',
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'isDefault',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '默认供应商',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入折扣率',
      },
      fieldName: 'discountRate',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '折扣率',
      disabled: false,
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入效期预警天数',
      },
      fieldName: 'guaranteeDaysMin',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '效期预警天数',
      disabled: false,
      rules: 'required',
    },
    {
      component: 'DateGroup',
      fieldName: 'dateOrdered',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '创建时间',
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

const [EditForm, editFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    // labelClass: 'w-[190px]',
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
    if (!valid) {
      message.error('请填写完整');
      return;
    }
    try {
      const values = await editFormApi.getValues();
      values.isPurchasePriceUnify = values.isPurchasePriceUnify ? 'Y' : 'N';
      values.isDefault = values.isDefault ? 'Y' : 'N';
      values.priceList &&
        (values.priceList = handlePriceToFixedTwo(values.priceList));
      values.pricePO &&
        (values.pricePO = handlePriceToFixedTwo(values.pricePO));
      const params = {
        ...values,
        productId: productId.value,
        isActive: 'Y',
      };
      const response = await saveProductOrg(params);
      if (response.success) {
        modalApi.close();
        message.success('新增成功');
        props.afterSubmit();
      } else {
        message.error(response.msg || '新增失败');
      }
    } catch (error) {
      console.warn('err', error);
    }
  },
  showConfirmButton: showForm,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      editFormApi.resetForm();
      const formData = {
        ...data.value.formData,
        actualQuantity: data.value.formData.actualQuantity,
        storageQty: data.value.formData.storageQty,
      };
      productId.value = formData.productId;
      formData.isPurchasePriceUnify = formData.isPurchasePriceUnify === 'Y';
      if (formData.priceList) {
        formData.priceList = handlePriceToFixedTwo(formData.priceList);
      }
      if (formData.pricePO) {
        formData.pricePO = handlePriceToFixedTwo(formData.pricePO);
      }
      formData.vendorId = null;
      formData.discountRate = 0;
      if (data.value.openType === 'add') {
        editFormApi.setValues(formData);
        title.value = '新增';
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      }
    } else {
      title.value = '';
      showForm.value = false;
      showFormLast.value = false;
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst confirm-text="确定" :title="title">
    <EditForm />
  </ModalFirst>
</template>

<style scoped lang="scss"></style>
