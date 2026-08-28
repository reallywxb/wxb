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
      component: 'ChcSelect',
      fieldName: 'checkUser2',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '第二作业人',
      // defaultValue: '',
      componentProps: () => {
        return {
          dictUrl:
            `/warehouseAction/warehouseUserList.do?readWrite=Y&excludeSelf=Y&userType=` +
            `` +
            `&warehouseId=${modalData.value.warehouseId}`,
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
      component: 'InputPassword',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'password',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '密码',
      rules: 'required',
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
    const checkUser2 = formValues.checkUser2;
    const password = formValues.password;
    if (!checkUser2 || checkUser2 === '') {
      message.warning('人员不可为空!');
      return;
    }
    if (!password || password === '') {
      message.warning('密码不可为空!');
      return;
    }
    const params = {
      checkUser2,
      password,
    };
    Modal.confirm({
      title: '提示',
      content: '确认批准吗？',
      onOk: () => {
        requestFormClient
          .post(`/userBaseHandleAction/checkPassword.do`, params)
          .then((res) => {
            if (res && res.success) {
              message.success('成功！');
              modalApi.close();
              props.afterSubmit();
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
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
      modalTitle.value = modalData.value.modalTitle;
      // setTimeout(() => {
      //   FormApi.setValues({});
      // }, 100);
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
          data-testid="InputNumber_xianshishunxu_checkUserModal"
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
