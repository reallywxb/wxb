<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const modalData = ref<Record<string, any>>({});
const formType = ref<'ADD' | 'EDIT'>('ADD');
const FormOptions: VbenFormProps = {
  compact: true,
  commonConfig: {
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 130,
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
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'ChcSelect',
      fieldName: 'careLevel',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '养护级别',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000587',
          placeholder: '请选择养护级别',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'careDays',
      label: '养护周期',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        placeholder: '请输入养护周期',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'nearGuaCareDays',
      label: '近效期养护周期',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        placeholder: '请输入近效期养护周期',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'tipsDays',
      label: '养护提醒天数',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        placeholder: '请输入养护提醒天数',
      },
    },
  ],
};

const [BaseForm, formApi] = useVbenForm({
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

  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '取消',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      formType.value = modalData.value?.type || 'ADD';
      console.warn('onOpenChange modalData', modalData.value);
      console.warn('onOpenChange formType', formType.value);

      if (formType.value === 'EDIT') {
        setTimeout(async () => {
          await formApi.setValues({
            ...modalData.value?.row,
            nearGuaCareDays: modalData.value?.row?.nearGuarDays,
          });
          // 重新获取养护级别下拉列表
          formApi.updateSchema([
            {
              fieldName: 'careLevel',
              componentProps: () => {
                return {
                  dictUrl: '/baseHandleAction/refList.do?id=1000587',
                  placeholder: '请选择养护级别',
                  paginate: false,
                  immediate: true,
                  labelField: 'name',
                  valueField: 'id',
                  disabled: true,
                  afterFetch(res: any) {
                    return { ...res, rows: undefined, records: res.rows };
                  },
                };
              },
            },
          ]);
          // setTimeout(() => {
          //   formApi.updateSchema([
          //     {
          //       fieldName: 'careLevel',
          //       componentProps: {
          //         disabled: false,
          //       },
          //     },
          //   ]);
          // }, 100);
        }, 100);
      } else {
        setTimeout(async () => {
          // 重新获取养护级别下拉列表
          formApi.updateSchema([
            {
              fieldName: 'careLevel',
              componentProps: () => {
                return {
                  dictUrl: '/baseHandleAction/refList.do?id=1000587',
                  placeholder: '请选择养护级别',
                  paginate: false,
                  immediate: true,
                  labelField: 'name',
                  valueField: 'id',
                  afterFetch(res: any) {
                    return { ...res, rows: undefined, records: res.rows };
                  },
                };
              },
            },
          ]);
        }, 100);
      }
    }
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await formApi.getValues();
    console.warn('onConfirmformValues', formValues);

    if (!formValues.careLevel) {
      message.error('养护级别不可为空');
      return;
    }
    if (!formValues.careDays) {
      message.error('养护周期不可为空');
      return;
    }
    if (!formValues.nearGuaCareDays) {
      message.error('近效期养护周期不可为空');
      return;
    }
    if (!formValues.tipsDays) {
      message.error('养护周期提醒天数不可为空');
      return;
    }
    const params = {
      careLevel: formValues.careLevel,
      careDays: formValues.careDays,
      nearGuaCareDays: formValues.nearGuaCareDays,
      tipsDays: formValues.tipsDays,
    };
    Modal.confirm({
      title: '提示',
      content: '确定要提交吗？',
      onOk: async () => {
        try {
          const res = await requestFormClient.post(
            '/productCareAction/saveCareLevel.do',
            params,
          );
          if (res?.success) {
            message.success(formType.value === 'ADD' ? '添加成功' : '修改成功');
            modalApi.close();
            modalData.value?.callback();
          }
        } catch (error) {
          console.warn('err', error);
        }
      },
    });
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst
    confirm-text="确定"
    :title="modalData?.modalTitle"
    class="w-[500px]"
  >
    <BaseForm />
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
