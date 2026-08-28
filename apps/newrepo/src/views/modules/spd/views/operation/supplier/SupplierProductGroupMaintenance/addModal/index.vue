<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveVendorProductControl } from '../api';

const data = ref();
const title = ref('');
// 是否展示表单
const showForm = ref(false);
const showFormLast = ref(false);
const actualQuantity = ref();
const storageQty = ref();
const parentRowData = ref<any>(null);
const roleGridApiRef = ref<any>(null);

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
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'bpartnerCode',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '供应商编码',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'name',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '供应商名称',
      disabled: true,
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=1000244',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: false,
          placeholder: '请选择商品组',
          onChange(val: any, option: any) {
            console.warn('productControlLevel', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productControlLevel',
      label: '商品组',
      formItemClass: 'col-span-12 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
      // disabled: showFormLast,
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
    if (!valid) {
      message.error('请填写完整');
      return;
    }
    try {
      const values = await editFormApi.getValues();
      const { bpartnerID, isActive } = parentRowData.value;
      const params = {
        ...values,
        bpartnerID,
        isActive,
      };
      const response = await saveVendorProductControl(params);
      if (response.success) {
        if (roleGridApiRef.value) {
          await roleGridApiRef.value.query({
            bpartnerID,
          });
        }
        modalApi.close();
        message.success('添加成功');
      } else {
        message.error(response.msg || '添加失败');
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
      parentRowData.value = data.value.selectedParentRow;
      roleGridApiRef.value = data.value.roleGridApi;

      selectParams.value = {};
      if (data.value.openType === 'add') {
        editFormApi.setValues({
          ...data.value.formData,
          actualQuantity: data.value.formData.actualQuantity,
          storageQty: data.value.formData.storageQty,
          name: parentRowData.value.name,
          bpartnerCode: parentRowData.value.bpartnerCode,
        });
        title.value = '新增';
        showForm.value = data.value.formData?.showForm;
        showFormLast.value = data.value.formData?.showFormLast;
      }
    } else {
      roleGridApiRef.value = null;
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
