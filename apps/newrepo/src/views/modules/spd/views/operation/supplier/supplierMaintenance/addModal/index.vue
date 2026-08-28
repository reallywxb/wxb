<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveVendor } from '../api';

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
const bpartnerID = ref<null | number | string>(null);

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
        placeholder: '请输入供应商名称',
      },
      fieldName: 'name',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '供应商名称',
      rules: 'required',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入供应商编码',
      },
      fieldName: 'bpartnerCode',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '供应商编码',
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
          mode: 'multiple',
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
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '商品类别',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入搜索码',
      },
      fieldName: 'value',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '搜索码',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入联系人',
      },
      fieldName: 'contact',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '联系人',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入联系电话',
      },
      fieldName: 'contactPhone',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '联系电话',
      disabled: false,
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: '请输入地址',
      },
      fieldName: 'address',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '地址',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入联系人证件号',
      },
      fieldName: 'contactIdNo',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '联系人证件号',
      disabled: false,
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入账期(月)',
      },
      fieldName: 'bookPeriod',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '账期(月)',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入开户行',
      },
      fieldName: 'bankName',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '开户行',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入银行账号',
      },
      fieldName: 'bankAccountNo',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '银行账号',
      disabled: false,
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
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入码上放心refEntID',
      },
      fieldName: 'refEntID',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '码上放心refEntID',
      disabled: false,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入码上放心entID',
      },
      fieldName: 'entID',
      formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '码上放心entID',
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
        bpartnerID: bpartnerID.value,
        productCategoryId: Array.isArray(values.productCategoryId)
          ? values.productCategoryId.join(',')
          : Object.values(values.productCategoryId || {}).join(','),
      };
      const response = await saveVendor(params);
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
        bpartnerID.value = null;
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      } else {
        editFormApi.setValues({
          ...data.value.formData,
          actualQuantity: data.value.formData.actualQuantity,
          storageQty: data.value.formData.storageQty,
          productCategoryId: data.value.formData.productCategoryId
            ? data.value.formData.productCategoryId
                .split(',')
                .map((s) => Number(s.trim()))
            : null,
        });
        title.value = '编辑';
        bpartnerID.value = data.value.formData?.bpartnerID || null;
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      }
    } else {
      title.value = '';
      showForm.value = false;
      showFormLast.value = false;
      bpartnerID.value = null;
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
