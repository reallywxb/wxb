<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveProductControlLevel } from '../api';

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
const dictId = ref<null | number | string>(null);
const dictLineId = ref<null | number | string>(null);
const invoiceMethodRuleId = ref<null | number | string>(null);
const value = ref<null | number | string>(null);

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
      fieldName: 'name',
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
      fieldName: 'code',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '编码',
      rules: 'required',
      disabled: false,
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/productAction/productCategoryList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择商品类别',
          // mode: 'multiple',
          onChange(val: any, option: any) {
            console.warn('productCategory', val, option);
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
      fieldName: 'productCategoryId',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '商品类别',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入序号',
      },
      fieldName: 'seqNo',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '序号',
      disabled: false,
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=1000480',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: false,
          placeholder: '请选择开票方式',
          onChange(val: any, option: any) {
            console.warn('productControlLevel', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: false,
          chooseAllLabel: '请选择',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'invoiceMethod',
      label: '开票方式',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      // disabled: showFormLast,
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: '请输入描述',
      },
      fieldName: 'description',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '描述',
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
      const params = {
        ...values,
        dictId: dictId.value,
        dictLineId: dictLineId.value,
        invoiceMethodRuleId: invoiceMethodRuleId.value,
        value: value.value,
        // productCategoryId: Array.isArray(values.productCategoryId)
        //   ? values.productCategoryId.join(',')
        //   : Object.values(values.productCategoryId || {}).join(','),
      };
      const response = await saveProductControlLevel(params);
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
      if (data.value.openType === 'add') {
        editFormApi.setValues({
          ...data.value.formData,
          actualQuantity: data.value.formData.actualQuantity,
          storageQty: data.value.formData.storageQty,
        });
        title.value = '新增';
        dictId.value = null;
        dictLineId.value = null;
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      } else {
        editFormApi.setValues({
          ...data.value.formData,
          actualQuantity: data.value.formData.actualQuantity,
          storageQty: data.value.formData.storageQty,
          // productCategoryId: data.value.formData.productCategoryId
          //   ? data.value.formData.productCategoryId
          //       .split(',')
          //       .map((s) => Number(s.trim()))
          //   : null,
        });
        title.value = '编辑';
        dictId.value = data.value.formData?.dictId || null;
        dictLineId.value = data.value.formData?.dictLineId || null;
        invoiceMethodRuleId.value =
          data.value.formData?.invoiceMethodRuleId || null;
        value.value = data.value.formData?.value || null;
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      }
    } else {
      title.value = '';
      showForm.value = false;
      showFormLast.value = false;
      dictId.value = null;
      dictLineId.value = null;
      invoiceMethodRuleId.value = null;
      value.value = null;
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
