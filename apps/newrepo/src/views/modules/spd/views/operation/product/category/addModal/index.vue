<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveCategory } from '../api';

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
const M_Product_Category_ID = ref<null | number | string>(null);

const editFormOptions: VbenFormProps = {
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
        placeholder: '请输入名称',
      },
      fieldName: 'Name',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '名称',
      rules: 'required',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入编码',
      },
      fieldName: 'Value',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '编码',
      rules: 'required',
      disabled: false,
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入价格精度',
      },
      fieldName: 'PricePrecision',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '价格精度',
      rules: 'required',
      disabled: false,
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?dictId=material.categoryType',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'categoryType', // 商品名称
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '商品属性',
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'IsPictureOnLine',
      formItemClass: 'col-span-4 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '正常采购证照管控',
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'IsPictureDownLine',
      formItemClass: 'col-span-4 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '线下采购证照管控',
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'IsActive',
      formItemClass: 'col-span-4 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否有效',
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: '请输入备注',
      },
      fieldName: 'Description',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '备注',
      disabled: false,
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
      values.IsPictureOnLine = values.IsPictureOnLine ? 'Y' : 'N';
      values.IsPictureDownLine = values.IsPictureDownLine ? 'Y' : 'N';
      values.IsActive = values.IsActive ? 'Y' : 'N';
      const params = {
        ...values,
        M_Product_Category_ID: M_Product_Category_ID.value,
      };
      const response = await saveCategory(params);
      if (response.success) {
        modalApi.close();
        message.success(`${title.value}成功`);
        props.afterSubmit();
      } else {
        message.error(response.msg || `${title.value}失败`);
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
      formData.IsPictureOnLine = formData.IsPictureOnLine === 'Y';
      formData.IsPictureDownLine = formData.IsPictureDownLine === 'Y';
      formData.IsActive = formData.IsActive === 'Y';
      if (data.value.openType === 'add') {
        editFormApi.setValues(formData);
        title.value = '新增';
        M_Product_Category_ID.value = null;
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      } else {
        editFormApi.setValues(formData);
        title.value = '编辑';
        M_Product_Category_ID.value =
          data.value.formData?.M_Product_Category_ID || null;
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      }
    } else {
      title.value = '';
      showForm.value = false;
      showFormLast.value = false;
      M_Product_Category_ID.value = null;
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
